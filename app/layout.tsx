import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EVRY — Entrenamiento en Sevilla",
  description:
    "PWA de sesiones y microciclos con educadores verificados, créditos 1 Cr = 1€ y mapa PostGIS en Sevilla.",
  applicationName: "EVRY",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EVRY",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
