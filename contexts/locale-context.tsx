"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import en from "@/messages/en.json";
import hr from "@/messages/hr.json";
import de from "@/messages/de.json";

export type Locale = "en" | "hr" | "de";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

const messages: Record<Locale, Messages> = { en, hr, de };

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hr: "Hrvatski",
  de: "Deutsch",
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getNestedValue(obj: Messages, path: string): string {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = current[part];
  }
  return typeof current === "string" ? current : path;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("flowity_locale") as Locale | null;
      if (saved && saved in messages) {
        setLocaleState(saved);
      }
    } catch {
      // localStorage not available
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("flowity_locale", l);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      let str = getNestedValue(messages[locale], key);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{{${k}}}`, v);
        }
      }
      return str;
    },
    [locale]
  );

  // Suppress hydration mismatch by rendering with "en" on server
  const value: LocaleContextValue = {
    locale: mounted ? locale : "en",
    setLocale,
    t: mounted
      ? t
      : (key, params) => {
          let str = getNestedValue(messages["en"], key);
          if (params) {
            for (const [k, v] of Object.entries(params)) {
              str = str.replace(`{{${k}}}`, v);
            }
          }
          return str;
        },
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within <LocaleProvider>");
  return ctx;
}
