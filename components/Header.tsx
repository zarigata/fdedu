



import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, Theme, Language } from '../types';
import { IconUser, IconLogout, IconHome, IconShield, IconSun, IconMoon, IconStore, IconGamepad, IconCoin, IconBrainCircuit } from './Icons';
import Avatar from './Avatar';
import { useThemedContent } from '../hooks/useThemedContent';
import { useTranslation } from '../hooks/useTranslation';

const Header: React.FC = () => {
  const { user, logout, theme, toggleTheme, language, setLanguage } = useAppContext();
  const content = useThemedContent();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === UserRole.ADMIN) return '/admin';
    if (user.role === UserRole.SCHOOL_MANAGER) return '/school-manager/dashboard';
    return user.role === UserRole.TEACHER ? '/teacher/dashboard' : '/student/dashboard';
  };

  return (
    <header className="fvd-header bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg sticky top-0 z-50 border-b-4 border-black dark:border-gray-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl font-extrabold text-brand-purple hover:text-brand-pink transition-colors duration-300">
              FeVeDucation
            </Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === Theme.LIGHT ? <IconMoon /> : <IconSun />}
            </button>
             <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none font-bold"
                aria-label="Select language"
            >
                <option value="en" className="font-bold bg-white dark:bg-gray-800 text-black dark:text-white">EN</option>
                <option value="pt" className="font-bold bg-white dark:bg-gray-800 text-black dark:text-white">PT</option>
                <option value="ja" className="font-bold bg-white dark:bg-gray-800 text-black dark:text-white">JA</option>
                <option value="es" className="font-bold bg-white dark:bg-gray-800 text-black dark:text-white">ES</option>
            </select>
            {user ? (
              <>
                {user.role === UserRole.ADMIN && (
                    <Link to="/admin" className="hidden sm:flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-brand-purple font-semibold">
                        <IconShield />
                        <span>{t('admin')}</span>
                    </Link>
                )}
                 {(user.role === UserRole.STUDENT || user.role === UserRole.TEACHER) && (
                   <>
                    {user.role === UserRole.STUDENT && (
                        <>
                            <Link to="/store" className="hidden sm:flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-brand-purple font-semibold">
                                <IconStore />
                                <span>{content.store}</span>
                            </Link>
                            <Link to="/games" className="hidden sm:flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-brand-purple font-semibold">
                                <IconGamepad />
                                <span>{content.games}</span>
                            </Link>
                        </>
                    )}
                    <div className="hidden sm:flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-yellow-300/80 dark:bg-yellow-500/80 px-2 py-1 border-2 border-black rounded-lg" title={t('points')}>
                            <IconCoin className="text-yellow-700 dark:text-yellow-900" />
                            <span className="font-bold text-black">{user.points}</span>
                        </div>
                         <div className="flex items-center space-x-1 bg-brand-blue-light/80 dark:bg-brand-blue-dark/80 px-2 py-1 border-2 border-black rounded-lg" title="AI Tokens">
                            <IconBrainCircuit className="text-blue-800 dark:text-blue-200" />
                            <span className="font-bold text-black dark:text-white">{user.aiTokens}</span>
                        </div>
                    </div>
                   </>
                )}
                <Link to={getDashboardPath()} className="hidden sm:flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-brand-purple font-semibold">
                    <IconHome />
                    <span>{t('dashboard')}</span>
                </Link>
                <div className="flex items-center space-x-3">
                  <Link to="/profile" className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Avatar user={user} className="h-10 w-10" />
                    <span className="font-semibold hidden sm:inline dark:text-gray-200">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-md hover:bg-red-100 text-gray-700 hover:text-red-600 dark:hover:bg-red-900/50 dark:text-gray-300 dark:hover:text-red-400 transition-colors">
                    <IconLogout />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 bg-brand-blue-light text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none hover:-translate-x-px hover:-translate-y-px transition-all">
                <IconUser />
                <span>{t('login')}</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;