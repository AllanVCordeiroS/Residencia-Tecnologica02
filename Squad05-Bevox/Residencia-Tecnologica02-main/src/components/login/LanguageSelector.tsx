"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { languagePreferenceSchema } from "@/schemas/preferences";
import { readInterfacePreferences, saveInterfacePreferences } from "@/services/settings";

type LanguageSelectorProps = { variant?: "light" | "dark" };

// The preference schema and the interface currently support only Brazilian Portuguese.
const language = languagePreferenceSchema.value;

export default function LanguageSelector({ variant = "light" }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    optionRef.current?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function closeAndFocus() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocus();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      optionRef.current?.focus();
    }
  }

  function selectLanguage() {
    try {
      // Read at selection time so other preferences saved since opening stay intact.
      const preferences = readInterfacePreferences();
      saveInterfacePreferences({
        ...preferences,
        user: { ...preferences.user, language },
      });
      setError("");
    } catch {
      setError("Não foi possível salvar o idioma. Português (Brasil) continua ativo nesta página.");
    }
    closeAndFocus();
  }

  return (
    <div
      ref={rootRef}
      className="relative text-xs"
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        aria-label="Selecionar idioma: Português (Brasil)"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-options` : undefined}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-md px-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${variant === "dark" ? "text-slate-100 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100 dark:text-foreground-muted dark:hover:bg-surface-raised"}`}
      >
        <Globe aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>Português (BR)</span>
        <ChevronDown aria-hidden="true" className="h-3 w-3" />
      </button>

      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label="Idioma da interface"
          className="absolute right-0 top-full z-20 mt-2 w-56 max-w-[calc(100vw-3rem)] rounded-lg border border-slate-200 bg-white p-1 text-slate-700 shadow-lg dark:border-line dark:bg-surface-raised dark:text-foreground"
        >
          <button
            ref={optionRef}
            type="button"
            role="option"
            aria-selected={true}
            lang={language}
            onClick={selectLanguage}
            className="flex w-full items-center justify-between gap-2 rounded-md bg-blue-50 px-3 py-2 text-left text-blue-800 focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-blue-950 dark:text-blue-200"
          >
            Português (Brasil) — PT-BR
            <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}

      <p role="status" className="sr-only">{error}</p>
    </div>
  );
}
