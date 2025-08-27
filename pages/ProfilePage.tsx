
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/Card';
import { IconUserCircle, IconAt, IconLink, IconRefresh, IconXSocial, IconCoin } from '../components/Icons';
import Avatar from '../components/Avatar';
import { useTranslation } from '../hooks/useTranslation';

const FrameCollectionPreview: React.FC<{ frameId: string }> = ({ frameId }) => {
    const framePreviewClasses: { [key:string]: string } = {
        'frame-rgb': 'frame-rgb',
        'frame-christmas': 'frame-christmas',
        'frame-ghost': 'frame-ghost',
        'frame-fire': 'frame-fire',
    };
    return <div className={`w-6 h-6 rounded-sm ${framePreviewClasses[frameId] || ''}`} />;
};

const ThemeCollectionPreview: React.FC<{ themeId: string }> = ({ themeId }) => {
    const themeStyles: { [key: string]: React.CSSProperties } = {
        'theme-default': { background: 'linear-gradient(45deg, #F72585, #4CC9F0)'},
        'theme-glass': { background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(2px)' },
        'theme-matrix': { background: '#000000' },
        'theme-vibrant': { background: 'linear-gradient(45deg, #ADFF00, #F72585)'},
    };
    return <div style={themeStyles[themeId] || {}} className="w-6 h-6 rounded-sm border border-black" />;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser, updateUserAvatar, storeItems, equipItem } = useAppContext();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [website, setWebsite] = useState('');
  const [discord, setDiscord] = useState('');
  const [twitter, setTwitter] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setLikes(user.likes || '');
      setDislikes(user.dislikes || '');
      setWebsite(user.socials?.website || '');
      setDiscord(user.socials?.discord || '');
      setTwitter(user.socials?.x || '');
    }
  }, [user]);

  if (!user) {
    return <p>Loading profile...</p>;
  }
  
  const activePet = storeItems.find(item => item.id === user.activePetId);
  const purchasedStoreItems = storeItems.filter(item => user.purchasedItems.includes(item.id));
  const ownedFrames = purchasedStoreItems.filter(item => item.type === 'AVATAR_FRAME');
  const ownedPets = purchasedStoreItems.filter(item => item.type === 'PET');
  const ownedThemes = purchasedStoreItems.filter(item => item.type === 'THEME');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: any = {
      name,
      email,
      likes,
      dislikes,
      socials: { website, discord, x: twitter },
    };
    if (password) {
        updatedData.password = password;
    }
    
    updateUser(user.id, updatedData);
    setMessage(t('profileUpdated'));
    setPassword('');
    setTimeout(() => setMessage(''), 3000);
  };
  
  const formInputStyle = "w-full p-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none placeholder-gray-500 dark:placeholder-gray-400";
  const socialInputStyle = "w-full pl-10 p-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none placeholder-gray-500 dark:placeholder-gray-400";


  return (
    <div className="container mx-auto max-w-6xl font-fredoka">
      <div className="flex items-center space-x-4 mb-8">
        <IconUserCircle />
        <h1 className="text-4xl font-extrabold">{t('profileTitle')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col items-center">
            <div className="flex items-end mb-4">
                <Avatar user={user} className="w-48 h-48" />
                 {activePet && <img src={activePet.image} alt={activePet.name} className="w-24 h-24 -ml-4" />}
            </div>
             <button 
                onClick={() => updateUserAvatar(user.id)}
                className="mb-4 flex items-center justify-center space-x-2 w-full bg-brand-blue-light text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">
                <IconRefresh/><span>{t('generateNewAvatar')}</span>
            </button>
            <Card className="p-4 bg-white dark:bg-gray-800 w-full">
                <h3 className="font-bold text-xl mb-2 text-center">{t('myCollection')}</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold">{t('themes')}</h4>
                        {ownedThemes.length > 0 ? ownedThemes.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-1 bg-gray-100 dark:bg-gray-700 rounded-md mt-1">
                                <div className="flex items-center gap-2">
                                    <ThemeCollectionPreview themeId={item.id} />
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                <button onClick={() => equipItem(item.id)} className={`text-xs font-bold px-2 py-1 border-2 border-black rounded-md ${(user.activeThemeId === item.id || (!user.activeThemeId && item.id === 'theme-default')) ? 'bg-brand-purple text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                    {(user.activeThemeId === item.id || (!user.activeThemeId && item.id === 'theme-default')) ? t('equipped') : t('equip')}
                                </button>
                            </div>
                        )) : <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('noThemesOwned')}</p>}
                    </div>
                    <div>
                        <h4 className="font-semibold">{t('avatarFrames')}</h4>
                        {ownedFrames.length > 0 ? ownedFrames.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-1 bg-gray-100 dark:bg-gray-700 rounded-md mt-1">
                                <div className="flex items-center gap-2">
                                    <FrameCollectionPreview frameId={item.id} />
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                <button onClick={() => equipItem(item.id)} className={`text-xs font-bold px-2 py-1 border-2 border-black rounded-md ${user.activeAvatarFrameId === item.id ? 'bg-brand-purple text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                    {user.activeAvatarFrameId === item.id ? t('equipped') : t('equip')}
                                </button>
                            </div>
                        )) : <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('noFramesOwned')}</p>}
                    </div>
                     <div>
                        <h4 className="font-semibold">{t('pets')}</h4>
                        {ownedPets.length > 0 ? ownedPets.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-1 bg-gray-100 dark:bg-gray-700 rounded-md mt-1">
                                 <div className="flex items-center gap-2">
                                    <img src={item.image} alt={item.name} className="w-6 h-6"/>
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                <button onClick={() => equipItem(item.id)} className={`text-xs font-bold px-2 py-1 border-2 border-black rounded-md ${user.activePetId === item.id ? 'bg-brand-purple text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                    {user.activePetId === item.id ? t('equipped') : t('equip')}
                                </button>
                            </div>
                        )) : <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('noPetsOwned')}</p>}
                    </div>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="p-8 bg-white dark:bg-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && <div className="bg-green-100 dark:bg-green-900/50 border-2 border-green-500 text-green-700 dark:text-green-300 p-3 rounded-lg text-center font-semibold">{message}</div>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="name">{t('name')}</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} />
                        </div>
                        <div>
                            <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="email">{t('email')}</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={formInputStyle} />
                        </div>
                    </div>

                    <div>
                        <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="password">{t('newPassword')}</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} className={formInputStyle} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="likes">{t('likes')}</label>
                            <input id="likes" type="text" value={likes} onChange={e => setLikes(e.target.value)} placeholder="e.g., sci-fi books, coding, pizza" className={formInputStyle} />
                        </div>
                         <div>
                            <label className="text-lg font-bold text-gray-800 dark:text-gray-200 block mb-2" htmlFor="dislikes">{t('dislikes')}</label>
                            <input id="dislikes" type="text" value={dislikes} onChange={e => setDislikes(e.target.value)} placeholder="e.g., spoilers, traffic" className={formInputStyle} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">{t('socialLinks')}</h3>
                        <div className="space-y-3">
                           <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconLink className="h-5 w-5 text-gray-400 dark:text-gray-500"/></div><input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://my-website.com" className={socialInputStyle}/></div>
                           <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconAt className="h-5 w-5 text-gray-400 dark:text-gray-500"/></div><input type="text" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="mydiscord#1234" className={socialInputStyle}/></div>
                           <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconXSocial className="h-4 w-4 text-gray-400 dark:text-gray-500"/></div><input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="@mytwitter" className={socialInputStyle}/></div>
                        </div>
                    </div>


                    <button type="submit" className="w-full bg-brand-lime text-black font-bold text-xl py-3 px-6 border-4 border-black rounded-xl shadow-hard hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
                        {t('saveChanges')}
                    </button>
                </form>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
