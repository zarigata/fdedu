
import React from 'react';
import Card from '../components/Card';
import { IconSparkles, IconUsers, IconBook } from '../components/Icons';
import { useTranslation } from '../hooks/useTranslation';

const AboutUsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto max-w-4xl font-fredoka">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
      `}</style>
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-blue-dark dark:text-brand-blue-light">{t('aboutUs')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">{t('aboutMission')}</p>
      </div>

      <Card className="p-8 my-10 bg-white dark:bg-gray-800">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('aboutP1') }} />
      </Card>

      <div className="grid md:grid-cols-3 gap-6 text-center my-12">
        <div className="flex flex-col items-center">
            <div className="p-4 bg-brand-pink rounded-full text-white mb-3"><IconUsers /></div>
            <h3 className="font-bold text-xl dark:text-white">{t('aboutForStudents')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('aboutForStudentsDesc')}</p>
        </div>
        <div className="flex flex-col items-center">
            <div className="p-4 bg-brand-lime rounded-full text-black mb-3"><IconBook /></div>
            <h3 className="font-bold text-xl dark:text-white">{t('aboutForTeachers')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('aboutForTeachersDesc')}</p>
        </div>
        <div className="flex flex-col items-center">
            <div className="p-4 bg-brand-yellow rounded-full text-black mb-3"><IconSparkles /></div>
            <h3 className="font-bold text-xl dark:text-white">{t('aboutForTheFuture')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('aboutForTheFutureDesc')}</p>
        </div>
      </div>

       <div className="text-center mt-16">
        <h2 className="text-4xl font-extrabold text-brand-purple">{t('aboutVisionaries')}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{t('aboutEngineered')}</p>
      </div>

       <Card className="p-8 my-10 bg-brand-blue-light/20 dark:bg-brand-blue-dark/20">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('aboutFeveP1') }} />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('aboutFeveP2') }} />
      </Card>
      
      <a
        href="https://zarigata.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 text-4xl font-bold text-brand-blue-dark/20 dark:text-brand-blue-light/20 animate-spin-slow transition-all hover:text-brand-blue-dark/80 dark:hover:text-brand-blue-light/80 hover:scale-125"
        aria-label="A secret link to Zarigata"
        title="Z"
      >
        Z
      </a>
    </div>
  );
};

export default AboutUsPage;
