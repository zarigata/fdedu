import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Question, ChatMessage } from '../types';
import { getAIHelperChat } from '../services/aiService';
import Card from '../components/Card';
import { IconSparkles, IconClose, IconSend, IconBot, IconFile, IconDownload } from '../components/Icons';
import { useTranslation } from '../hooks/useTranslation';
import { getPrompts } from '../locales/prompts';
import { Chat } from '@google/genai';

const isPastDue = (dueDate: string | null): boolean => {
    if (dueDate === null) return false; // No due date means it's never past due.
    const today = new Date();
    const dueDateEnd = new Date(dueDate + 'T23:59:59.999');
    return today > dueDateEnd;
};

// AI Helper Modal Component
const AIHelperModal: React.FC<{ question: Question; onClose: () => void; }> = ({ question, onClose }) => {
    const { chatProvider, ollamaModel, language } = useAppContext();
    const { t } = useTranslation();
    const prompts = getPrompts(language);

    const [chat, setChat] = useState<Chat | any | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const systemInstruction = prompts.onDemandAssignmentHelper.replace('{questionText}', question.questionText);
            const newChat = getAIHelperChat(chatProvider, systemInstruction, { ollamaModel });
            setChat(newChat);
            setHistory([]);
        } catch (err) {
            console.error(err);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: t('tutor_init_fail') }] };
            setHistory([errorMessage]);
        }
    }, [question, chatProvider, ollamaModel, prompts, t]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
        setHistory(prev => [...prev, userMessage]);
        setIsLoading(true);
        setUserInput('');

        try {
            const result = await chat.sendMessageStream({ message: userInput });
            let modelResponse = '';
            const stream = result.stream || result;
            for await (const chunk of stream) { modelResponse += chunk.text; }
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: modelResponse }] };
            setHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: t('tutor_error') }] };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="fvd-modal p-0 bg-white dark:bg-gray-800 w-full max-w-lg h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b-2 border-black dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><IconBot /> {t('aiTutor')}</h2>
                    <button onClick={onClose}><IconClose /></button>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-900 text-sm">
                    <p className="font-semibold">{t('aiHelpFor', { questionText: `"${question.questionText}"`})}</p>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center flex-shrink-0"><IconSparkles /></div>}
                            <div className={`fvd-chat-bubble max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-blue-light text-black rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 rounded-bl-none'}`}>
                                <p>{msg.parts?.[0]?.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center flex-shrink-0"><IconSparkles /></div>
                            <div className="fvd-chat-bubble p-3 rounded-2xl"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div></div></div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-black dark:border-gray-700 flex items-center gap-2">
                    <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder={t('typeYourQuestion')} disabled={isLoading || !chat} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg" />
                    <button type="submit" disabled={isLoading || !chat} className="p-2 bg-brand-purple text-white rounded-full border-2 border-black disabled:bg-gray-400"><IconSend /></button>
                </form>
            </Card>
        </div>
    );
};

const AssignmentSubmissionPage: React.FC = () => {
    const { classroomId, assignmentId } = useParams<{ classroomId: string; assignmentId: string }>();
    const { user, classrooms, addSubmission, submissions } = useAppContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [activeHelpQuestion, setActiveHelpQuestion] = useState<Question | null>(null);

    const classroom = classrooms.find(c => c.id === classroomId);
    const assignment = classroom?.assignments.find(a => a.id === assignmentId);

    const existingSubmission = useMemo(() => 
        submissions.find(s => s.studentId === user?.id && s.assignmentId === assignmentId),
        [submissions, user, assignmentId]
    );

    const assignmentIsPastDue = useMemo(() => isPastDue(assignment?.dueDate || null), [assignment]);

    useEffect(() => {
        if (existingSubmission) {
          const savedAnswers = existingSubmission.answers.reduce((acc, ans) => {
            acc[ans.questionId] = ans.answer;
            return acc;
          }, {} as Record<string, string>);
          setAnswers(savedAnswers);
        }
      }, [existingSubmission]);

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !assignment || existingSubmission || assignmentIsPastDue) return;

        const submissionAnswers = assignment.questions.map(q => ({
            questionId: q.id,
            answer: answers[q.id] || ''
        }));

        addSubmission({
            assignmentId: assignment.id,
            studentId: user.id,
            answers: submissionAnswers,
            grade: null
        });
        
        alert(t('assignmentSubmitted'));
        navigate(`/homework/${classroomId}`);
    };

    if (!assignment) return <p>Assignment not found.</p>;

    const isLocked = !!existingSubmission || (assignmentIsPastDue && !existingSubmission);

    return (
        <div className="container mx-auto max-w-3xl font-fredoka">
            {activeHelpQuestion && <AIHelperModal question={activeHelpQuestion} onClose={() => setActiveHelpQuestion(null)} />}
            
            <Card className="p-6 bg-white dark:bg-gray-800">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-extrabold">{assignment.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{assignment.description}</p>
                    <p className="text-sm font-semibold">{assignment.dueDate ? `${t('dueDate')}: ${assignment.dueDate}` : t('noDueDate')}</p>
                </div>

                {assignment.files && assignment.files.length > 0 && (
                    <div className="my-6">
                        <h3 className="font-bold text-lg mb-2">{t('attachedFiles')}</h3>
                        <div className="space-y-2">
                            {assignment.files.map(file => (
                                <a key={file.id} href={file.url} download={file.name} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-black dark:border-gray-600 hover:bg-brand-blue-light/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <IconFile className="w-5 h-5 flex-shrink-0"/>
                                        <span className="font-semibold truncate">{file.name}</span>
                                    </div>
                                    <IconDownload className="w-6 h-6 text-brand-purple flex-shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {existingSubmission && (
                    <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-lg text-center">
                        <p className="font-bold">{t('assignmentAlreadySubmitted')}</p>
                    </div>
                )}
                
                {assignmentIsPastDue && !existingSubmission && (
                     <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 border-2 border-red-500 text-red-800 dark:text-red-200 rounded-lg text-center">
                        <p className="font-bold">{t('pastDue').toUpperCase()}: {t('pastDueDesc')}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {assignment.questions.map((q, index) => (
                        <div key={q.id} className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                            <div className="flex justify-between items-start">
                                <label className="block text-xl font-bold mb-2 pr-4" htmlFor={q.id}>
                                    {index + 1}. {q.questionText}
                                </label>
                                <button type="button" onClick={() => setActiveHelpQuestion(q)} className="flex-shrink-0 flex items-center gap-2 text-sm bg-brand-blue-light text-black font-bold py-1 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">
                                    <IconSparkles /> {t('getHelp')}
                                </button>
                            </div>

                            {q.type === 'multiple-choice' && q.options ? (
                                <div className="space-y-2 mt-2">
                                    {q.options.map(option => (
                                        <label key={option} className={`flex items-center space-x-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-md ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                            <input
                                                type="radio"
                                                name={q.id}
                                                value={option}
                                                checked={answers[q.id] === option}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                className="h-4 w-4 disabled:opacity-50"
                                                disabled={isLocked}
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    id={q.id}
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    rows={5}
                                    className="mt-2 w-full p-2 bg-gray-200 dark:bg-gray-900 border-2 border-black rounded-lg disabled:opacity-70"
                                    disabled={isLocked}
                                    readOnly={isLocked}
                                ></textarea>
                            )}
                        </div>
                    ))}
                    
                    <button type="submit" disabled={isLocked} className="w-full bg-brand-lime text-black font-bold text-xl py-4 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none">
                        {existingSubmission ? t('submitted') : (assignmentIsPastDue ? t('pastDue') : t('submitAssignment'))}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default AssignmentSubmissionPage;