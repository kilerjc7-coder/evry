"use client";

import { useState } from "react";
import { AthleteApp } from "@/components/athlete/athlete-app";
import { Landing, type Role } from "@/components/landing";
import { ProApp } from "@/components/pro/pro-app";

export default function HomePage() {
  const [role, setRole] = useState<Role | null>(null);

  if (role === "athlete") {
    return <AthleteApp onExit={() => setRole(null)} />;
  }

  if (role === "pro") {
    return <ProApp onExit={() => setRole(null)} />;
  }

  return <Landing onSelect={setRole} />;
}
