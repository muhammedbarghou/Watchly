import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/Store';
import { 
  selectLanguage, 
  selectCurrentLanguageName,
  selectIsTranslationAvailable,
  setLanguage 
} from '@/slices/languageSlice';
import { availableLanguages } from '@/lib/deepl';

const LanguageSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const currentLanguageName = useAppSelector(selectCurrentLanguageName);
  const isTranslationAvailable = useAppSelector(selectIsTranslationAvailable);
  
  const handleLanguageChange = (langCode: string) => {
    dispatch(setLanguage(langCode));
    toast.success(`Language changed to ${availableLanguages.find(lang => lang.code === langCode)?.name}`);
  };
  
  if (!isTranslationAvailable) {
    return null; // Don't show the selector if translation is not available
  }
  
  return (
    <Select 
      value={language} 
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger className="w-[130px] gap-2">
        <Globe className="h-4 w-4" />
        <SelectValue placeholder={currentLanguageName} />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSettings;