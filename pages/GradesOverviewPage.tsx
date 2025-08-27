

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { analyzeGradebook } from '../services/aiService';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import RadarChart from '../components/RadarChart';
import { IconSparkles } from '../components/Icons';
import { useTranslation } from '../hooks/useTranslation';
import { User } from '../types';

interface StudentStats {
  student: User;
  average: number | null;
  topicScores: { label: string; value: number }[];
}

interface AnalysisResult {
    classAnalysis: string;
    assignmentTopics: { assignmentId: string; topic: string; }[];
    gradeDistribution: Record<string, number>;
}

const GradesOverviewPage: React.FC = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { classrooms, users, submissions, academicProvider, ollamaModel, language, checkAndConsumeAIResource } = useAppContext();
    const { t } = useTranslation();

    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
    const students = useMemo(() => users.filter(u => classroom?.studentIds.includes(u.id)), [users, classroom]);
    const assignments = useMemo(() => classroom?.assignments || [], [classroom]);

    const gradebook = useMemo(() => {
        return students.map(student => {
            const grades: Record<string, number | null> = {};
            let total = 0;
            let count = 0;
            assignments.forEach(assignment => {
                const submission = submissions.find(s => s.assignmentId === assignment.id && s.studentId === student.id);
                grades[assignment.id] = submission?.grade ?? null;
                if (submission?.grade !== null && submission?.grade !== undefined) {
                    total += submission.grade;
                    count++;
                }
            });
            return {
                student,
                grades,
                average: count > 0 ? total / count : null
            };
        });
    }, [students, assignments, submissions]);
    
    const assignmentAverages = useMemo(() => {
        const averages: Record<string, number | null> = {};
        assignments.forEach(assignment => {
            const gradesForAssignment = gradebook.map(row => row.grades[assignment.id]).filter(g => g !== null) as number[];
            if (gradesForAssignment.length > 0) {
                const total = gradesForAssignment.reduce((sum, grade) => sum + grade, 0);
                averages[assignment.id] = total / gradesForAssignment.length;
            } else {
                averages[assignment.id] = null;
            }
        });
        return averages;
    }, [assignments, gradebook]);

    const handleAnalyze = async () => {
        if (!classroom) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            await checkAndConsumeAIResource('gradebookAnalysis', { cost: 10, isHeavy: true });

            const dataForAI = {
                assignments: assignments.map(a => ({ id: a.id, title: a.title })),
                students: gradebook.map(row => ({
                    name: row.student.name,
                    average: row.average?.toFixed(1) ?? 'N/A',
                    grades: Object.entries(row.grades).map(([assignmentId, grade]) => ({
                        assignmentId: assignmentId,
                        grade: grade ?? -1 // Use -1 for not submitted
                    }))
                }))
            };
            
            const result = await analyzeGradebook(academicProvider, classroom.name, dataForAI, language, { ollamaModel });
            setAnalysisResult(result);
        } catch(err: any) {
            const message = err.message || 'An error occurred.';
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
    
    const studentKnowledgeProfiles: StudentStats[] = useMemo(() => {
        if (!analysisResult) return [];
        const { assignmentTopics } = analysisResult;
        
        // Create a map of topics from assignments
        const topicsMap = new Map<string, string[]>(); // topic -> assignmentIds[]
        assignmentTopics.forEach(({ assignmentId, topic }) => {
            if (!topicsMap.has(topic)) topicsMap.set(topic, []);
            topicsMap.get(topic)!.push(assignmentId);
        });

        // Calculate scores for each student for each topic
        return gradebook.map(row => {
            const topicScores: { label: string, value: number }[] = [];
            topicsMap.forEach((assignmentIds, topic) => {
                const gradesForTopic = assignmentIds.map(id => row.grades[id]).filter(g => g !== null) as number[];
                if (gradesForTopic.length > 0) {
                    const avg = gradesForTopic.reduce((sum, g) => sum + g, 0) / gradesForTopic.length;
                    topicScores.push({ label: topic, value: avg });
                }
            });
            return {
                student: row.student,
                average: row.average,
                topicScores
            };
        });
    }, [analysisResult, gradebook]);


    if (!classroom) return <p>Classroom not found.</p>;

    return (
        <div className="container mx-auto max-w-7xl font-fredoka">
            <div className="mb-6 text-center">
                 <h1 className="text-4xl font-extrabold text-brand-blue-dark dark:text-brand-blue-light">{t('gradesAndPerformance')}</h1>
                 <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{classroom.name}</p>
            </div>
            
            {/* Gradebook Table */}
            <Card className="p-4 bg-white dark:bg-gray-800 mb-8 overflow-x-auto">
                 <h2 className="text-2xl font-bold mb-4">{t('gradebook')}</h2>
                 <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-2 border dark:border-gray-600 text-left">{t('student')}</th>
                            {assignments.map(a => <th key={a.id} className="p-2 border dark:border-gray-600 w-24 text-center transform -rotate-45">{a.title}</th>)}
                            <th className="p-2 border dark:border-gray-600 w-28 text-center">{t('overallStudentAverage')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gradebook.map(({ student, grades, average }) => (
                            <tr key={student.id} className="odd:bg-white dark:odd:bg-gray-800 even:bg-gray-50 dark:even:bg-gray-900/50">
                                <td className="p-2 border dark:border-gray-600 font-semibold flex items-center gap-2"><Avatar user={student} className="w-8 h-8"/>{student.name}</td>
                                {assignments.map(a => <td key={a.id} className="p-2 border dark:border-gray-600 text-center">{grades[a.id] ?? '-'}</td>)}
                                <td className="p-2 border dark:border-gray-600 text-center font-bold">{average?.toFixed(1) ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
                            <td className="p-2 border dark:border-gray-600 text-right">{t('assignmentAverage')}</td>
                             {assignments.map(a => <td key={a.id} className="p-2 border dark:border-gray-600 text-center">{assignmentAverages[a.id]?.toFixed(1) ?? '-'}</td>)}
                             <td className="p-2 border dark:border-gray-600"></td>
                        </tr>
                    </tfoot>
                 </table>
            </Card>
            
            {/* AI Analytics Section */}
            <Card className="p-6 bg-white dark:bg-gray-800">
                 <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold flex items-center justify-center gap-2"><IconSparkles /> {t('aiPerformanceAnalysis')}</h2>
                    <p className="text-gray-500">{t('aiPerformanceAnalysisDesc')}</p>
                    <button onClick={handleAnalyze} disabled={isLoading} className="mt-4 bg-brand-purple text-white font-bold py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all disabled:bg-gray-400 disabled:shadow-none disabled:cursor-wait">
                        {isLoading ? t('analyzing') : t('generateAnalysis')}
                    </button>
                    {error && <p className="text-red-500 font-semibold text-center mt-4">{error}</p>}
                 </div>

                 {analysisResult && (
                    <div className="space-y-8">
                        {/* Student Knowledge Profiles */}
                        <div>
                             <h3 className="text-2xl font-bold text-center mb-4">{t('studentKnowledgeProfile')}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studentKnowledgeProfiles.map(profile => (
                                    <Card key={profile.student.id} className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar user={profile.student} className="w-12 h-12" />
                                            <div>
                                                <p className="font-bold">{profile.student.name}</p>
                                                <p className="text-sm font-semibold">{t('overallStudentAverage')}: {profile.average?.toFixed(1) ?? 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="h-64">
                                            <RadarChart stats={profile.topicScores} />
                                        </div>
                                    </Card>
                                ))}
                             </div>
                        </div>

                        {/* Class-wide Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                 <h3 className="text-xl font-bold mb-2">{t('classGradeDistribution')}</h3>
                                 <div className="space-y-2">
                                    {Object.entries(analysisResult.gradeDistribution).map(([grade, count]) => (
                                        <div key={grade} className="flex items-center gap-2">
                                            <span className="font-bold w-4">{grade}</span>
                                            <div className="flex-grow bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                                                <div className="bg-brand-blue-light h-6 rounded-full flex items-center justify-end px-2" style={{ width: `${(count / students.length) * 100}%`}}>
                                                   <span className="font-bold text-black text-sm">{count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                            </Card>
                            <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="text-xl font-bold mb-2">{t('aiReport')}</h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none h-64 overflow-y-auto" dangerouslySetInnerHTML={{ __html: analysisResult.classAnalysis.replace(/\n/g, '<br />') }} />
                            </Card>
                        </div>
                    </div>
                 )}
            </Card>
        </div>
    );
};

export default GradesOverviewPage;