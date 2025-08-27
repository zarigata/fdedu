
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/Card';
import { IconGamepad, IconCoin } from '../components/Icons';
import { useThemedContent } from '../hooks/useThemedContent';
import { useTranslation } from '../hooks/useTranslation';

const GamesPage: React.FC = () => {
    const { user } = useAppContext();
    const content = useThemedContent();
    const { t } = useTranslation();

    if (!user) {
        return <p>Please log in to view this page.</p>;
    }

    return (
        <div className="container mx-auto max-w-2xl font-fredoka text-center">
            <Card className="p-12 bg-brand-purple text-white">
                <div className="flex flex-col items-center gap-6">
                    <IconGamepad />
                    <h1 className="text-6xl font-extrabold tracking-tighter">{content.games.toUpperCase()}</h1>
                    <p className="text-3xl font-bold text-brand-lime animate-pulse">{t('comingSoon').toUpperCase()}</p>
                    <p className="text-lg text-brand-blue-light/80 max-w-md">
                        {t('gamesDesc')}
                    </p>
                    <div className="mt-4 p-3 bg-yellow-300 rounded-lg border-2 border-black flex items-center space-x-2">
                        <IconCoin className="text-yellow-900" />
                        <span className="text-xl font-bold text-black">{t('yourPoints', { points: user.points })}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default GamesPage;
