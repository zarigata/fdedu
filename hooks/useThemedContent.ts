

import { useAppContext } from './useAppContext';
import { THEME_CONTENT_KEYS } from '../data/themeData';
import { useTranslation } from './useTranslation';
import { ThemeContent } from '../types';

export const useThemedContent = (): ThemeContent => {
    const { user } = useAppContext();
    const { t } = useTranslation();

    const activeThemeId = user?.activeThemeId && THEME_CONTENT_KEYS[user.activeThemeId] 
        ? user.activeThemeId 
        : 'theme-default';
    
    const keys = THEME_CONTENT_KEYS[activeThemeId];

    return {
        store: t(keys.storeKey),
        games: t(keys.gamesKey),
        trainer: t(keys.trainerKey),
        tutor: t(keys.tutorKey),
        studyDecks: t(keys.studyDecksKey),
    };
};