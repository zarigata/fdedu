
import { useAppContext } from './useAppContext';
import { Language } from '../types';

// Simple replace function for placeholders like {name}
const replace = (str: string, replacements: Record<string, string | number>): string => {
    if (!str) return '';
    if (!replacements) return str;
    return str.replace(/\{(\w+)\}/g, (placeholder, key) => {
        return replacements[key] !== undefined ? String(replacements[key]) : placeholder;
    });
};

export const useTranslation = () => {
    const { language, translations } = useAppContext();
    
    const t = (key: string, replacements: Record<string, string | number> = {}): string => {
        // The AppProvider will show a loading screen until translations are loaded,
        // so we can assume `translations` is not null here.
        // We add a fallback just in case.
        if (!translations) {
            return key;
        }
        const langFile = translations[language] || translations.en;
        const value = langFile[key] || key;
        return replace(value, replacements);
    };

    return { t, language };
};
