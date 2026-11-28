"use client";

import { useEffect, useState, type SetStateAction } from "react";
import { z } from "zod";
import { readSettings, writeSettings } from "@/services/settings";

/** Drafts load once and only reach local storage after an explicit save. */
export function useSettingsForm<T>(key: string, schema: z.ZodType<T>, defaults: T) {
  const [data, setData] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      try {
        const saved = readSettings(key, schema, defaults);
        if (mounted) { setData(saved); setReady(true); }
      } catch {
        if (mounted) setMessage("Não foi possível carregar as configurações locais. Os dados armazenados foram preservados. Recarregue para tentar novamente.");
      }
    });
    return () => { mounted = false; };
  }, [key, schema, defaults]);
  function save(value = data) {
    if (!ready) return false;
    try {
      writeSettings(key, schema, value);
      setMessage("Alterações salvas neste navegador.");
      return true;
    } catch {
      setMessage("Não foi possível salvar. Revise os campos e verifique o armazenamento do navegador.");
      return false;
    }
  }
  function field<K extends keyof T>(name: K): [T[K], (value: SetStateAction<T[K]>) => void] {
    return [data[name], (value) => {
      setData((old) => ({ ...old, [name]: typeof value === "function" ? (value as (previous: T[K]) => T[K])(old[name]) : value }));
      setMessage("");
    }];
  }
  return { data, setData, ready, message, setMessage, save, field };
}
