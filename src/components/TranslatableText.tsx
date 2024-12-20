import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageStore } from '../store/languageStore';

interface TranslatableTextProps {
  text: string;
  className?: string;
}

export function TranslatableText({ text, className = '' }: TranslatableTextProps) {
  const [translatedText, setTranslatedText] = useState(text);
  const { translate, isTranslating } = useTranslation();
  const { currentLanguage } = useLanguageStore();

  useEffect(() => {
    const performTranslation = async () => {
      const result = await translate(text);
      setTranslatedText(result);
    };

    performTranslation();
  }, [text, currentLanguage]);

  return (
    <span className={`${className} ${isTranslating ? 'opacity-70' : ''}`}>
      {translatedText}
    </span>
  );
}