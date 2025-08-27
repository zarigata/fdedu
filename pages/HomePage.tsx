
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { IconBeaker, IconBook, IconClipboardList, IconSparkles, IconUsers } from '../components/Icons';
import { useTranslation } from '../hooks/useTranslation';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
    <Card className="p-6 text-center flex flex-col items-center h-full" color={color}>
        <div className="text-black mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
    </Card>
);

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  return (
    <div className="container mx-auto font-fredoka overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative text-center py-20 px-6">
        <div className="absolute top-10 left-10 w-20 h-20 bg-brand-yellow rounded-full opacity-50 -z-10 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-brand-pink rounded-lg opacity-60 transform rotate-45 -z-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-brand-blue-light opacity-70 -z-10 animate-blob animation-delay-4000"></div>
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
        
        <p className="text-lg font-bold text-brand-purple">Powered by feverdream.dev, FeVe</p>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-brand-blue-dark dark:text-brand-blue-light">
          Engage, Empower, Educate with <span className="text-brand-pink">AI</span>.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Welcome to FeVeDucation. We're revolutionizing the classroom with the latest generation of AI, making learning more intuitive, personalized, and impactful than ever before.
        </p>
        <Link to="/login" className="inline-block bg-brand-purple text-white font-bold text-xl py-4 px-10 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
          {t('launchTheFuture')}
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 my-16 fade-in-section">
          <FeatureCard 
            icon={<IconSparkles />} 
            title={t('feature_ai_classrooms_title')}
            description={t('feature_ai_classrooms_desc')}
            color="bg-brand-blue-light"
          />
          <FeatureCard 
            icon={<IconUsers />} 
            title={t('feature_tutoring_title')}
            description={t('feature_tutoring_desc')}
            color="bg-brand-yellow"
          />
          <FeatureCard 
            icon={<IconBeaker />} 
            title={t('feature_analytics_title')}
            description={t('feature_analytics_desc')}
            color="bg-brand-lime"
          />
      </div>

      {/* For Teachers Section */}
      <section className="py-20 fade-in-section">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-brand-blue-dark dark:text-brand-blue-light">{t('forTeachers')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 mb-6">{t('forTeachers_desc')}</p>
                <ul className="space-y-4 text-left">
                    <li className="flex items-start space-x-3"><span className="text-brand-pink"><IconSparkles/></span><p>{t('forTeachers_f1')}</p></li>
                    <li className="flex items-start space-x-3"><span className="text-brand-pink"><IconBeaker/></span><p>{t('forTeachers_f2')}</p></li>
                    <li className="flex items-start space-x-3"><span className="text-brand-pink"><IconClipboardList/></span><p>{t('forTeachers_f3')}</p></li>
                </ul>
            </div>
            <div className="relative h-64 md:h-80">
                <Card className="p-4 w-48 absolute top-0 left-10 rotate-[-15deg] z-10" color="bg-brand-lime">
                    <p className="font-bold text-black">Photosynthesis Quiz</p><p className="text-sm text-gray-800">1. What is chlorophyll?</p>
                </Card>
                <Card className="p-4 w-56 absolute bottom-0 left-0 dark:bg-gray-800" color="bg-white">
                    <p className="font-bold text-black dark:text-white">Analysis:</p><p className="text-sm text-gray-700 dark:text-gray-300">"75% of students struggled with question 2..."</p>
                </Card>
                 <Card className="p-6 w-52 absolute top-10 right-0 rotate-[10deg]" color="bg-brand-blue-light">
                     <p className="font-bold text-black">Topic: The Cold War</p><IconBook/>
                </Card>
            </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-20 fade-in-section">
        <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="relative h-64 md:h-80 order-2 md:order-1">
                <Card className="p-4 w-60 absolute top-5 left-0 rotate-[8deg] z-10" color="bg-brand-yellow">
                    <p className="font-bold text-black">Your AI Buddy:</p><p className="text-sm text-gray-800">"That's a great question! What's the first step you think we should take?"</p>
                </Card>
                 <Card className="p-4 w-48 absolute bottom-0 right-5 rotate-[-12deg]" color="bg-brand-pink">
                     <p className="font-bold text-black">Math Homework</p><p className="text-gray-800">Due: Friday</p>
                </Card>
            </div>
            <div className="text-center md:text-left order-1 md:order-2">
                <h2 className="text-4xl font-extrabold text-brand-blue-dark dark:text-brand-blue-light">{t('forStudents')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 mb-6">{t('forStudents_desc')}</p>
                <ul className="space-y-4 text-left">
                    <li className="flex items-start space-x-3"><span className="text-brand-purple"><IconUsers/></span><p>{t('forStudents_f1')}</p></li>
                    <li className="flex items-start space-x-3"><span className="text-brand-purple"><IconBook/></span><p>{t('forStudents_f2')}</p></li>
                    <li className="flex items-start space-x-3"><span className="text-brand-purple"><IconSparkles/></span><p>{t('forStudents_f3')}</p></li>
                </ul>
            </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
