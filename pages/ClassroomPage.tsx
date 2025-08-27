import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole, WorkboardNote, User } from '../types';
import Card from '../components/Card';
import { IconSend, IconPlus, IconClose, IconUsers, IconPhoto, IconEye, IconBot, IconRefresh, IconFile, IconUpload, IconTrash, IconVideoCamera, IconMicrophone, IconMicrophoneOff, IconVideoCameraOff, IconHandRaised, IconScreenShare, IconPhoneOff } from '../components/Icons';
import { analyzeClassroomChat } from '../services/aiService';
import Avatar from '../components/Avatar';
import { useTranslation } from '../hooks/useTranslation';


const NOTE_COLORS = ['bg-brand-yellow', 'bg-brand-pink', 'bg-brand-lime', 'bg-white'];

const ClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { user, classrooms, users, liveChatMessages, workboardNotes, sendLiveChatMessage, addWorkboardNote, updateWorkboardNotePosition, deleteWorkboardNote, chatProvider, ollamaModel, language, uploadFileToClassroom, deleteClassroomFile } = useAppContext();
  const { t } = useTranslation();

  const [chatInput, setChatInput] = useState('');
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostColor, setNewPostColor] = useState(NOTE_COLORS[0]);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  
  // Video Chat State
  const [isVideoChatJoined, setIsVideoChatJoined] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  // AI Co-pilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotAnalysis, setCopilotAnalysis] = useState<string | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [draggingNote, setDraggingNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const workboardRef = useRef<HTMLDivElement>(null);

  const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
  const currentChatMessages = useMemo(() => liveChatMessages.filter(m => m.classroomId === classroomId), [liveChatMessages, classroomId]);
  const currentWorkboardNotes = useMemo(() => workboardNotes.filter(n => n.ownerId === classroomId), [workboardNotes, classroomId]);
  const teacher = useMemo(() => users.find(u => u.id === classroom?.teacherId), [users, classroom]);
  const students = useMemo(() => users.filter(u => classroom?.studentIds.includes(u.id)), [users, classroom]);
  const participantsInCall = useMemo(() => {
    if (!isVideoChatJoined || !user) return [];
    const participants = [user, teacher];
    const otherStudent = students.find(s => s.id !== user.id);
    if (otherStudent) {
        participants.push(otherStudent);
    }
    return participants.filter(Boolean) as User[];
  }, [isVideoChatJoined, user, teacher, students]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);
  
  const fetchCopilotAnalysis = useCallback(async () => {
    if (!classroom) return;
    setIsCopilotLoading(true);
    setCopilotError(null);
    try {
        const analysis = await analyzeClassroomChat(chatProvider, classroom.subject, students, currentChatMessages, language, { ollamaModel });
        setCopilotAnalysis(analysis);
    } catch (err: any) {
        setCopilotError(err.message || 'An error occurred.');
    } finally {
        setIsCopilotLoading(false);
    }
  }, [chatProvider, classroom, students, currentChatMessages, ollamaModel, language]);

  useEffect(() => {
    if (user?.role === UserRole.TEACHER && classroomId) {
        fetchCopilotAnalysis(); // Initial analysis
        const interval = setInterval(fetchCopilotAnalysis, 30000); // Analyze every 30 seconds
        return () => clearInterval(interval);
    }
  }, [classroomId, user?.role, fetchCopilotAnalysis]);

  if (!user || !classroom) return <Navigate to="/" />;

  const isTeacher = user.role === UserRole.TEACHER && user.id === classroom.teacherId;
  const isSpectator = user.role === UserRole.ADMIN;

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSpectator || !chatInput.trim() || !classroomId) return;
    sendLiveChatMessage(classroomId, chatInput);
    setChatInput('');
  };

  const handleAddPost = () => {
    if (isSpectator || (!newPostText.trim() && !newPostImage) || !classroomId) return;
    addWorkboardNote(classroomId, newPostText, newPostColor, newPostImage || undefined);
    setNewPostText('');
    setNewPostImage(null);
    setPostModalOpen(false);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && classroomId) {
            uploadFileToClassroom(classroomId, file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
  
  const canModifyNote = (note: WorkboardNote) => !isSpectator && (isTeacher || user.id === note.userId);

  const onMouseDown = (e: React.MouseEvent, note: WorkboardNote) => {
    if (!canModifyNote(note)) return;
    setDraggingNote(note.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingNote || !workboardRef.current) return;
    const boardRect = workboardRef.current.getBoundingClientRect();
    const noteElement = document.getElementById(draggingNote);
    if (!noteElement) return;

    let x = e.clientX - boardRect.left - dragOffset.x;
    let y = e.clientY - boardRect.top - dragOffset.y;
    
    x = Math.max(0, Math.min(x, boardRect.width - noteElement.offsetWidth));
    y = Math.max(0, Math.min(y, boardRect.height - noteElement.offsetHeight));
    
    updateWorkboardNotePosition(draggingNote, { x, y });
  };

  const onMouseUp = () => setDraggingNote(null);
  
  return (
    <div className="flex flex-col h-[calc(100vh-160px)] font-fredoka">
       <div className="mb-4 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-extrabold dark:text-white">{t('digitalClassroom', { name: classroom.name })}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('welcomeToSession', { name: user.name })}</p>
            {isSpectator && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-400 rounded-lg text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                    <IconEye />
                    <span className="font-bold">{t('spectatorMode')}</span>
                </div>
            )}
        </div>
        {isTeacher && (
             <button onClick={() => setIsCopilotOpen(!isCopilotOpen)} className={`flex items-center gap-2 font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all ${isCopilotOpen ? 'bg-brand-purple text-white' : 'bg-brand-lime text-black'}`}>
                <IconBot /> {t('copilot')}
            </button>
        )}
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
        
        <div className={`lg:col-span-1 flex flex-col gap-6 h-full overflow-y-auto ${isCopilotOpen && isTeacher ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
            <Card className="p-4 bg-white dark:bg-gray-800 flex-shrink-0">
                <h2 className="font-bold text-xl mb-2 flex items-center gap-2"><IconVideoCamera />{t('videoChat')}</h2>
                {isVideoChatJoined ? (
                    <div className="bg-black rounded-lg p-2 flex flex-col h-full text-white">
                        {/* Main Video Area */}
                        <div className="flex-grow relative flex items-center justify-center bg-gray-900 rounded-md">
                            <Avatar user={teacher} className="w-24 h-24 opacity-80" />
                            <p className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm font-semibold">{teacher?.name}</p>

                            {/* Other participants as thumbnails */}
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                {participantsInCall.map(p => (
                                    <div key={p.id} className="relative w-24 h-16 bg-gray-700 rounded-md border-2 border-blue-500 flex items-center justify-center">
                                        <Avatar user={p} className="w-10 h-10" />
                                        <p className="absolute bottom-0.5 left-0.5 bg-black/50 px-1 rounded text-xs">{p.id === user?.id ? t('you') : p.name.split(' ')[0]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex-shrink-0 pt-4 flex justify-center items-center gap-3">
                            <button onClick={() => setIsMicMuted(prev => !prev)} className={`p-3 rounded-full ${isMicMuted ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'}`} title={isMicMuted ? t('unmute') : t('mute')}>
                                {isMicMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
                            </button>
                            <button onClick={() => setIsCameraOff(prev => !prev)} className={`p-3 rounded-full ${isCameraOff ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'}`} title={isCameraOff ? t('startVideo') : t('stopVideo')}>
                                {isCameraOff ? <IconVideoCameraOff /> : <IconVideoCamera />}
                            </button>
                            <button className="p-3 rounded-full bg-gray-600 text-white" title={t('raiseHand')}>
                                <IconHandRaised />
                            </button>
                            <button className="p-3 rounded-full bg-gray-600 text-white" title={t('screenShare')}>
                                <IconScreenShare />
                            </button>
                            <button onClick={() => setIsVideoChatJoined(false)} className="p-3 rounded-full bg-red-600 text-white ml-6" title={t('leaveCall')}>
                                <IconPhoneOff />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('videoChatPlaceholderDesc')}</p>
                        <button 
                            onClick={() => {
                                setIsVideoChatJoined(true);
                                setIsMicMuted(false);
                                setIsCameraOff(false);
                            }}
                            className="w-full bg-brand-lime text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all"
                        >
                            {t('joinCall')}
                        </button>
                    </div>
                )}
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-800 flex-shrink-0">
                <h2 className="font-bold text-xl mb-2 flex items-center gap-2"><IconUsers/>{t('participants')}</h2>
                <ul className="space-y-2">
                    {teacher && <li key={teacher.id} className="flex items-center gap-2 p-1 bg-purple-100 dark:bg-purple-900/50 rounded-md"><Avatar user={teacher} className="w-8 h-8" /> <span className="font-semibold">{teacher.name} {t('teacherRole')}</span></li>}
                    {students.map(s => <li key={s.id} className="flex items-center gap-2 p-1"><Avatar user={s} className="w-8 h-8" /> <span>{s.name}</span></li>)}
                </ul>
            </Card>

             <Card className="p-4 bg-white dark:bg-gray-800 flex-shrink-0">
                <h2 className="font-bold text-xl mb-2 flex items-center gap-2"><IconFile /> {t('classroomFiles')}</h2>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {classroom.files && classroom.files.length > 0 ? (
                        classroom.files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <a href={file.url} download={file.name} className="flex-grow text-sm font-semibold truncate hover:underline" title={file.name}>
                                    {file.name}
                                </a>
                                {isTeacher && (
                                    <button onClick={() => deleteClassroomFile(classroom.id, file.id)} className="ml-2 p-1 text-red-500 hover:text-red-700">
                                        <IconTrash />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center">{t('noFilesUploaded')}</p>
                    )}
                </div>
                {isTeacher && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button onClick={handleUploadClick} className="w-full mt-3 flex items-center justify-center gap-2 bg-brand-blue-light text-black font-bold py-2 px-3 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all text-sm">
                            <IconUpload /> {t('uploadFile')}
                        </button>
                    </>
                )}
            </Card>


            <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-xl shadow-hard-sm">
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {currentChatMessages.map(msg => {
                      const messageUser = users.find(u => u.id === msg.userId);
                      return (
                        <div key={msg.id} className={`flex items-start gap-2.5 ${msg.userId === user.id ? 'justify-end' : ''}`}>
                            {msg.userId !== user.id && <Avatar user={messageUser} className="w-8 h-8 flex-shrink-0" />}
                            <div className={`fvd-chat-bubble p-2 rounded-lg max-w-xs ${msg.userRole === UserRole.TEACHER ? 'bg-brand-purple text-white' : (msg.userId === user.id ? 'bg-brand-blue-light text-black' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white')}`}>
                                <p className="font-bold text-sm">{msg.userName}</p>
                                <p className="break-words">{msg.text}</p>
                            </div>
                            {msg.userId === user.id && <Avatar user={messageUser} className="w-8 h-8 flex-shrink-0" />}
                        </div>
                      )
                    })}
                    <div ref={chatEndRef}></div>
                </div>
                <form onSubmit={handleChatSubmit} className="p-2 border-t-2 border-black dark:border-gray-700 flex items-center gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={isSpectator ? t('spectatorModeActive') : t('sendMessage')} disabled={isSpectator} className="w-full p-2 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:outline-none disabled:cursor-not-allowed" />
                    <button type="submit" disabled={isSpectator} className="p-2 bg-brand-purple text-white rounded-full border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed"> <IconSend /> </button>
                </form>
            </div>
        </div>

        <div className={`${isCopilotOpen && isTeacher ? 'lg:col-span-2' : 'lg:col-span-3'} h-full relative`} ref={workboardRef} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
            <div className="absolute inset-0 bg-dots dark:bg-dots-dark" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.2) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            <button onClick={() => setPostModalOpen(true)} disabled={isSpectator} className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none">
                <IconPlus /> {t('addPost')}
            </button>

            {currentWorkboardNotes.map(note => (
                <div id={note.id} key={note.id} className={`absolute p-1 w-52 border-2 border-black rounded-lg shadow-hard flex flex-col ${note.color} ${canModifyNote(note) ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} style={{ top: note.position.y, left: note.position.x, userSelect: 'none' }} onMouseDown={(e) => onMouseDown(e, note)} >
                    {note.image && <img src={note.image} alt="User upload" className="w-full h-32 object-cover rounded-t-md mb-1"/>}
                    <div className="p-2 flex-grow">
                        <p className="font-semibold break-words text-black">{note.text}</p>
                    </div>
                    {canModifyNote(note) && <button onClick={(e) => { e.stopPropagation(); deleteWorkboardNote(note.id);}} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full border border-black"><IconClose/></button>}
                </div>
            ))}
        </div>

        {isCopilotOpen && isTeacher && (
             <div className="lg:col-span-1 flex flex-col h-full overflow-y-auto">
                 <Card className="p-4 bg-white dark:bg-gray-800 flex-grow flex flex-col">
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-xl flex items-center gap-2"><IconBot /> {t('aiCopilot')}</h2>
                        <button onClick={fetchCopilotAnalysis} disabled={isCopilotLoading} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:cursor-wait">
                            <IconRefresh className={isCopilotLoading ? "animate-spin" : ""} />
                        </button>
                     </div>
                     <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-4 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg">
                        {isCopilotLoading && !copilotAnalysis && <p>{t('analyzingChat')}</p>}
                        {copilotError && <p className="text-red-500">{copilotError}</p>}
                        {copilotAnalysis && (
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: copilotAnalysis.replace(/\n/g, '<br />').replace(/### (.*?)<br \/>/g, '<h3>$1</h3>') }}
                            />
                        )}
                     </div>
                 </Card>
             </div>
        )}

      </div>
      
      {isPostModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPostModalOpen(false)}>
              <Card className="fvd-modal p-6 bg-white dark:bg-gray-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold mb-4">{t('addNewPost')}</h2>
                  <div className="space-y-4">
                      <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder={t('postText')} className="w-full p-2 h-24 bg-gray-200 dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg focus:outline-none"/>
                      <div>
                        <label htmlFor="image-upload" className="w-full flex items-center justify-center gap-2 p-3 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-black dark:border-gray-500 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"> <IconPhoto /> <span>{t('uploadImage')}</span></label>
                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                        {newPostImage && <img src={newPostImage} alt="Preview" className="mt-2 rounded-md max-h-32 w-auto mx-auto"/>}
                      </div>
                      <div className="flex justify-between items-center">
                          <p className="font-bold">{t('color')}</p>
                          <div className="flex gap-2">
                              {NOTE_COLORS.map(color => (
                                  <button key={color} onClick={() => setNewPostColor(color)} className={`w-8 h-8 rounded-full ${color} border-2 ${newPostColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}></button>
                              ))}
                          </div>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setPostModalOpen(false)} className="w-full bg-gray-300 text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('cancel')}</button>
                        <button onClick={handleAddPost} className="w-full bg-brand-lime text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-hard-sm hover:shadow-none transition-all">{t('addPost')}</button>
                      </div>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};

export default ClassroomPage;