import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTranslation } from '../hooks/useTranslation';
import Card from '../components/Card';
import { IconBook, IconPlus, IconClose, IconPencil, IconTrash, IconClipboardList, IconLink, IconBroadcast, IconUsers } from '../components/Icons';
import { DailyLogEntry, DailyLogResource, UserRole } from '../types';
import Avatar from '../components/Avatar';

type LogFormData = Omit<DailyLogEntry, 'id' | 'date' | 'resources'> & {
    resources: Omit<DailyLogResource, 'id' | 'type'>[]
};

const ClassroomLogPage: React.FC = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { user, classrooms, users, addDailyLog, updateDailyLog, deleteDailyLog } = useAppContext();
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logToEdit, setLogToEdit] = useState<DailyLogEntry | null>(null);

    const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
    const students = useMemo(() => users.filter(u => classroom?.studentIds.includes(u.id)), [users, classroom]);
    const teacher = useMemo(() => users.find(u => u.id === classroom?.teacherId), [users, classroom]);
    
    if (!user || !classroom) return <p>Classroom not found.</p>;

    const isTeacherOfClass = user.role === UserRole.TEACHER && user.id === classroom.teacherId;
    const isManager = user.role === UserRole.SCHOOL_MANAGER;
    const isAdmin = user.role === UserRole.ADMIN;
    const canEdit = isTeacherOfClass;
    const canViewSensitive = isTeacherOfClass || isManager || isAdmin;

    const sortedLogs = useMemo(() => (classroom.dailyLogs || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [classroom.dailyLogs]);
    
    const openModal = (log: DailyLogEntry | null) => {
        setLogToEdit(log);
        setIsModalOpen(true);
    };

    const handleDelete = (logId: string) => {
        if (window.confirm(t('confirmDeleteLog'))) {
            deleteDailyLog(classroom.id, logId);
        }
    }

    return (
        <div className="container mx-auto max-w-5xl font-fredoka">
            {isModalOpen && <LogModal onClose={() => setIsModalOpen(false)} {...{ classroom, students, logToEdit, addDailyLog, updateDailyLog }} />}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-extrabold flex items-center gap-3"><IconBook /> {t('dailyClassLogFor', { name: classroom.name })}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{t('subject')}: {classroom.subject}</p>
                </div>
                {canEdit && (
                    <button onClick={() => openModal(null)} className="flex items-center space-x-2 bg-brand-lime text-black font-bold py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none transition-all">
                        <IconPlus /> <span>{t('addTodaysLog')}</span>
                    </button>
                )}
            </div>

            {sortedLogs.length === 0 ? (
                <Card className="p-12 text-center bg-gray-100 dark:bg-gray-800">
                    <h2 className="text-2xl font-bold">{t('noLogsYet')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{canEdit ? t('teacherAddFirstLog') : t('studentAwaitingLogs')}</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {sortedLogs.map(log => (
                        <Card key={log.id} className="p-6 bg-white dark:bg-gray-800">
                            <div className="flex justify-between items-start">
                                <h2 className="text-3xl font-bold">{log.lessonTopic}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg text-gray-700 dark:text-gray-300">{log.date}</span>
                                    {canEdit && (
                                        <>
                                            <button onClick={() => openModal(log)} className="p-2 bg-brand-blue-light text-black rounded-md border-2 border-black shadow-hard-sm"><IconPencil /></button>
                                            <button onClick={() => handleDelete(log.id)} className="p-2 bg-red-500 text-white rounded-md border-2 border-black shadow-hard-sm"><IconTrash /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6 mt-4">
                                <div className="md:col-span-2">
                                    <h3 className="font-bold text-xl mb-2">{t('lessonSummary')}</h3>
                                    <p className="prose dark:prose-invert">{log.lessonSummary}</p>
                                </div>
                                <div className="md:col-span-1 space-y-4">
                                    {log.assignedAssignmentIds.length > 0 && (
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2"><IconClipboardList /> {t('homeworkAssigned')}</h4>
                                            <ul className="list-disc pl-5">
                                                {log.assignedAssignmentIds.map(assignId => {
                                                    const assignment = classroom.assignments.find(a => a.id === assignId);
                                                    return assignment ? <li key={assignId}><Link to={`/homework/${classroom.id}`} className="text-brand-purple hover:underline">{assignment.title}</Link></li> : null;
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                     {log.resources.length > 0 && (
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2"><IconLink /> {t('resources')}</h4>
                                            <ul className="list-disc pl-5">
                                                {log.resources.map(res => <li key={res.id}><a href={res.url} target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">{res.name}</a></li>)}
                                            </ul>
                                        </div>
                                    )}
                                     {log.announcements && (
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2"><IconBroadcast /> {t('announcements')}</h4>
                                            <p className="text-sm bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md">{log.announcements}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {canViewSensitive && (
                                <div className="mt-6 border-t-2 border-dashed pt-4">
                                     <h3 className="font-bold text-xl mb-2">{t('attendance')}</h3>
                                     <div className="flex flex-wrap gap-4">
                                        {Object.entries(log.attendance).map(([studentId, status]) => {
                                            const student = users.find(u => u.id === studentId);
                                            const statusColors = { present: 'bg-green-200 dark:bg-green-900', absent: 'bg-red-200 dark:bg-red-900', tardy: 'bg-yellow-200 dark:bg-yellow-900' };
                                            return student ? (
                                                <div key={studentId} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                                    <Avatar user={student} className="w-8 h-8"/>
                                                    <span className="font-semibold">{student.name}</span>
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[status]}`}>{t(status)}</span>
                                                </div>
                                            ) : null
                                        })}
                                     </div>
                                     {log.teacherNotes && (
                                         <div className="mt-4">
                                            <h3 className="font-bold text-xl mb-2">{t('teacherNotes')}</h3>
                                            <p className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-md text-sm italic">{log.teacherNotes}</p>
                                         </div>
                                     )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const LogModal = ({ onClose, classroom, students, logToEdit, addDailyLog, updateDailyLog }: any) => {
    const { t } = useTranslation();
    const today = new Date().toISOString().split('T')[0];

    const initialAttendance = useMemo(() => {
        const att: Record<string, 'present' | 'absent' | 'tardy'> = {};
        students.forEach((s: any) => {
            att[s.id] = 'present';
        });
        return att;
    }, [students]);

    const [formData, setFormData] = useState<LogFormData>({
        lessonTopic: logToEdit?.lessonTopic || '',
        lessonSummary: logToEdit?.lessonSummary || '',
        assignedAssignmentIds: logToEdit?.assignedAssignmentIds || [],
        resources: logToEdit?.resources.map((r: any) => ({ name: r.name, url: r.url })) || [],
        announcements: logToEdit?.announcements || '',
        attendance: logToEdit?.attendance || initialAttendance,
        teacherNotes: logToEdit?.teacherNotes || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, assignedAssignmentIds: selectedIds });
    };
    
    const handleResourceChange = (index: number, field: 'name' | 'url', value: string) => {
        const newResources = [...formData.resources];
        newResources[index][field] = value;
        setFormData({ ...formData, resources: newResources });
    };

    const addResourceField = () => setFormData({ ...formData, resources: [...formData.resources, { name: '', url: '' }] });
    const removeResourceField = (index: number) => setFormData({ ...formData, resources: formData.resources.filter((_, i) => i !== index) });

    const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'tardy') => {
        setFormData({ ...formData, attendance: { ...formData.attendance, [studentId]: status }});
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            resources: formData.resources
                .filter(r => r.name.trim() && r.url.trim())
                .map(r => ({ ...r, id: `res-${Date.now()}-${Math.random()}`, type: 'link' as const }))
        };
        
        if (logToEdit) {
            updateDailyLog(classroom.id, logToEdit.id, finalData);
        } else {
            addDailyLog(classroom.id, { ...finalData, date: today });
        }
        onClose();
    };

    const formInput = "w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold">{logToEdit ? t('editLogEntry') : t('addTodaysLog')}</h2>
                    <button onClick={onClose}><IconClose /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div><label className="font-bold block mb-1">{t('lessonTopic')}</label><input type="text" name="lessonTopic" value={formData.lessonTopic} onChange={handleInputChange} placeholder={t('lessonTopicPlaceholder')} className={formInput} required/></div>
                    <div><label className="font-bold block mb-1">{t('lessonSummary')}</label><textarea name="lessonSummary" value={formData.lessonSummary} onChange={handleInputChange} rows={4} className={formInput}></textarea></div>
                    <div><label className="font-bold block mb-1">{t('homeworkAssigned')}</label><select multiple value={formData.assignedAssignmentIds} onChange={handleMultiSelectChange} className={`${formInput} h-24`}><option value="" disabled>{t('selectAssignments')}</option>{classroom.assignments.map((a:any) => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
                    <div><label className="font-bold block mb-1">{t('resources')}</label>{formData.resources.map((res, i) => (<div key={i} className="flex items-center gap-2 mb-2"><input type="text" value={res.name} onChange={e=>handleResourceChange(i, 'name', e.target.value)} placeholder={t('resourceName')} className={formInput}/><input type="url" value={res.url} onChange={e=>handleResourceChange(i, 'url', e.target.value)} placeholder={t('resourceUrl')} className={formInput}/><button type="button" onClick={()=>removeResourceField(i)} className="p-2 bg-red-500 text-white rounded-md"><IconTrash/></button></div>))}<button type="button" onClick={addResourceField} className="text-sm font-bold text-brand-purple hover:underline">{t('addResource')}</button></div>
                    <div><label className="font-bold block mb-1">{t('announcements')}</label><textarea name="announcements" value={formData.announcements} onChange={handleInputChange} placeholder={t('announcementsPlaceholder')} rows={2} className={formInput}></textarea></div>
                    <div><label className="font-bold block mb-1">{t('attendance')}</label><div className="p-2 border-2 border-gray-300 rounded-lg max-h-48 overflow-y-auto space-y-2">{students.map((s:any) => (<div key={s.id} className="flex items-center justify-between"><span className="font-semibold">{s.name}</span><div className="flex gap-2"> {['present', 'absent', 'tardy'].map(status => (<label key={status} className="flex items-center gap-1 text-sm"><input type="radio" name={`att_${s.id}`} value={status} checked={formData.attendance[s.id] === status} onChange={()=>handleAttendanceChange(s.id, status as any)}/>{t(status)}</label>))}</div></div>))}</div></div>
                    <div><label className="font-bold block mb-1">{t('teacherNotes')}</label><textarea name="teacherNotes" value={formData.teacherNotes} onChange={handleInputChange} placeholder={t('teacherNotesPlaceholder')} rows={3} className={formInput}></textarea></div>
                    <div className="pt-4 flex-shrink-0"><button type="submit" className="w-full bg-brand-lime text-black font-bold py-3 px-4 border-2 border-black rounded-lg shadow-hard-sm">{t('saveLog')}</button></div>
                </form>
            </Card>
        </div>
    );
};


export default ClassroomLogPage;