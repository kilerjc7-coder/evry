-- Habilitar extensión geoespacial PostGIS para el mapa interactivo en Sevilla
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tipos enumerados para blindaje regulatorio y de negocio
CREATE TYPE qualification_type AS ENUM ('CAFYD', 'TSEAS_TSAF_TAFAD', 'CERTIFICADO_PROFESIONALIDAD');
CREATE TYPE saas_tier_type AS ENUM ('LEVEL_1_FREE', 'LEVEL_2_PRO', 'LEVEL_3_BUSINESS');
CREATE TYPE loyalty_tier_type AS ENUM ('BRONCE', 'PLATA', 'ORO', 'PLATINO');
CREATE TYPE session_modality AS ENUM ('OUTDOOR_GREEN', 'INDOOR_B2B', 'ONLINE_SYNC');
CREATE TYPE session_format AS ENUM ('DROP_IN', 'MICROCICLO_PACK');
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'RESCUE_PENDING_12H', 'CONFIRMED', 'CANCELLED');

-- 1. Tabla de Perfiles de Usuarios (B2C) y Monedero de Créditos
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    loyalty_tier loyalty_tier_type DEFAULT 'BRONCE',
    completed_sessions_count INT DEFAULT 0,
    credits_balance INT DEFAULT 0 CHECK (credits_balance >= 0),
    credits_expires_at TIMESTAMPTZ, -- Vigencia de 6 meses renovable en cada recarga
    accumulated_net_margin NUMERIC(10,2) DEFAULT 0.00, -- Para regla de cobertura 4x (máx 25% reinversión)
    aptitude_declaration_signed BOOLEAN DEFAULT FALSE, -- Sin almacenar historial médico (Art. 9 RGPD)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Profesionales y Centros Verificados (Oferta B2B / Autónomos)
CREATE TABLE public.trainer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    qualification qualification_type NOT NULL,
    colef_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE, -- Retenido en Portal de Verificación 24-48h
    src_policy_number TEXT NOT NULL,
    src_coverage_amount NUMERIC(12,2) NOT NULL CHECK (src_coverage_amount >= 150000),
    src_covers_exploitation_and_pro BOOLEAN DEFAULT FALSE,
    src_expiration_date DATE NOT NULL,
    is_active_and_visible BOOLEAN DEFAULT FALSE,
    lopivi_verified BOOLEAN DEFAULT FALSE, -- Art. 57 LO 8/2021 para menores
    saas_tier saas_tier_type DEFAULT 'LEVEL_1_FREE',
    stripe_account_id TEXT UNIQUE,
    tax_id_nif TEXT, -- Para Modelo 238 (DAC7) y VeriFactu
    vat_exempt_art20 BOOLEAN DEFAULT TRUE, -- Exención enseñanza deportiva vs 21% IVA
    retention_rate_score NUMERIC(5,2) DEFAULT 100.00, -- Métrica reina para SEO in-app
    badges TEXT[] DEFAULT '{}', -- Ej: ['VERIFICADO', '5_ESTRELLAS', 'MAS_SOLICITADO']
    rating NUMERIC(3,2) DEFAULT 5.00
);

-- Trigger automático: Interruptor de Caducidad de SRC
CREATE OR REPLACE FUNCTION check_src_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.src_expiration_date <= CURRENT_DATE OR NEW.is_verified = FALSE OR NEW.src_covers_exploitation_and_pro = FALSE THEN
        NEW.is_active_and_visible := FALSE;
    ELSE
        NEW.is_active_and_visible := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_src_validity
BEFORE INSERT OR UPDATE ON public.trainer_profiles
FOR EACH ROW EXECUTE FUNCTION check_src_expiration();

-- 3. Tabla de Sesiones y Microciclos Geolocalizados (PostGIS)
CREATE TABLE public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    modality session_modality NOT NULL,
    format session_format DEFAULT 'DROP_IN',
    weeks_duration INT DEFAULT 1 CHECK (weeks_duration BETWEEN 1 AND 8),
    functional_tags TEXT[] NOT NULL, -- Ej: ['movilidad_articular', 'bajo_impacto', 'fortalecimiento_core']
    suitable_for_special_populations BOOLEAN DEFAULT FALSE,
    -- Ubicación como "Punto de encuentro propuesto por el profesional independiente"
    meeting_point_label TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    public_domain_declaration_signed BOOLEAN DEFAULT FALSE, -- Declaración responsable GUMA/IMD Sevilla
    encrypted_online_url TEXT, -- Oculto hasta confirmación de reserva
    start_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL, -- Libertad del creador (Doctrina TJUE)
    price_credits INT NOT NULL CHECK (price_credits > 0), -- 1 crédito = 1 €
    rate_floor_credits INT, -- Suelo para SmartRate en Centros B2B
    min_capacity INT NOT NULL CHECK (min_capacity >= 1),
    max_capacity INT NOT NULL CHECK (max_capacity >= min_capacity),
    current_enrolled INT DEFAULT 0,
    allows_minors BOOLEAN DEFAULT FALSE,
    enable_12h_rescue_rule BOOLEAN DEFAULT TRUE,
    rescue_zero_commission_active BOOLEAN DEFAULT FALSE,
    status session_status DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_location ON public.training_sessions USING GIST (location);
CREATE INDEX idx_sessions_tags ON public.training_sessions USING GIN (functional_tags);

-- 4. Función RPC para Búsqueda Geoespacial PostGIS con Restricción CAFYD (Art. 9 RGPD / LOPS)
CREATE OR REPLACE FUNCTION search_compatible_sessions(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION,
    search_tags TEXT[],
    require_cafyd_only BOOLEAN
)
RETURNS SETOF public.training_sessions AS $$
BEGIN
    RETURN QUERY
    SELECT s.*
    FROM public.training_sessions s
    JOIN public.trainer_profiles t ON s.trainer_id = t.id
    WHERE t.is_active_and_visible = TRUE
      AND t.src_expiration_date > CURRENT_DATE
      AND s.status IN ('SCHEDULED', 'CONFIRMED', 'RESCUE_PENDING_12H')
      AND (NOT require_cafyd_only OR t.qualification = 'CAFYD')
      AND (
          s.modality = 'ONLINE_SYNC'
          OR ST_DWithin(
              s.location,
              ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
              radius_meters
          )
      )
      AND (search_tags IS NULL OR s.functional_tags && search_tags)
    ORDER BY t.retention_rate_score DESC, s.start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función de Verificación del Techo del 25% sobre Margen Neto Acumulado (Regla 4x)
CREATE OR REPLACE FUNCTION can_unlock_loyalty_reward(p_user_id UUID, p_reward_cost_eur NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
    v_margin NUMERIC;
BEGIN
    SELECT accumulated_net_margin INTO v_margin
    FROM public.user_profiles
    WHERE id = p_user_id;

    -- El margen neto histórico debe superar al menos en 4 veces el coste de la recompensa
    RETURN (COALESCE(v_margin, 0) >= (p_reward_cost_eur * 4));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
