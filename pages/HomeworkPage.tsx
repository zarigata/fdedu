import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, Assignment, Question } from '../types';
import Card from '../components/Card';
import { IconPlus, IconSparkles, IconTrash, IconClose, IconUsers, IconFile, IconUpload, IconCalendar } from '../components/Icons';
import { generateClassroomContent } from '../services/aiService';
import Avatar from '../components/Avatar';
import { useTranslation } from '../hooks/useTranslation';

type DraftQuestion = Omit<Question, 'id'>;
type DraftAssignment = Omit<Assignment, 'id' | 'questions'> & {
    questions: DraftQuestion[];
};

const isPastDue = (dueDate: string | null): boolean => {
    if (dueDate === null) return false; // No due date means it's never past due.
    const today = new Date();
    // Set hours to 0 to compare dates only, but compare against the *end* of the due date.
    const dueDateEnd = new Date(dueDate + 'T23:59:59.999');
    return today > dueDateEnd;
};

const HomeworkPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { user, classrooms, users, academicProvider, addAssignmentsToClassroom, ollamaModel, language, submissions, uploadFileToAssignment, deleteFileFromAssignment, updateAssignmentDueDate, checkAndConsumeAIResource } = useAppContext();
  const { t } = useTranslation();

  const [isManualModalOpen, setManualModalOpen] = useState(false);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{classroomId: string; assignmentId: string} | null>(null);

  const classroom = classrooms.find(c => c.id === classroomId);
  const teacher = users.find(u => u.id === classroom?.teacherId);

  if (!user || !classroom) {
    return <p>Classroom not found.</p>;
  }

  const isTeacher = user.role === UserRole.TEACHER && user.id === classroom.teacherId;
  const isStudent = user.role === UserRole.STUDENT;

  const assignmentsForUser = isStudent
    ? classroom.assignments.filter(a => !a.studentIds || a.studentIds.includes(user.id))
    : classroom.assignments;
    
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
        uploadFileToAssignment(uploadTarget.classroomId, uploadTarget.assignmentId, file);
    }
    if (e.target) e.target.value = ''; // Reset input
    setUploadTarget(null);
  };

  const handleUploadClick = (classroomId: string, assignmentId: string) => {
    setUploadTarget({ classroomId, assignmentId });
    fileInputRef.current?.click();
  };
  
  const openDueDateModal = (assignment: Assignment) => {
      setEditingAssignment(assignment);
      setIsDueDateModalOpen(true);
  }

  const DueDateModal: React.FC<{ assignment: Assignment | null, onClose: () => void }> = ({ assignment, onClose }) => {
    const [date, setDate] = useState(assignment?.dueDate || '');
    const [isForever, setIsForever] = useState(assignment?.dueDate === null);

    if (!assignment) return null;

    const handleSave = () => {
        updateAssignmentDueDate(classroom.id, assignment.id, isForever ? null : date);
        onClose();
    };
    
    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-2">{t('setDueDate')}</h3>
                <p className="text-sm truncate mb-4">{assignment.title}</p>
                <div className="space-y-4">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isForever} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg disabled:opacity-50"/>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={isForever} onChange={e => setIsForever(e.target.checked)} className="w-5 h-5"/> {t('noDueDate')}</label>
                </div>
                 <div className="mt-4 flex gap-4">
                    <button onClick={onClose} className="w-full bg-gray-300 text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('cancel')}</button>
                    <button onClick={handleSave} className="w-full bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('updateDueDate')}</button>
                </div>
            </Card>
        </div>
    );
  }

  const AIGeneratorModal = () => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<{assignments: any[]} | null>(null);
    const [dueDate, setDueDate] = useState('');
    const [isForever, setIsForever] = useState(false);
    const formInputStyle = "w-full p-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none placeholder-gray-500 dark:placeholder-gray-400";


    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) {
          setError(t('pleaseFillTopic'));
          return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
    
        try {
          await checkAndConsumeAIResource('generateAssignments', { cost: 5 });
          const content = await generateClassroomContent(academicProvider, classroom.subject, topic, language, { ollamaModel });
          setGeneratedContent(content);
        } catch (err: any) {
           const message = err.message || 'An unknown error occurred.';
            if (message.startsWith('INSUFFICIENT_TOKENS')) {
                const [, current, needed] = message.split('::');
                setError(t('insufficientTokens', { needed, current }));
            } else {
                setError(message);
            }
        } finally {
          setIsLoading(false);
        }
    };

    const handleAddAssignments = () => {
        if (!generatedContent || !classroomId) return;
        const finalDueDate = isForever ? null : dueDate;
        const newAssignments: Assignment[] = generatedContent.assignments.map((a: any, index: number) => ({
          ...a,
          id: `a-gen-${Date.now()}-${index}`,
          dueDate: finalDueDate,
          questions: a.questions.map((q: any, qIndex: number) => ({...q, id: `q-gen-${Date.now()}-${index}-${qIndex}`}))
        }));
        addAssignmentsToClassroom(classroomId, newAssignments);
        setAiModalOpen(false);
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setAiModalOpen(false)}>
            <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('generateAssignmentsAI')}</h2>
                    <button onClick={() => setAiModalOpen(false)}><IconClose/></button>
                </div>
                {!generatedContent ? (
                     <form onSubmit={handleGenerate} className="space-y-4">
                        <p dangerouslySetInnerHTML={{ __html: t('aiContext', { subject: classroom.subject }) }} />
                        <div>
                            <label className="font-bold block mb-1">{t('mainTopic')}</label>
                            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Cellular Respiration, The Cold War" className={formInputStyle}/>
                        </div>
                        <div>
                            <label className="font-bold block mb-1">{t('dueDate')}</label>
                             <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={isForever} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg disabled:opacity-50"/>
                             <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={isForever} onChange={e => setIsForever(e.target.checked)} className="w-5 h-5"/> {t('noDueDate')}</label>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center space-x-2 bg-brand-purple text-white font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all disabled:bg-gray-400">
                             {isLoading ? <span>{t('generating')}</span> : <><IconSparkles/><span>{t('generateAssignmentsAI')}</span></>}
                        </button>
                        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
                    </form>
                ) : (
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        <h3 className="text-xl font-bold">{t('generatedPreview')}</h3>
                         {generatedContent.assignments.map((assignment: any, index: number) => (
                            <div key={index} className="p-4 border-2 border-dashed border-gray-400 rounded-lg">
                                <h3 className="text-xl font-bold">{assignment.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">{assignment.description}</p>
                                <div className="space-y-2">
                                {assignment.questions.map((q: any, qIndex: number) => (
                                    <div key={qIndex} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                        <p><strong>Q:</strong> {q.questionText}</p>
                                        <p className="text-green-700 dark:text-green-400"><strong>A:</strong> {q.answer}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {generatedContent && (
                    <div className="mt-4 flex gap-4">
                        <button onClick={() => setGeneratedContent(null)} className="w-full bg-gray-300 text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('back')}</button>
                        <button onClick={handleAddAssignments} className="w-full bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('addToClass')}</button>
                    </div>
                )}
            </Card>
        </div>
    )
  }

  const ManualAssignmentModal = () => {
    const [assignment, setAssignment] = useState<DraftAssignment>({ title: '', description: '', dueDate: null, questions: [] });
    const [dueDate, setDueDate] = useState('');
    const [isForever, setIsForever] = useState(false);

    const formInputStyle = "w-full p-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none";
    const smallButton = "p-1 bg-red-500 text-white rounded-md border border-black dark:border-gray-600 hover:bg-red-600";

    const handleQuestionChange = (qIndex: number, field: string, value: any) => {
        const newQuestions = [...assignment.questions];
        newQuestions[qIndex] = {...newQuestions[qIndex], [field]: value};
        setAssignment({...assignment, questions: newQuestions});
    }
    const handleAddQuestion = () => setAssignment({...assignment, questions: [...assignment.questions, {questionText: '', type: 'open-ended', answer: ''}]});
    const handleRemoveQuestion = (qIndex: number) => setAssignment({...assignment, questions: assignment.questions.filter((_,i) => i !== qIndex)});
    
    const handleSave = () => {
        if (!assignment.title || !classroomId) {
            alert(t('mustHaveTitle'));
            return;
        }
        const finalDueDate = isForever ? null : dueDate;
        const newAssignment: Assignment = {
            ...assignment,
            id: `a-man-${Date.now()}`,
            dueDate: finalDueDate,
            questions: assignment.questions.map((q, qIdx) => ({...q, id: `q-man-${Date.now()}-${qIdx}`}))
        };
        addAssignmentsToClassroom(classroomId, [newAssignment]);
        setManualModalOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setManualModalOpen(false)}>
            <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{t('addAssignmentManually')}</h2><button onClick={() => setManualModalOpen(false)}><IconClose/></button></div>
                 <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <input type="text" value={assignment.title} onChange={e => setAssignment({...assignment, title: e.target.value})} placeholder={t('assignmentTitle')} className={formInputStyle}/>
                    <textarea value={assignment.description} onChange={e => setAssignment({...assignment, description: e.target.value})} placeholder={t('assignmentDesc')} className={formInputStyle} rows={2}></textarea>
                    
                    <div>
                        <label className="font-bold block mb-1">{t('dueDate')}</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={isForever} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg disabled:opacity-50"/>
                        <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={isForever} onChange={e => setIsForever(e.target.checked)} className="w-5 h-5"/> {t('noDueDate')}</label>
                    </div>

                    <h3 className="font-bold text-lg pt-2">{t('questions')}</h3>
                     {assignment.questions.map((q, qIdx) => (
                        <div key={qIdx} className="p-3 bg-gray-100 dark:bg-gray-900/50 border border-black rounded-md space-y-2">
                            <div className="flex justify-between items-center"><p className="font-semibold">{t('question', { index: qIdx + 1 })}</p><button type="button" onClick={() => handleRemoveQuestion(qIdx)} className={smallButton}><IconTrash/></button></div>
                            <textarea value={q.questionText} onChange={e => handleQuestionChange(qIdx, 'questionText', e.target.value)} placeholder={t('questionText')} className={formInputStyle} rows={2}/>
                            <input type="text" value={q.answer || ''} onChange={e => handleQuestionChange(qIdx, 'answer', e.target.value)} placeholder={t('correctAnswer')} className={formInputStyle}/>
                        </div>
                    ))}
                     <button type="button" onClick={handleAddQuestion} className="w-full text-center p-2 mt-2 bg-brand-blue-light/50 border-2 border-dashed border-black rounded-md hover:bg-brand-blue-light/80">{t('addQuestion')}</button>
                </div>
                 <div className="mt-4 flex gap-4">
                    <button onClick={() => setManualModalOpen(false)} className="w-full bg-gray-300 text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('cancel')}</button>
                    <button onClick={handleSave} className="w-full bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('saveAssignment')}</button>
                </div>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto font-fredoka">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
        />
        {isManualModalOpen && <ManualAssignmentModal />}
        {isAiModalOpen && <AIGeneratorModal />}
        {isDueDateModalOpen && <DueDateModal assignment={editingAssignment} onClose={() => setIsDueDateModalOpen(false)} />}

      <div className={`relative p-8 rounded-xl border-4 border-black bg-${classroom.color} mb-8`}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-black">{t('homeworkFor', { name: classroom.name })}</h1>
        <p className="text-xl font-semibold text-gray-800">{t('subject')}: {classroom.subject}</p>
        <p className="text-lg text-gray-800">{t('teacherName', { name: teacher?.name })}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Assignments List */}
        <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-3xl font-bold dark:text-white">{t('assignments')}</h2>
                 {isTeacher && (
                     <div className="flex gap-2">
                         <button onClick={() => setManualModalOpen(true)} className="flex items-center gap-2 bg-brand-blue-light text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all"><IconPlus/>{t('manual')}</button>
                         <button onClick={() => setAiModalOpen(true)} className="flex items-center gap-2 bg-brand-purple text-white font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all"><IconSparkles/>{t('aiGenerate')}</button>
                     </div>
                 )}
            </div>
            <div className="space-y-4">
            {assignmentsForUser.length > 0 ? (
                assignmentsForUser.map(assignment => {
                    const submission = isStudent ? submissions.find(s => s.studentId === user.id && s.assignmentId === assignment.id) : null;
                    const assignmentIsPastDue = isPastDue(assignment.dueDate);
                    const studentLinkIsDisabled = isStudent && assignmentIsPastDue && !submission;

                    return (
                        <Card key={assignment.id} className="p-4 flex flex-col justify-between bg-white dark:bg-gray-800">
                            <div>
                                <h3 className="text-xl font-bold">{assignment.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{assignment.description}</p>
                                <div className="text-sm font-semibold flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5"><IconCalendar /> {assignment.dueDate ? assignment.dueDate : t('noDueDate')}</span>
                                    {assignmentIsPastDue && <span className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">{t('pastDue')}</span>}
                                </div>
                                {isTeacher && assignment.studentIds && (
                                    <div className="mt-2 text-xs font-semibold text-brand-purple bg-purple-100 dark:bg-purple-900/50 inline-flex items-center gap-1 px-2 py-1 rounded-full">
                                        <IconUsers />
                                        <span>{t('studentsCount', { count: assignment.studentIds.length })}</span>
                                    </div>
                                )}
                                {assignment.files && assignment.files.length > 0 && (
                                    <div className="mt-3">
                                        <h4 className="font-bold text-sm mb-1">{t('attachedFiles')}</h4>
                                        <div className="space-y-1">
                                            {assignment.files.map(file => (
                                                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                                    <a href={file.url} download={file.name} className="flex items-center gap-2 flex-grow text-sm font-semibold truncate hover:underline" title={file.name}>
                                                        <IconFile className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">{file.name}</span>
                                                    </a>
                                                    {isTeacher && (
                                                        <button onClick={() => deleteFileFromAssignment(classroom.id, assignment.id, file.id)} className="ml-2 p-1 text-red-500 hover:text-red-700">
                                                            <IconTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 items-center justify-end">
                                {isTeacher && (
                                    <>
                                        <button onClick={() => handleUploadClick(classroom.id, assignment.id)} className="bg-white dark:bg-gray-600 text-black dark:text-white font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all text-sm flex items-center gap-1">
                                            <IconUpload className="w-4 h-4"/> {t('uploadFile')}
                                        </button>
                                        <button onClick={() => openDueDateModal(assignment)} className="bg-white dark:bg-gray-600 text-black dark:text-white font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all text-sm flex items-center gap-1">
                                           <IconCalendar /> {t('setDueDate')}
                                        </button>
                                        <Link to={`/teacher/grade/${classroom.id}/${assignment.id}`} className="bg-brand-yellow text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all text-sm flex items-center gap-1">
                                            {t('submissionsAndGrading')}
                                        </Link>
                                    </>
                                )}
                                {isStudent && (
                                    <Link to={`/student/assignment/${classroom.id}/${assignment.id}`} 
                                          className={`text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all ${studentLinkIsDisabled ? 'bg-gray-400 text-gray-700 shadow-none cursor-not-allowed' : (submission ? 'bg-brand-yellow' : 'bg-brand-blue-light')}`}
                                          onClick={(e) => { if(studentLinkIsDisabled) e.preventDefault(); }}
                                          aria-disabled={studentLinkIsDisabled}
                                    >
                                        {submission ? t('viewSubmission') : t('startAssignment')}
                                    </Link>
                                )}
                            </div>
                        </Card>
                    )
                })
            ) : (
                <Card className="p-8 text-center bg-white dark:bg-gray-800">
                    <h3 className="text-xl font-bold">{t('noAssignmentsYet')}</h3>
                    {isTeacher ? <p>{t('teacherAddAssignments')}</p> : <p>{t('studentWaitForAssignments')}</p>}
                </Card>
            )}
            </div>
        </div>

        {/* Roster/Info Panel */}
        <div className="md:col-span-1">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">{isTeacher ? t('studentRoster') : t('classmates')}</h2>
            <Card className="p-4 bg-yellow-100 dark:bg-yellow-900/30">
                <ul className="space-y-3">
                    {classroom.studentIds.length > 0 ? classroom.studentIds.map(studentId => {
                        const student = users.find(u => u.id === studentId);
                        if (!student) return null;
                        return (
                            <li key={student.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-md border-2 border-black dark:border-gray-600">
                                <Avatar user={student} className="w-10 h-10" />
                                <span className="font-semibold dark:text-gray-200">{student.name}</span>
                            </li>
                        )
                    }) : <p className="text-center text-sm p-4 text-gray-700 dark:text-gray-300">{t('noStudentsEnrolled')}</p>}
                </ul>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeworkPage;