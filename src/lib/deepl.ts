import axios, { AxiosError } from 'axios';

// Define interfaces for DeepL API responses
interface DeepLTranslation {
  detected_source_language: string;
  text: string;
}

interface DeepLResponse {
  translations: DeepLTranslation[];
}

export interface Language {
  code: string;
  name: string;
}

// DeepL API client
export const translateText = async (
  text: string, 
  targetLang: string, 
  apiKey: string
): Promise<string> => {
  try {
    const response = await axios.post<DeepLResponse>(
      'https://api-free.deepl.com/v2/translate',
      {
        text: [text],
        target_lang: targetLang,
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.translations[0].text;
  } catch (error) {
    console.error('DeepL translation error:', error as AxiosError);
    // Return original text if translation fails
    return text;
  }
};

// Cache translations to minimize API calls
const translationCache: Map<string, string> = new Map();

export const translateWithCache = async (
  text: string, 
  targetLang: string, 
  apiKey: string
): Promise<string> => {
  // Skip translation if text is empty or target language is English
  if (!text || targetLang === 'EN') return text;
  
  // Generate a cache key
  const cacheKey = `${text}_${targetLang}`;
  
  // Check if translation is in cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey) || text;
  }
  
  // Perform translation
  const translatedText = await translateText(text, targetLang, apiKey);
  
  // Store in cache
  translationCache.set(cacheKey, translatedText);
  
  return translatedText;
};

// Available languages in DeepL
export const availableLanguages: Language[] = [
  { code: 'EN', name: 'English' },
  { code: 'DE', name: 'German' },
  { code: 'FR', name: 'French' },
  { code: 'ES', name: 'Spanish' },
  { code: 'IT', name: 'Italian' },
  { code: 'NL', name: 'Dutch' },
  { code: 'PL', name: 'Polish' },
  { code: 'PT', name: 'Portuguese' },
  { code: 'RU', name: 'Russian' },
  { code: 'JA', name: 'Japanese' },
  { code: 'ZH', name: 'Chinese' },
];

export const mightNeedTranslation = (text: string, targetLang: string): boolean => {
  // Skip for very short strings
  if (!text || text.length < 5) return false;
  
  // If target is English, we typically don't need translation for English UI
  if (targetLang === 'EN') return false;
  
  // This is a very simple check - it could be improved with more sophisticated language detection
  // For now, we'll assume if we're not using English as target, most messages need translation
  return true;
};

// Function to get language information by code
export const getLanguageByCode = (code: string): Language => {
  return availableLanguages.find(lang => lang.code === code) || { code: 'EN', name: 'English' };
};