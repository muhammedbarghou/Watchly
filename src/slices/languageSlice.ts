import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/Store'; // Updated path (assuming your store index file is in this location)
import { availableLanguages, Language } from '@/lib/deepl';

// Define interface for language state
interface LanguageState {
  language: string;
  apiKey: string;
  isTranslationAvailable: boolean;
}

// Function to initialize state from localStorage
const getInitialState = (): LanguageState => {
  // If running in browser environment
  if (typeof window !== 'undefined') {
    const savedApiKey = localStorage.getItem('deepl_api_key') || 'b5f20f09-894d-4f55-abbb-8dcf243fc726:fx';
    
    return {
      language: localStorage.getItem('preferred_language') || 'EN',
      apiKey: savedApiKey,
      isTranslationAvailable: Boolean(savedApiKey),
    };
  }
  
  // Default state for server-side rendering
  return {
    language: 'EN',
    apiKey: 'b5f20f09-894d-4f55-abbb-8dcf243fc726:fx', // Default API key
    isTranslationAvailable: true,
  };
};

// Create the language slice
const languageSlice = createSlice({
  name: 'language',
  initialState: getInitialState(),
  reducers: {
    // Change the current language
    setLanguage: (state, action: PayloadAction<string>) => {
      // Only set if it's a valid language code
      if (availableLanguages.some(lang => lang.code === action.payload)) {
        state.language = action.payload;
        // Update localStorage if available
        if (typeof window !== 'undefined') {
          localStorage.setItem('preferred_language', action.payload);
        }
      }
    },
    
    // Update the API key
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
      state.isTranslationAvailable = Boolean(action.payload);
      
      // Update localStorage if available
      if (typeof window !== 'undefined') {
        localStorage.setItem('deepl_api_key', action.payload);
      }
    },
  },
});

// Export actions
export const { setLanguage, setApiKey } = languageSlice.actions;

// Export selectors
export const selectLanguage = (state: RootState) => state.language.language;
export const selectApiKey = (state: RootState) => state.language.apiKey;
export const selectIsTranslationAvailable = (state: RootState) => 
  state.language.isTranslationAvailable;
export const selectCurrentLanguageName = (state: RootState) => {
  const langCode = state.language.language;
  return availableLanguages.find(lang => lang.code === langCode)?.name || 'English';
};
export const selectAvailableLanguages = () => availableLanguages;

export default languageSlice.reducer;