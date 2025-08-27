import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { generateAdaptivePathways } from '../services/aiService';
import Card from '../components/Card';
import { IconSparkles, IconBrain, IconUsers, IconClipboardList } from '../components/Icons';
import { AdaptivePathwayPlan } from '../types';
import Avatar from '../components/Avatar';
import { useTranslation } from '../hooks/useTranslation';

const AdaptivePathwaysPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { 
    classrooms, 
    users, 
    submissions, 
    knowledgeGraph, 
    academicProvider,
    ollamaModel,
    addAdaptiveAssignmentsToClassroom,
    language,
    checkAndConsumeAIResource
  } = useAppContext();
  const { t } = useTranslation();
  
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<AdaptivePathwayPlan | null>(null);

  const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
  const studentsInClass = useMemo(() => users.filter(u => classroom?.studentIds.includes(u.id)), [users, classroom]);

  if (!classroom) {
    return <p>Classroom not found.</p>;
  }

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      setError(t('pleaseProvideTopic'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      await checkAndConsumeAIResource('adaptivePathways', { cost: 10, isHeavy: true });
      const generatedPlan = await generateAdaptivePathways(
        academicProvider,
        topic,
        studentsInClass,
        submissions,
        knowledgeGraph,
        language,
        { ollamaModel }
      );
      setPlan(generatedPlan);
    } catch (err: any) {
      const message = err.message || 'An unknown error occurred.';
      if (message.startsWith('INSUFFICIENT_TOKENS')) {
        const [, current, needed] = message.split('::');
        setError(t('insufficientTokens', { needed, current }));
      } else if (message.startsWith('COOLDOWN')) {
        const [, , timeLeftMs] = message.split('::');
        const hoursLeft = Math.ceil(Number(timeLeftMs) / (1000 * 60 * 60));
        setError(t('cooldownActive', { hours: hoursLeft }));
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApproveAndAssign = () => {
    if (!plan || !classroomId) return;
    addAdaptiveAssignmentsToClassroom(classroomId, plan.pathways);
    navigate(`/homework/${classroomId}`);
  }

  const getGroupColor = (groupName: string) => {
    switch (groupName) {
        case 'Accelerated': return 'bg-brand-lime';
        case 'Proficient': return 'bg-brand-blue-light';
        case 'Needs Reinforcement': return 'bg-brand-yellow';
        default: return 'bg-gray-200';
    }
  }

  return (
    <div className="container mx-auto max-w-6xl font-fredoka">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3">
          <IconBrain />
          <h1 className="text-4xl font-extrabold">{t('adaptivePathwaysGenerator')}</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('forClass', { name: classroom.name })}
        </p>
      </div>

      <Card className="p-6 bg-white dark:bg-gray-800 mb-8">
        <form onSubmit={handleGeneratePlan}>
          <label htmlFor="topic" className="block text-lg font-bold mb-2">{t('setLearningObjective')}</label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Krebs Cycle, Poetic Devices, Pythagorean Theorem"
              className="flex-grow w-full p-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex justify-center items-center space-x-3 bg-brand-purple text-white font-bold py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all disabled:bg-gray-400 disabled:shadow-none disabled:cursor-wait">
              {isLoading ? (
                <span>{t('analyzing')}</span>
              ) : (
                <>
                  <IconSparkles />
                  <span>{t('generatePlan')}</span>
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 font-semibold text-center mt-4">{error}</p>}
        </form>
      </Card>
      
      {plan && (
        <div>
            <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold">{t('reviewPlan')}</h2>
                 <p className="text-gray-500 dark:text-gray-400">{t('reviewPlanDesc')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {plan.pathways.map((pathway, index) => (
                    <Card key={index} className="p-4 flex flex-col h-full" color={getGroupColor(pathway.groupName)}>
                        <h3 className="text-2xl font-bold text-black flex items-center gap-2"><IconUsers /> {pathway.groupName}</h3>
                        <div className="my-2 flex flex-wrap gap-2">
                            {pathway.studentNames.map(name => <span key={name} className="text-xs font-semibold bg-black/10 text-black px-2 py-1 rounded-full">{name}</span>)}
                        </div>

                        <div className="mt-2 p-4 bg-white/70 dark:bg-black/20 rounded-lg border-2 border-black/20 flex-grow">
                            <h4 className="font-bold text-lg text-black dark:text-white flex items-center gap-2"><IconClipboardList /> {t('assignments')}</h4>
                            <p className="font-bold text-black dark:text-white">{pathway.assignment.title}</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{pathway.assignment.description}</p>
                            <div className="space-y-2">
                                {pathway.assignment.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="text-xs p-2 bg-white/80 dark:bg-black/30 rounded">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{q.questionText}</p>
                                        <p className="text-green-700 dark:text-green-400">Answer: {q.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
             <div className="mt-8 flex justify-center">
                 <button onClick={handleApproveAndAssign} className="w-full max-w-md bg-brand-lime text-black font-bold text-xl py-4 px-8 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
                    {t('approveAndAssign')}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdaptivePathwaysPage;