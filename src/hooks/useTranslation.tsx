import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/Store';
import { selectLanguage, selectApiKey, selectIsTranslationAvailable } from '@/slices/languageSlice';
import { translateWithCache, mightNeedTranslation } from '@/lib/deepl';

interface TranslationOptions {
  skipTranslation?: boolean;
  forceTranslation?: boolean;
}

interface TranslationResult {
  text: string;
  isLoading: boolean;
  error: Error | null;
}

// Custom hook for translating text
export const useTranslation = (
  originalText: string, 
  options: TranslationOptions = {}
): TranslationResult => {
  const language = useAppSelector(selectLanguage);
  const apiKey = useAppSelector(selectApiKey);
  const isTranslationAvailable = useAppSelector(selectIsTranslationAvailable);
  
  const [translatedText, setTranslatedText] = useState<string>(originalText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Options
  const {
    skipTranslation = false,   // Skip translation entirely
    forceTranslation = false,  // Force translation even if language seems the same
  } = options;
  
  useEffect(() => {
    // Don't translate if not needed
    if (
      !originalText || 
      skipTranslation || 
      !isTranslationAvailable || 
      (language === 'EN' && !forceTranslation)
    ) {
      setTranslatedText(originalText);
      return;
    }
    
    // Only translate if it seems necessary
    if (!forceTranslation && !mightNeedTranslation(originalText, language)) {
      setTranslatedText(originalText);
      return;
    }
    
    // Translate the text
    const doTranslation = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await translateWithCache(originalText, language, apiKey);
        setTranslatedText(result);
      } catch (err) {
        console.error('Translation error:', err);
        setError(err as Error);
        setTranslatedText(originalText); // Fall back to original text
      } finally {
        setIsLoading(false);
      }
    };
    
    doTranslation();
  }, [originalText, language, apiKey, isTranslationAvailable, skipTranslation, forceTranslation]);
  
  return { text: translatedText, isLoading, error };
};

// Type for messages with a text field
interface BaseMessage {
  id: string;
  [key: string]: any;
}

interface UseTranslateMessagesResult<T extends BaseMessage> {
  messages: T[];
  isLoading: boolean;
}

// For translating multiple messages at once (like chat messages)
export const useTranslateMessages = <T extends BaseMessage>(
  originalMessages: T[], 
  textKey: string = 'text'
): UseTranslateMessagesResult<T> => {
  const language = useAppSelector(selectLanguage);
  const apiKey = useAppSelector(selectApiKey);
  const isTranslationAvailable = useAppSelector(selectIsTranslationAvailable);
  
  const [translatedMessages, setTranslatedMessages] = useState<T[]>(originalMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Don't translate if not needed
    if (!originalMessages?.length || !isTranslationAvailable || language === 'EN') {
      setTranslatedMessages(originalMessages);
      return;
    }
    
    const translateAllMessages = async () => {
      setIsLoading(true);
      
      try {
        // Create a new array with translated messages
        const translated = await Promise.all(
          originalMessages.map(async (message) => {
            // Skip translation for system messages
            if (message.sender === 'system') {
              return message;
            }
            
            // Only translate the message text
            const originalText = message[textKey];
            
            if (originalText && mightNeedTranslation(originalText, language)) {
              const translatedText = await translateWithCache(
                originalText, 
                language, 
                apiKey
              );
              
              return {
                ...message,
                [textKey]: translatedText,
                originalText: originalText, // Keep original for reference
              };
            }
            
            return message;
          })
        );
        
        setTranslatedMessages(translated as T[]);
      } catch (error) {
        console.error('Error translating messages:', error);
        setTranslatedMessages(originalMessages); // Fall back to originals
      } finally {
        setIsLoading(false);
      }
    };
    
    translateAllMessages();
  }, [originalMessages, language, apiKey, isTranslationAvailable, textKey]);
  
  return { messages: translatedMessages, isLoading };
};

// Component for inline text translation
interface TranslatedTextProps {
  text: string;
  options?: TranslationOptions;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ text, options }) => {
  const { text: translatedText, isLoading } = useTranslation(text, options);
  
  if (isLoading) {
    return <span className="opacity-70">{text}</span>;
  }
  
  return <>{translatedText}</>;
};