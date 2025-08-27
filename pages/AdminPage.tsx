import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { AIProvider, UserRole, User, Classroom } from '../types';
import Card from '../components/Card';
// FIX: Import IconPlus to resolve 'Cannot find name' error.
import { IconActivity, IconSparkles, IconUsers, IconKey, IconTrash, IconRefresh, IconClose, IconBook, IconBrain, IconPencil, IconDotsVertical, IconEye, IconClipboardList, IconPlus } from '../components/Icons';
import { isProviderConfigured } from '../services/aiService';
import Avatar from '../components/Avatar';
import { useTranslation } from '../hooks/useTranslation';

const AdminPage: React.FC = () => {
  const { 
    users, classrooms, 
    academicProvider, setAcademicProvider, 
    chatProvider, setChatProvider,
    addUser, updateUser, deleteUser, updateUserAvatar, 
    updateClassroom, deleteClassroom, 
    assignStudentToClassroom, removeStudentFromClassroom, 
    knowledgeGraph, ollamaModel, setOllamaModel 
  } = useAppContext();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.STUDENT);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const students = users.filter(u => u.role === UserRole.STUDENT);
  const teachers = users.filter(u => u.role === UserRole.TEACHER);
  const schoolManagers = users.filter(u => u.role === UserRole.SCHOOL_MANAGER);

  const isGeminiConfigured = isProviderConfigured(AIProvider.GEMINI);
  const isOpenRouterConfigured = isProviderConfigured(AIProvider.OPENROUTER);
  const isOllamaConfigured = isProviderConfigured(AIProvider.OLLAMA);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
        alert(t('allFieldsRequired'));
        return;
    }
     if (users.some(user => user.email.toLowerCase() === newUserEmail.toLowerCase())) {
        alert(t('emailExists'));
        return;
    }
    addUser({ name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This will also unenroll them from all classes. This cannot be undone.")) {
        deleteUser(userId);
        setSelectedUser(null);
    }
  };
  
  const handleDeleteClassroom = (classroomId: string) => {
    if (window.confirm("Are you sure you want to delete this classroom? This will remove it for all enrolled students and teachers.")) {
        deleteClassroom(classroomId);
    }
  };

  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    e.dataTransfer.setData("studentId", studentId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, classroomId: string) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData("studentId");
    if (studentId) {
        assignStudentToClassroom(studentId, classroomId);
    }
  };
  
  const openEditClassModal = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setIsEditClassModalOpen(true);
  };
  
  const formInputStyle = "w-full p-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none placeholder-gray-500 dark:placeholder-gray-400";


  const UserDetailModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const [editedName, setEditedName] = useState(user.name);
    const [editedEmail, setEditedEmail] = useState(user.email);
    const [editedRole, setEditedRole] = useState(user.role);
    const userClassrooms = classrooms.filter(c => c.teacherId === user.id || c.studentIds.includes(user.id));
    
    const handleSave = () => {
        updateUser(user.id, { name: editedName, email: editedEmail, role: editedRole });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="fvd-modal bg-stone-50 dark:bg-gray-800 rounded-xl border-4 border-black dark:border-gray-600 shadow-hard w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                            <Avatar user={user} className="w-16 h-16"/>
                             <h2 className="text-3xl font-bold dark:text-white">{t('editUser')}</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"><IconClose/></button>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        <div><label className="font-bold">{t('name')}</label><input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className={formInputStyle}/></div>
                        <div><label className="font-bold">{t('email')}</label><input type="email" value={editedEmail} onChange={e => setEditedEmail(e.target.value)} className={formInputStyle}/></div>
                        <div><label className="font-bold">{t('iAmA')}</label><select value={editedRole} onChange={e => setEditedRole(e.target.value as UserRole)} className={formInputStyle}><option value={UserRole.STUDENT}>{t('student')}</option><option value={UserRole.TEACHER}>{t('teacher')}</option><option value={UserRole.SCHOOL_MANAGER}>{t('schoolManager')}</option></select></div>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="font-bold mb-2 dark:text-white">{t('enrolledClasses')}</h3>
                        {userClassrooms.length > 0 ? <ul className="space-y-2">{userClassrooms.map(c => <li key={c.id} className="p-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-md">{c.name}</li>)}</ul> : <p className="text-gray-500 dark:text-gray-400">{t('notEnrolledInAny')}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => updateUserAvatar(user.id)} className="flex items-center justify-center space-x-2 bg-brand-blue-light text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all"><IconRefresh/><span>{t('generateNewAvatar')}</span></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="flex items-center justify-center space-x-2 bg-red-400 text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all"><IconTrash/><span>{t('deleteUser')}</span></button>
                        <button onClick={handleSave} className="col-span-2 w-full bg-brand-lime text-black font-bold text-lg py-3 px-6 border-2 border-black rounded-xl shadow-hard-sm hover:shadow-none transition-all">{t('saveChanges')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
  };
  
  const EditClassroomModal = ({ isOpen, onClose, classroom }: { isOpen: boolean, onClose: () => void, classroom: Classroom | null }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');

    useEffect(() => {
        if(classroom) {
            setName(classroom.name);
            setSubject(classroom.subject);
        }
    }, [classroom]);

    if (!isOpen || !classroom) return null;

    const handleSave = () => {
        updateClassroom(classroom.id, { name, subject });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="fvd-modal bg-stone-50 dark:bg-gray-800 rounded-xl border-4 border-black dark:border-gray-600 shadow-hard w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">{t('editClassroom')}</h2>
                         <button onClick={onClose}><IconClose/></button>
                    </div>
                    <div><label className="font-bold">{t('className')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputStyle}/></div>
                    <div><label className="font-bold">{t('subject')}</label><input type="text" value={subject} onChange={e => setSubject(e.target.value)} className={formInputStyle}/></div>
                    <button onClick={handleSave} className="w-full bg-brand-lime text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm">{t('saveChanges')}</button>
                </div>
            </div>
        </div>
    )
  }


  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-gray-800">
                <h3 className="font-bold text-xl mb-3 flex items-center space-x-2"><IconActivity/><span>{t('platformActivity')}</span></h3>
                <div className="space-y-2">
                    <p><strong>{t('totalUsers')}:</strong> {users.length}</p>
                    <p><strong>{t('teachers')}:</strong> {teachers.length}</p>
                    <p><strong>{t('students')}:</strong> {students.length}</p>
                    <p><strong>{t('classrooms')}:</strong> {classrooms.length}</p>
                </div>
            </Card>
            <Card className="p-6 bg-white dark:bg-gray-800">
                 <h3 className="font-bold text-xl mb-3 flex items-center space-x-2"><IconSparkles/><span>{t('systemConfig')}</span></h3>
                 <div>
                    <h4 className="font-semibold">{t('aiProviderSelection')}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                            <p className="text-sm font-bold">{t('coreAcademicFeatures')}</p>
                            <p className="text-xs text-gray-500 mb-1">{t('coreAcademicFeaturesDesc')}</p>
                            <select value={academicProvider} onChange={e => setAcademicProvider(e.target.value as AIProvider)} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-md text-sm">
                                <option value={AIProvider.GEMINI}>Google Gemini</option>
                                <option value={AIProvider.OPENROUTER}>OpenRouter</option>
                                <option value={AIProvider.OLLAMA}>{t('ollamaLocal')}</option>
                            </select>
                        </div>
                         <div>
                            <p className="text-sm font-bold">{t('auxiliaryChatFeatures')}</p>
                            <p className="text-xs text-gray-500 mb-1">{t('auxiliaryChatFeaturesDesc')}</p>
                             <select value={chatProvider} onChange={e => setChatProvider(e.target.value as AIProvider)} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-md text-sm">
                                <option value={AIProvider.GEMINI}>Google Gemini</option>
                                <option value={AIProvider.OPENROUTER}>OpenRouter</option>
                                <option value={AIProvider.OLLAMA}>{t('ollamaLocal')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                         <h4 className="font-semibold mb-2">{t('apiStatus')}</h4>
                         <p className="text-xs text-gray-500 mb-2">{t('apiStatusDesc')}</p>
                         <div className="space-y-1 text-sm">
                            <p><strong>{t('geminiStatus')}:</strong> <span className={isGeminiConfigured ? 'text-green-600' : 'text-red-600'}>{isGeminiConfigured ? t('configured') : t('notFound')}</span></p>
                            <p><strong>{t('openRouterStatus')}:</strong> <span className={isOpenRouterConfigured ? 'text-green-600' : 'text-red-600'}>{isOpenRouterConfigured ? t('configured') : t('notFound')}</span></p>
                            <p><strong>{t('ollamaStatus')}:</strong> <span className={isOllamaConfigured ? 'text-green-600' : 'text-red-600'}>{isOllamaConfigured ? t('configured') : t('notFound')}</span></p>
                         </div>
                    </div>
                     <div className="mt-4">
                        <h4 className="font-semibold mb-1">{t('ollamaConfig')}</h4>
                        <label className="text-xs font-bold">{t('ollamaModelName')}</label>
                        <p className="text-xs text-gray-500 mb-1">{t('ollamaModelNameDesc')}</p>
                        <input type="text" value={ollamaModel} onChange={e => setOllamaModel(e.target.value)} className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-md text-sm"/>
                    </div>
                 </div>
            </Card>
          </div>
        );
      case 'users':
        return (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card className="p-6 bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-xl mb-3 flex items-center space-x-2"><IconUsers/><span>{t('manageUsers')}</span></h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-2">{t('schoolManagersCount', { count: schoolManagers.length })}</h4>
                            <ul className="space-y-2">{schoolManagers.map(u => <li key={u.id} onClick={() => setSelectedUser(u)} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50"><Avatar user={u} className="w-8 h-8"/><span>{u.name}</span></li>)}</ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-2 mt-4 lg:mt-0">{t('teachersCount', { count: teachers.length })}</h4>
                            <ul className="space-y-2">{teachers.map(u => <li key={u.id} onClick={() => setSelectedUser(u)} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50"><Avatar user={u} className="w-8 h-8"/><span>{u.name}</span></li>)}</ul>
                        </div>
                         <div className="col-span-full">
                            <h4 className="font-semibold text-lg mb-2 mt-4">{t('studentsCountAdmin', { count: students.length })}</h4>
                            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">{students.map(u => <li key={u.id} onClick={() => setSelectedUser(u)} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/50"><Avatar user={u} className="w-8 h-8"/><span>{u.name}</span></li>)}</ul>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="md:col-span-1">
                <Card className="p-6 bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-xl mb-3 flex items-center space-x-2"><IconPlus/><span>{t('createNewUser')}</span></h3>
                    <form onSubmit={handleAddUser} className="space-y-3">
                        <div><label className="font-bold text-sm block mb-1">{t('fullName')}</label><input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className={formInputStyle} required/></div>
                        <div><label className="font-bold text-sm block mb-1">{t('email')}</label><input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className={formInputStyle} required/></div>
                        <div><label className="font-bold text-sm block mb-1">{t('password')}</label><input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className={formInputStyle} required/></div>
                        <div><label className="font-bold text-sm block mb-1">{t('iAmA')}</label><select value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className={formInputStyle}><option value={UserRole.STUDENT}>{t('student')}</option><option value={UserRole.TEACHER}>{t('teacher')}</option><option value={UserRole.SCHOOL_MANAGER}>{t('schoolManager')}</option><option value={UserRole.ADMIN}>Admin</option></select></div>
                        <button type="submit" className="w-full bg-brand-lime text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm">{t('addUser')}</button>
                    </form>
                </Card>
            </div>
          </div>
        );
      case 'classrooms':
        const actionButtonStyles = "p-2 bg-white dark:bg-gray-700 rounded-md border-2 border-black dark:border-gray-600 shadow-hard-sm hover:shadow-none transition-colors";
        return (
             <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-4 bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-lg mb-2">{t('allStudents')}</h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {students.map(s => (
                            <div key={s.id} draggable onDragStart={(e) => handleDragStart(e, s.id)} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md cursor-grab">
                                <Avatar user={s} className="w-6 h-6"/><span>{s.name}</span>
                            </div>
                        ))}
                    </div>
                </Card>
                <div className="md:col-span-2">
                     <Card className="p-4 bg-white dark:bg-gray-800">
                         <h3 className="font-bold text-lg mb-2">{t('classroomsDrag')}</h3>
                         <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {classrooms.map(c => {
                                const teacher = teachers.find(t => t.id === c.teacherId);
                                const enrolledStudents = students.filter(s => c.studentIds.includes(s.id));
                                return (
                                <div key={c.id} className={`p-4 rounded-lg border-4 border-black bg-${c.color}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, c.id)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-extrabold text-xl text-black">{c.name}</h4>
                                            <p className="font-semibold text-sm text-gray-800">{t('taughtBy', { name: teacher?.name || 'N/A' })}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Link to={`/classroom/${c.id}`} className={actionButtonStyles} title={t('viewClassroom')}><IconEye /></Link>
                                            <Link to={`/homework/${c.id}`} className={actionButtonStyles} title={t('viewHomework')}><IconClipboardList /></Link>
                                            <Link to={`/classroom/${c.id}/log`} className={actionButtonStyles} title={t('classLog')}><IconBook /></Link>
                                            <button onClick={() => openEditClassModal(c)} className={actionButtonStyles} title={t('editClassroom')}><IconPencil /></button>
                                            <button onClick={() => handleDeleteClassroom(c.id)} className={`${actionButtonStyles} bg-red-400`} title={t('delete')}><IconTrash /></button>
                                        </div>
                                    </div>
                                    <div className="mt-2 p-2 bg-black/10 rounded-md">
                                        <h5 className="font-bold text-sm text-black mb-1">{t('enrolledStudentsCount', { count: enrolledStudents.length })}</h5>
                                        {enrolledStudents.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {enrolledStudents.map(s => (
                                                    <div key={s.id} className="flex items-center gap-1 p-1 bg-white/50 rounded-md">
                                                        <span className="text-xs font-semibold text-black">{s.name}</span>
                                                        <button onClick={() => removeStudentFromClassroom(s.id, c.id)} className="text-red-700 hover:text-red-900"><IconClose /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-black">{t('dropStudentHere')}</p>}
                                    </div>
                                </div>
                            )})}
                         </div>
                    </Card>
                </div>
             </div>
        )
      case 'feververse':
        return (
            <Card className="p-6 bg-white dark:bg-gray-800">
                <h3 className="font-bold text-xl mb-1 flex items-center space-x-2"><IconBrain/><span>FeVe-Verse: Living Knowledge Graph</span></h3>
                <p className="text-gray-500 mb-4">{t('feververseDesc')}</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {knowledgeGraph.length > 0 ? knowledgeGraph.map(node => (
                        <div key={node.id} className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                            <p className="text-sm text-gray-500 font-mono">{new Date(node.timestamp).toLocaleString()}</p>
                            <p className="text-sm font-semibold text-brand-purple">{t('context')}: {node.aiPersona} for "{node.assignmentTitle}"</p>
                            <div className="mt-2 space-y-1">
                                <p><strong>{t('studentQuestion')}:</strong> {node.userQuestion}</p>
                                <p className="text-green-700 dark:text-green-400"><strong>{t('aiHelpfulAnswer')}:</strong> {node.aiAnswer}</p>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-500 py-8">{t('noHelpfulMoments')}</p>}
                </div>
            </Card>
        )
      default:
        return null;
    }
  }

  return (
    <div className="container mx-auto font-fredoka">
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      <EditClassroomModal isOpen={isEditClassModalOpen} onClose={() => setIsEditClassModalOpen(false)} classroom={editingClassroom} />

      <h1 className="text-4xl font-extrabold mb-4 dark:text-white">{t('adminDashboard')}</h1>
      
      <div className="flex border-b-2 border-black dark:border-gray-700 mb-6">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 font-bold text-lg ${activeTab === 'overview' ? 'text-brand-purple border-b-4 border-brand-purple' : 'text-gray-500'}`}>{t('overview')}</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold text-lg ${activeTab === 'users' ? 'text-brand-purple border-b-4 border-brand-purple' : 'text-gray-500'}`}>{t('users')}</button>
        <button onClick={() => setActiveTab('classrooms')} className={`px-4 py-2 font-bold text-lg ${activeTab === 'classrooms' ? 'text-brand-purple border-b-4 border-brand-purple' : 'text-gray-500'}`}>{t('classrooms')}</button>
        <button onClick={() => setActiveTab('feververse')} className={`px-4 py-2 font-bold text-lg ${activeTab === 'feververse' ? 'text-brand-purple border-b-4 border-brand-purple' : 'text-gray-500'}`}>{t('feververse')}</button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default AdminPage;