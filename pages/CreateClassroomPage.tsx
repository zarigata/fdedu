
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { IconPlus, IconClose } from '../components/Icons';
import { useAppContext } from '../hooks/useAppContext';
import { Classroom } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const CreateClassroomPage: React.FC = () => {
    const { user, addClassroom } = useAppContext();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [createdClassroom, setCreatedClassroom] = useState<Classroom | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name || !subject) {
            alert(t('pleaseProvideNameAndSubject'));
            return;
        }

        const newClassroomData: Omit<Classroom, 'id' | 'publicId' | 'entryPassword'> = {
            name,
            subject,
            teacherId: user.id,
            studentIds: [],
            assignments: [],
            color: ['brand-pink', 'brand-yellow', 'brand-lime', 'brand-blue-light'][Math.floor(Math.random() * 4)],
            pattern: Math.floor(Math.random() * 3) + 1,
        };

        const newClass = addClassroom(newClassroomData);
        setCreatedClassroom(newClass);
    };

    const handleCopyToClipboard = () => {
        if (!createdClassroom) return;
        const textToCopy = `${t('classroomId')}: ${createdClassroom.publicId}\n${t('entryPassword')}: ${createdClassroom.entryPassword}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert(t('copiedToClipboard'));
        });
    };
    
    const formInputStyle = "w-full p-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none placeholder-gray-500 dark:placeholder-gray-400";
    
    return (
        <div className="container mx-auto max-w-xl font-fredoka">
            {createdClassroom && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                     <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{t('classCreationSuccess')}</h2>
                        <p className="my-2">{t('shareCredentials')}</p>
                        <div className="my-4 p-4 bg-gray-100 dark:bg-gray-700 border-2 border-black rounded-lg inline-block">
                             <p className="text-lg"><strong>{t('classroomId')}:</strong> <span className="font-mono text-2xl text-brand-purple">{createdClassroom.publicId}</span></p>
                             <p className="text-lg"><strong>{t('entryPassword')}:</strong> <span className="font-mono text-2xl text-brand-purple">{createdClassroom.entryPassword}</span></p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleCopyToClipboard} className="w-full bg-brand-blue-light text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('copyCredentials')}</button>
                            <button onClick={() => navigate('/teacher/dashboard')} className="w-full bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('done')}</button>
                        </div>
                    </Card>
                </div>
            )}
            <h1 className="text-4xl font-extrabold text-center mb-2">{t('createClassroomTitle')}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-8">{t('createClassroomDesc')}</p>
            
            <Card className="p-8 bg-white dark:bg-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="class-name">{t('className')}</label>
                        <input id="class-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grade 10 History" className={formInputStyle} required />
                    </div>
                    <div>
                        <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="class-subject">{t('subject')}</label>
                        <input id="class-subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. History" className={formInputStyle} required />
                    </div>
                    <button type="submit" className="w-full flex justify-center items-center space-x-2 bg-brand-lime text-black font-bold text-xl py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
                        <IconPlus />
                        <span>{t('createClassroom')}</span>
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default CreateClassroomPage;