
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { User, Submission } from '../types';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import { useTranslation } from '../hooks/useTranslation';

interface GradeInput {
    grade: string;
    feedback: string;
}

const GradingPage: React.FC = () => {
    const { classroomId, assignmentId } = useParams<{ classroomId: string, assignmentId: string }>();
    const { classrooms, users, submissions, gradeSubmission } = useAppContext();
    const { t } = useTranslation();

    const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
    const assignment = useMemo(() => classroom?.assignments.find(a => a.id === assignmentId), [classroom, assignmentId]);
    const students = useMemo(() => users.filter(u => classroom?.studentIds.includes(u.id)), [users, classroom]);
    
    const [grades, setGrades] = useState<Record<string, GradeInput>>(() => {
        const initialState: Record<string, GradeInput> = {};
        students.forEach(student => {
            const submission = submissions.find(s => s.studentId === student.id && s.assignmentId === assignmentId);
            initialState[student.id] = {
                grade: submission?.grade?.toString() || '',
                feedback: submission?.feedback || ''
            };
        });
        return initialState;
    });
    const [updateStatus, setUpdateStatus] = useState<Record<string, string>>({});

    const handleGradeChange = (studentId: string, value: string) => {
        const newGrades = { ...grades };
        newGrades[studentId].grade = value;
        setGrades(newGrades);
    };

    const handleFeedbackChange = (studentId: string, value: string) => {
        const newGrades = { ...grades };
        newGrades[studentId].feedback = value;
        setGrades(newGrades);
    };
    
    const handleUpdateGrade = (studentId: string) => {
        if (!assignmentId) return;
        const { grade, feedback } = grades[studentId];
        const gradeAsNumber = grade.trim() === '' ? null : parseInt(grade, 10);

        if (grade.trim() !== '' && (isNaN(gradeAsNumber!) || gradeAsNumber! < 0 || gradeAsNumber! > 100)) {
            alert('Grade must be a number between 0 and 100.');
            return;
        }
        
        gradeSubmission(assignmentId, studentId, gradeAsNumber, feedback);
        setUpdateStatus(prev => ({ ...prev, [studentId]: 'Updated!' }));
        setTimeout(() => {
            setUpdateStatus(prev => ({...prev, [studentId]: ''}));
        }, 3000);
    };
    
    if (!classroom || !assignment) {
        return <p>Assignment not found.</p>;
    }

    return (
        <div className="container mx-auto max-w-4xl font-fredoka">
            <div className="mb-6">
                 <Link to={`/homework/${classroomId}`} className="text-brand-purple hover:underline font-bold">&larr; {t('backToHomework')}</Link>
                <h1 className="text-4xl font-extrabold text-brand-blue-dark dark:text-brand-blue-light">{t('submissionsAndGrading')}</h1>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{assignment.title}</p>
                <p className="text-md text-gray-500 dark:text-gray-400">{assignment.description}</p>
            </div>

            <div className="space-y-6">
                {students.map(student => {
                    const submission = submissions.find(s => s.studentId === student.id && s.assignmentId === assignmentId);
                    return (
                        <Card key={student.id} className="p-4 bg-white dark:bg-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Student Info */}
                                <div className="md:col-span-1 flex flex-col items-center text-center">
                                    <Avatar user={student} className="w-24 h-24 mb-2" />
                                    <p className="font-bold text-lg">{student.name}</p>
                                    
                                    <div className="mt-4 w-full">
                                        <label className="font-bold text-sm block mb-1">{t('gradeAndFeedback')}</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                min="0"
                                                max="100"
                                                placeholder="0-100"
                                                value={grades[student.id]?.grade || ''}
                                                onChange={e => handleGradeChange(student.id, e.target.value)}
                                                className="w-24 p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg text-center"
                                            />
                                            <button 
                                                onClick={() => handleUpdateGrade(student.id)} 
                                                className="flex-1 bg-brand-lime text-black font-bold border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none"
                                            >
                                                {t('updateGrade')}
                                            </button>
                                        </div>
                                         {updateStatus[student.id] && <p className="text-green-600 dark:text-green-400 text-sm font-bold mt-1 text-center">{updateStatus[student.id]}</p>}
                                    </div>
                                </div>
                                
                                {/* Submission & Feedback */}
                                <div className="md:col-span-2">
                                    {submission && submission.answers.length > 0 ? (
                                        <div className="space-y-2 mb-4">
                                            <h3 className="font-bold">{t('studentAnswers')}</h3>
                                            {submission.answers.map(ans => {
                                                const question = assignment.questions.find(q => q.id === ans.questionId);
                                                return (
                                                    <div key={ans.questionId} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                                                        <p className="font-semibold text-gray-600 dark:text-gray-400">{question?.questionText}</p>
                                                        <p className="text-black dark:text-white">{ans.answer}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                                            <p className="font-semibold text-gray-600 dark:text-gray-400">{t('noSubmission')}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="font-bold text-sm block mb-1">{t('feedbackForStudent')}</label>
                                        <textarea 
                                            placeholder={t('feedbackPlaceholder')}
                                            value={grades[student.id]?.feedback || ''}
                                            onChange={e => handleFeedbackChange(student.id, e.target.value)}
                                            className="w-full h-24 p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
};

export default GradingPage;
