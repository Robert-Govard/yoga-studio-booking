import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Language } from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readStoredLanguage(): Language {
  try {
    return localStorage.getItem('language') === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

function resolve(key: string, language: Language): string {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations[language]);
  return typeof value === 'string' ? value : key;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  function setLanguage(next: Language) {
    setLanguageState(next);
    try {
      localStorage.setItem('language', next);
    } catch {
      // Ignore storage errors (private browsing, disabled storage, etc.)
    }
  }

  function t(key: string, vars?: Record<string, string>) {
    let text = resolve(key, language);
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, value);
      }
    }
    return text;
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
