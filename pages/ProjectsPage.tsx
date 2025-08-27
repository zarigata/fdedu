
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTranslation } from '../hooks/useTranslation';
import Card from '../components/Card';
import { IconBriefcase, IconPlus, IconClose, IconSparkles, IconUsers, IconTrash, IconPencil } from '../components/Icons';
import { generateProjectIdeas } from '../services/aiService';
import { ProjectGroup, User } from '../types';
import Avatar from '../components/Avatar';

type DraftGroup = Omit<ProjectGroup, 'id' | 'tasks' | 'files' | 'chatMessages' | 'workboardNotes'>;

const ProjectsPage: React.FC = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { user, classrooms, users, createProject, deleteProject, academicProvider, language } = useAppContext();
    const { t } = useTranslation();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
    const students = useMemo(() => users.filter(u => classroom?.studentIds.includes(u.id)), [users, classroom]);
    
    if (!user || !classroom) return <p>Not found.</p>;
    
    const isTeacher = user.role === 'teacher';

    const userProjectAndGroup = useMemo(() => {
        if (isTeacher) return null;
        for (const project of classroom.projects || []) {
            for (const group of project.groups) {
                if (group.studentIds.includes(user.id)) {
                    return { project, group };
                }
            }
        }
        return null;
    }, [classroom.projects, user, isTeacher]);

    const studentProjects = isTeacher 
        ? (classroom.projects || [])
        : (userProjectAndGroup ? [userProjectAndGroup.project] : []);

    const handleDelete = (projectId: string) => {
        if (window.confirm(t('confirmDeleteProject'))) {
            deleteProject(classroom.id, projectId);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl font-fredoka">
            {isCreateModalOpen && <CreateProjectModal classroomId={classroom.id} students={students} users={users} onClose={() => setIsCreateModalOpen(false)} />}
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-extrabold flex items-center gap-3"><IconBriefcase /> {t('projects')}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">{t('forClass', { name: classroom.name })}</p>
                </div>
                {isTeacher && (
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2 bg-brand-lime text-black font-bold py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none transition-all">
                        <IconPlus /> <span>{t('createProject')}</span>
                    </button>
                )}
            </div>

            {studentProjects.length === 0 ? (
                 <Card className="p-12 text-center bg-gray-100 dark:bg-gray-800">
                    <h2 className="text-2xl font-bold">{t('noProjectsYet')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{isTeacher ? t('teacherCreateFirstProject') : t('studentAwaitingProject')}</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentProjects.map(project => (
                        <Card key={project.id} className="p-4 bg-white dark:bg-gray-800 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold truncate">{project.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('dueDate')}: {project.dueDate || t('noDueDate')}</p>
                                <p className="text-gray-700 dark:text-gray-300 h-24 overflow-y-auto">{project.description}</p>
                            </div>
                             <div className="flex gap-2 mt-4">
                                <Link to={`/project/${project.id}`} className="flex-1 text-center bg-brand-blue-light text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('openProjectHub')}</Link>
                                {isTeacher && <button onClick={() => handleDelete(project.id)} className="p-2 bg-red-400 border-2 border-black rounded-lg shadow-hard-sm"><IconTrash /></button>}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};


const CreateProjectModal: React.FC<{ classroomId: string, students: User[], users: User[], onClose: () => void }> = ({ classroomId, students, users, onClose }) => {
    const { t } = useTranslation();
    const { createProject, academicProvider, language } = useAppContext();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isAiHelperOpen, setAiHelperOpen] = useState(false);
    
    const [groups, setGroups] = useState<DraftGroup[]>([{ name: 'Group 1', studentIds: [] }]);
    const [unassignedStudents, setUnassignedStudents] = useState<User[]>(students);
    const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

    const handleCreateProject = () => {
        if (!title.trim() || !description.trim()) {
            alert(t('projectTitleDescRequired'));
            return;
        }
        createProject(classroomId, { title, description, dueDate: dueDate || null }, groups);
        onClose();
    };

    const addGroup = () => setGroups(prev => [...prev, { name: `Group ${prev.length + 1}`, studentIds: [] }]);
    const removeGroup = (index: number) => {
        const groupToRemove = groups[index];
        const studentsToUnassign = users.filter(u => groupToRemove.studentIds.includes(u.id));
        setUnassignedStudents(prev => [...prev, ...studentsToUnassign]);
        setGroups(prev => prev.filter((_, i) => i !== index));
    };
    const updateGroupName = (index: number, name: string) => setGroups(prev => prev.map((g, i) => i === index ? { ...g, name } : g));
    
    // Drag and Drop handlers
    const onDragStart = (e: React.DragEvent, studentId: string) => setDraggedStudentId(studentId);
    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDropOnGroup = (groupIndex: number) => {
        if (!draggedStudentId) return;
        const student = unassignedStudents.find(s => s.id === draggedStudentId);
        if (student) {
            setUnassignedStudents(prev => prev.filter(s => s.id !== draggedStudentId));
            setGroups(prev => prev.map((g, i) => i === groupIndex ? { ...g, studentIds: [...g.studentIds, draggedStudentId] } : g));
        }
        setDraggedStudentId(null);
    };
    const onDropOnUnassigned = () => {
        if (!draggedStudentId) return;
        let studentToMove: User | undefined;
        let sourceGroupIndex = -1;
        
        for(let i=0; i < groups.length; i++) {
            const student = users.find(u => u.id === draggedStudentId && groups[i].studentIds.includes(draggedStudentId));
            if (student) {
                studentToMove = student;
                sourceGroupIndex = i;
                break;
            }
        }

        if (studentToMove && sourceGroupIndex > -1) {
            setGroups(prev => prev.map((g, i) => i === sourceGroupIndex ? { ...g, studentIds: g.studentIds.filter(id => id !== draggedStudentId) } : g));
            setUnassignedStudents(prev => [...prev, studentToMove!]);
        }
        setDraggedStudentId(null);
    };

    const AIHelper: React.FC = () => {
        const [topic, setTopic] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [ideas, setIdeas] = useState<any[]>([]);
        const [error, setError] = useState('');

        const handleGenerate = async () => {
            if (!topic.trim()) return;
            setIsLoading(true);
            setError('');
            setIdeas([]);
            try {
                const result = await generateProjectIdeas(academicProvider, 'General', topic, language);
                setIdeas(result.ideas);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const useIdea = (idea: any) => {
            setTitle(idea.title);
            setDescription(`${idea.description}\n\nKey Questions:\n- ${idea.questions.join('\n- ')}`);
            setAiHelperOpen(false);
        };

        return (
             <div className="absolute inset-0 bg-white dark:bg-gray-800 z-20 p-4 flex flex-col border-l-2 border-black dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold flex items-center gap-2"><IconSparkles /> {t('aiHelper')}</h3>
                    <button onClick={() => setAiHelperOpen(false)}><IconClose /></button>
                </div>
                <div className="flex gap-2"><input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder={t('ideaTopicPlaceholder')} className="flex-grow w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg" /><button onClick={handleGenerate} disabled={isLoading} className="bg-brand-purple text-white p-2 border-2 border-black rounded-lg">{isLoading ? '...' : t('generate')}</button></div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                <div className="mt-4 flex-grow overflow-y-auto space-y-2">
                    {ideas.map((idea, i) => <div key={i} className="p-2 border rounded-md cursor-pointer hover:bg-brand-yellow" onClick={()=>useIdea(idea)}><p className="font-bold">{idea.title}</p><p className="text-sm">{idea.description}</p></div>)}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
                {isAiHelperOpen && <AIHelper />}
                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{t('createProject')}</h2><button onClick={onClose}><IconClose /></button></div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
                    {/* Left: Details */}
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="font-bold block mb-1">{t('projectTitle')}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg" />
                            <button onClick={() => setAiHelperOpen(true)} title={t('aiHelper')} className="absolute top-7 right-1 p-1 bg-brand-purple text-white rounded-md"><IconSparkles/></button>
                        </div>
                        <div>
                            <label className="font-bold block mb-1">{t('projectDescription')}</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg"></textarea>
                        </div>
                        <div><label className="font-bold block mb-1">{t('dueDate')}</label><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg" /></div>
                    </div>
                    {/* Right: Groups */}
                    <div className="space-y-4">
                        <h3 className="font-bold">{t('studentGroups')}</h3>
                        <div className="p-2 border-2 border-dashed rounded-md min-h-[80px]" onDragOver={onDragOver} onDrop={onDropOnUnassigned}>
                            <p className="font-semibold text-sm mb-1">{t('unassignedStudents')}</p>
                            <div className="flex flex-wrap gap-2">{unassignedStudents.map(s=><div key={s.id} draggable onDragStart={e=>onDragStart(e,s.id)} className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-md cursor-grab"><Avatar user={s} className="w-5 h-5"/> <span className="text-xs font-semibold">{s.name}</span></div>)}</div>
                        </div>
                        {groups.map((g, i) => (
                            <div key={i} className="p-2 border-2 border-black rounded-md bg-gray-50 dark:bg-gray-900/50" onDragOver={onDragOver} onDrop={()=>onDropOnGroup(i)}>
                                <div className="flex justify-between items-center mb-2">
                                    <input type="text" value={g.name} onChange={e => updateGroupName(i, e.target.value)} className="font-bold bg-transparent"/>
                                    <button onClick={()=>removeGroup(i)} className="text-red-500"><IconTrash /></button>
                                </div>
                                <div className="min-h-[40px] flex flex-wrap gap-2">{g.studentIds.map(id => users.find(u=>u.id===id)).filter(Boolean).map(s=><div key={s!.id} draggable onDragStart={e=>onDragStart(e,s!.id)} className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-md cursor-grab"><Avatar user={s!} className="w-5 h-5"/> <span className="text-xs font-semibold">{s!.name}</span></div>)}</div>
                            </div>
                        ))}
                         <button onClick={addGroup} className="w-full text-center p-2 mt-2 bg-brand-blue-light/50 border-2 border-dashed border-black rounded-md hover:bg-brand-blue-light/80">{t('addGroup')}</button>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t-2"><button onClick={handleCreateProject} className="w-full bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm">{t('createProject')}</button></div>
            </Card>
        </div>
    );
};


export default ProjectsPage;
