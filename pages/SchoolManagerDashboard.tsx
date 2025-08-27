import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { useAppContext } from '../hooks/useAppContext';
import { useTranslation } from '../hooks/useTranslation';
import { User, UserRole } from '../types';
import { IconUsers, IconBrainCircuit, IconPlus, IconClose, IconPencil, IconTrash, IconCoin } from '../components/Icons';
import Avatar from '../components/Avatar';
import BarChart from '../components/BarChart';

const SchoolManagerDashboard: React.FC = () => {
    const { user, users, addUser, updateUser, deleteUser, refillAITokens } = useAppContext();
    const { t } = useTranslation();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const schoolUsers = useMemo(() => users.filter(u => u.schoolId === user?.schoolId && u.id !== user?.id), [users, user]);
    const teachers = useMemo(() => schoolUsers.filter(u => u.role === UserRole.TEACHER), [schoolUsers]);
    const students = useMemo(() => schoolUsers.filter(u => u.role === UserRole.STUDENT), [schoolUsers]);

    const stats = useMemo(() => {
        const totalTokens = schoolUsers.reduce((sum, u) => sum + u.aiTokens, 0);
        return {
            teacherCount: teachers.length,
            studentCount: students.length,
            totalTokens,
        };
    }, [schoolUsers, teachers.length, students.length]);

    if (!user) return <p>Loading...</p>;
    
    const chartData = schoolUsers.map(u => ({ label: u.name, value: u.aiTokens }));

    const openEditModal = (userToEdit: User) => {
        setSelectedUser(userToEdit);
        setIsEditModalOpen(true);
    };
    
    const openRefillModal = (userToRefill: User) => {
        setSelectedUser(userToRefill);
        setIsRefillModalOpen(true);
    };

    return (
        <div className="container mx-auto max-w-7xl font-fredoka">
            {isCreateModalOpen && <UserModal userToEdit={null} onClose={() => setIsCreateModalOpen(false)} />}
            {isEditModalOpen && selectedUser && <UserModal userToEdit={selectedUser} onClose={() => setIsEditModalOpen(false)} />}
            {isRefillModalOpen && selectedUser && <RefillModal userToRefill={selectedUser} onClose={() => setIsRefillModalOpen(false)} />}
            
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-4xl font-extrabold text-brand-blue-dark dark:text-brand-blue-light mb-2">{t('manageYourSchool')}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">{t('schoolId')}: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{user.schoolId}</span></p>
                </div>
                 <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2 bg-brand-lime text-black font-bold py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none transition-all">
                    <IconPlus /> <span>{t('createNewUser')}</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-4 bg-brand-blue-light flex items-center gap-4 text-black"><IconUsers className="w-10 h-10"/><div><p className="text-4xl font-bold">{stats.teacherCount}</p><p className="font-semibold">{t('teachers')}</p></div></Card>
                <Card className="p-4 bg-brand-yellow flex items-center gap-4 text-black"><IconUsers className="w-10 h-10"/><div><p className="text-4xl font-bold">{stats.studentCount}</p><p className="font-semibold">{t('students')}</p></div></Card>
                <Card className="p-4 bg-brand-pink flex items-center gap-4 text-black col-span-1 lg:col-span-2"><IconBrainCircuit className="w-10 h-10"/><div><p className="text-4xl font-bold">{stats.totalTokens.toLocaleString()}</p><p className="font-semibold">{t('totalTokensRemaining')}</p></div></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Card className="p-4 bg-white dark:bg-gray-800">
                        <h2 className="text-2xl font-bold mb-4">{t('userManagement')}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-2 text-left">{t('name')}</th>
                                        <th className="p-2 text-left">{t('role')}</th>
                                        <th className="p-2 text-center">{t('aiTokens')}</th>
                                        <th className="p-2 text-center">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schoolUsers.map(su => (
                                        <tr key={su.id} className="border-b dark:border-gray-700">
                                            <td className="p-2 font-semibold flex items-center gap-2"><Avatar user={su} className="w-8 h-8"/>{su.name}</td>
                                            <td className="p-2 capitalize">{t(su.role)}</td>
                                            <td className="p-2 text-center font-mono">{su.aiTokens}</td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openRefillModal(su)} className="p-2 bg-brand-lime rounded-md border border-black"><IconCoin/></button>
                                                    <button onClick={() => openEditModal(su)} className="p-2 bg-brand-blue-light rounded-md border border-black"><IconPencil/></button>
                                                    <button onClick={() => {if(window.confirm(t('confirmDeleteUser'))) { deleteUser(su.id) }}} className="p-2 bg-red-400 rounded-md border border-black"><IconTrash/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card className="p-4 bg-white dark:bg-gray-800">
                         <h2 className="text-2xl font-bold mb-4">{t('aiUsageOverview')}</h2>
                         <div className="h-96">
                            {chartData.length > 0 ? <BarChart data={chartData} /> : <p className="text-center text-gray-500">{t('noDataForChart')}</p>}
                         </div>
                     </Card>
                </div>
            </div>
        </div>
    );
};


const UserModal: React.FC<{ userToEdit: User | null; onClose: () => void }> = ({ userToEdit, onClose }) => {
    const { t } = useTranslation();
    const { addUser, updateUser } = useAppContext();
    const [name, setName] = useState(userToEdit?.name || '');
    const [email, setEmail] = useState(userToEdit?.email || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(userToEdit?.role || UserRole.STUDENT);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;

        if (userToEdit) { // Editing
            const updatedData: Partial<User> = { name, email, role };
            if (password.trim()) updatedData.password = password;
            updateUser(userToEdit.id, updatedData);
        } else { // Creating
             if (!password.trim()) return;
            addUser({ name, email, password, role });
        }
        onClose();
    };
    const formInputStyle = "w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{userToEdit ? t('editUser') : t('createNewUser')}</h2><button onClick={onClose}><IconClose /></button></div>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div><label className="font-bold block mb-1">{t('fullName')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required/></div>
                     <div><label className="font-bold block mb-1">{t('email')}</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={formInputStyle} required/></div>
                     <div><label className="font-bold block mb-1">{t('password')}</label><input type="password" placeholder={userToEdit ? t('passwordPlaceholder') : ''} value={password} onChange={e => setPassword(e.target.value)} className={formInputStyle} required={!userToEdit}/></div>
                     <div><label className="font-bold block mb-1">{t('role')}</label><select value={role} onChange={e=>setRole(e.target.value as UserRole)} className={formInputStyle}><option value={UserRole.STUDENT}>{t('student')}</option><option value={UserRole.TEACHER}>{t('teacher')}</option></select></div>
                     <button type="submit" className="w-full bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm">{userToEdit ? t('saveChanges') : t('addUser')}</button>
                 </form>
            </Card>
        </div>
    );
};

const RefillModal: React.FC<{ userToRefill: User; onClose: () => void }> = ({ userToRefill, onClose }) => {
    const { t } = useTranslation();
    const { refillAITokens } = useAppContext();
    const [amount, setAmount] = useState(100);

    const handleRefill = () => {
        if(amount > 0) {
            refillAITokens(userToRefill.id, amount);
            onClose();
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{t('refillTokens')}</h2><button onClick={onClose}><IconClose /></button></div>
                 <p className="mb-4">{t('refillingTokensFor', { name: userToRefill.name })}</p>
                 <div className="flex items-center gap-4">
                     <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value, 10) || 0)} min="1" step="50" className="w-full p-2 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-lg text-center font-bold text-lg"/>
                     <button onClick={handleRefill} className="bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm">{t('refill')}</button>
                 </div>
            </Card>
        </div>
    )
};

export default SchoolManagerDashboard;