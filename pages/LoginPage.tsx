import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole } from '../types';
import Card from '../components/Card';
import { useTranslation } from '../hooks/useTranslation';

const LoginPage: React.FC = () => {
  const { login, addUser, users } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>(UserRole.STUDENT);

  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(loginEmail, loginPassword);
    if (success) {
      navigate('/');
    } else {
      setError(t('invalidCredentials'));
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName || !signupEmail || !signupPassword) {
        setError(t('allFieldsRequired'));
        return;
    }
    if (users.some(user => user.email.toLowerCase() === signupEmail.toLowerCase())) {
        setError(t('emailExists'));
        return;
    }

    addUser({ name: signupName, email: signupEmail, password: signupPassword, role: signupRole });
    const success = login(signupEmail, signupPassword);
     if (success) {
      navigate('/');
    } else {
      setError(t('loginFailed'));
    }
  };

  const formInputStyle = "w-full p-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none placeholder-gray-500 dark:placeholder-gray-400";

  return (
    <div className="container mx-auto max-w-md font-fredoka">
      <Card className="p-4 sm:p-8 bg-white dark:bg-gray-800">
        <div className="flex border-b-2 border-black dark:border-gray-700 mb-6">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 pb-2 font-bold text-xl text-center transition-colors ${activeTab === 'login' ? 'text-brand-purple border-b-4 border-brand-purple' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            {t('login')}
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 pb-2 font-bold text-xl text-center transition-colors ${activeTab === 'signup' ? 'text-brand-purple border-b-4 border-brand-purple' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            {t('signup')}
          </button>
        </div>

        {error && <p className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 text-center font-semibold">{error}</p>}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="login-email">{t('email')}</label>
              <input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={formInputStyle} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="login-password">{t('password')}</label>
              <input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={formInputStyle} placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full bg-brand-blue-light text-black font-bold text-xl py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
              {t('login')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="signup-name">{t('fullName')}</label>
              <input id="signup-name" type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} className={formInputStyle} placeholder="Jane Doe" required />
            </div>
            <div>
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="signup-email">{t('email')}</label>
              <input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className={formInputStyle} placeholder="jane.doe@example.com" required />
            </div>
            <div>
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="signup-password">{t('password')}</label>
              <input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className={formInputStyle} placeholder={t('newPassword')} required />
            </div>
             <div>
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="signup-role">{t('iAmA')}</label>
              <select id="signup-role" value={signupRole} onChange={e => setSignupRole(e.target.value as UserRole)} className={formInputStyle}>
                  <option value={UserRole.STUDENT}>{t('student')}</option>
                  <option value={UserRole.TEACHER}>{t('teacher')}</option>
                  <option value={UserRole.SCHOOL_MANAGER}>{t('schoolManager')}</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-brand-lime text-black font-bold text-xl py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
              {t('createAccount')}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;