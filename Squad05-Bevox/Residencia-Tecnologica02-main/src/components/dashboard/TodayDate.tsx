"use client";

import { useSyncExternalStore } from "react";
import { hojePorExtenso } from "@/lib/dashboard";

const subscribe = () => () => {};
const snapshot = () => hojePorExtenso();
const serverSnapshot = () => "";

/** Data de hoje (fuso de Recife), calculada no navegador para não congelar no build. */
export default function TodayDate() {
  const hoje = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return <span>{hoje || "\u00A0"}</span>;
}
