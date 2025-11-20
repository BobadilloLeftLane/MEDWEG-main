import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Translation } from '../i18n/translations';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get saved language from localStorage or default to 'de'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('medweg-language');
    return (saved === 'en' || saved === 'de') ? saved : 'de';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('medweg-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
