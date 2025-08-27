
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-brand-blue-dark dark:bg-gray-900 text-white font-fredoka mt-12 border-t-4 border-black dark:border-gray-700">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-extrabold text-white">FeVeDucation</h3>
            <p className="text-brand-blue-light/80 mt-2">{t('footerSlogan')}</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">{t('footerCompany')}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-brand-yellow transition-colors">{t('footerAbout')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">{t('footerLegal')}</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-300 hover:text-brand-yellow transition-colors">{t('footerTerms')}</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-brand-yellow transition-colors">{t('footerPrivacy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-brand-purple/50 dark:border-gray-700 text-center text-gray-400 text-sm">
          <p>{t('footerCopyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
