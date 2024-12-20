import React from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/languages.ts';
import { useLanguageStore } from '../store/languageStore.ts';

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguageStore();

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 
                   shadow-sm border border-gray-200 transition-colors duration-200"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.flag}
          {' '}
          {SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.name}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black 
                    ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-all duration-200 z-50">
        <div className="py-1">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => setLanguage(language.code)}
              className={`w-full text-left px-4 py-2 text-sm ${
                currentLanguage === language.code
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{language.flag}</span>
              {language.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}