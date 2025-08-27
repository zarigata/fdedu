import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole, Classroom, Submission, AIProvider, KnowledgeNode, Theme, LiveChatMessage, WorkboardNote, Assignment, StoreItem, AdaptivePathway, Language, ClassroomFile, StudyDeck, Flashcard, Project, ProjectGroup, Task, ProjectChatMessage, DailyLogEntry } from '../types';
import { USERS as INITIAL_USERS, STORE_ITEMS as INITIAL_STORE_ITEMS } from '../data/mockData';

interface AppContextType {
  user: User | null;
  users: User[];
  classrooms: Classroom[];
  submissions: Submission[];
  academicProvider: AIProvider;
  chatProvider: AIProvider;
  ollamaModel: string;
  knowledgeGraph: KnowledgeNode[];
  theme: Theme;
  language: Language;
  liveChatMessages: LiveChatMessage[];
  workboardNotes: WorkboardNote[];
  storeItems: StoreItem[];
  translations: Record<Language, Record<string, string>> | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'avatar' | 'points' | 'purchasedItems' | 'activeAvatarFrameId' | 'activePetId' | 'activeThemeId' | 'aiTokens' | 'aiUsageTimestamps'>) => void;
  updateUser: (userId: string, updatedData: Partial<Omit<User, 'id' | 'avatar'>>) => void;
  deleteUser: (userId: string) => void;
  updateUserAvatar: (userId: string) => void;
  addClassroom: (classroom: Omit<Classroom, 'id' | 'publicId' | 'entryPassword'>) => Classroom;
  updateClassroom: (classroomId: string, data: { name: string; subject: string }) => void;
  deleteClassroom: (classroomId: string) => void;
  assignStudentToClassroom: (studentId: string, classroomId: string) => void;
  removeStudentFromClassroom: (studentId: string, classroomId: string) => void;
  joinClassroom: (publicId: string, password: string) => { success: boolean; message: string; };
  addAssignmentsToClassroom: (classroomId: string, newAssignments: Assignment[]) => void;
  addAdaptiveAssignmentsToClassroom: (classroomId: string, pathways: AdaptivePathway[]) => void;
  updateAssignmentDueDate: (classroomId: string, assignmentId: string, dueDate: string | null) => void;
  addSubmission: (submission: Omit<Submission, 'id'>) => void;
  gradeSubmission: (assignmentId: string, studentId: string, grade: number | null, feedback?: string) => void;
  setAcademicProvider: (provider: AIProvider) => void;
  setChatProvider: (provider: AIProvider) => void;
  setOllamaModel: (model: string) => void;
  addKnowledgeNode: (node: Omit<KnowledgeNode, 'id' | 'timestamp'>) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  sendLiveChatMessage: (classroomId: string, text: string) => void;
  addWorkboardNote: (ownerId: string, text: string, color: string, image?: string) => void;
  updateWorkboardNotePosition: (noteId: string, position: { x: number; y: number }) => void;
  deleteWorkboardNote: (noteId: string) => void;
  purchaseItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  uploadFileToClassroom: (classroomId: string, file: File) => void;
  deleteClassroomFile: (classroomId: string, fileId: string) => void;
  uploadFileToAssignment: (classroomId: string, assignmentId: string, file: File) => void;
  deleteFileFromAssignment: (classroomId: string, assignmentId: string, fileId: string) => void;
  createStudyDeck: (name: string, subject: string) => void;
  deleteStudyDeck: (deckId: string) => void;
  updateStudyDeckDetails: (deckId: string, name: string, subject: string) => void;
  addCardToDeck: (deckId: string, cardData: Omit<Flashcard, 'id'>) => void;
  updateCardInDeck: (deckId: string, cardId: string, cardData: Omit<Flashcard, 'id'>) => void;
  deleteCardFromDeck: (deckId: string, cardId: string) => void;
  // Project Hub Functions
  createProject: (classroomId: string, projectData: Omit<Project, 'id' | 'classroomId' | 'groups'>, groupsData: Omit<ProjectGroup, 'id' | 'tasks' | 'files' | 'chatMessages' | 'workboardNotes'>[]) => void;
  deleteProject: (classroomId: string, projectId: string) => void;
  addProjectTask: (classroomId: string, projectId: string, groupId: string, text: string) => void;
  toggleProjectTask: (classroomId: string, projectId: string, groupId: string, taskId: string) => void;
  sendProjectChatMessage: (classroomId: string, projectId: string, groupId: string, text: string, image?: string) => void;
  uploadFileToProjectGroup: (classroomId: string, projectId: string, groupId: string, file: File) => void;
  deleteFileFromProjectGroup: (classroomId: string, projectId: string, groupId: string, fileId: string) => void;
  // AI Resource Management
  checkAndConsumeAIResource: (feature: string, options: { cost?: number; isHeavy?: boolean }) => Promise<void>;
  refillAITokens: (userId: string, amount: number) => void;
  // Daily Log Functions
  addDailyLog: (classroomId: string, logData: Omit<DailyLogEntry, 'id'>) => void;
  updateDailyLog: (classroomId: string, logId: string, updatedData: Partial<Omit<DailyLogEntry, 'id'>>) => void;
  deleteDailyLog: (classroomId: string, logId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// A simple function to get data from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadFromStorage('fvd-user', null));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('fvd-users', INITIAL_USERS));
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => loadFromStorage('fvd-classrooms', []));
  const [submissions, setSubmissions] = useState<Submission[]>(() => loadFromStorage('fvd-submissions', []));
  const [academicProvider, setAcademicProvider] = useState<AIProvider>(() => loadFromStorage('fvd-academicProvider', AIProvider.GEMINI));
  const [chatProvider, setChatProvider] = useState<AIProvider>(() => loadFromStorage('fvd-chatProvider', AIProvider.GEMINI));
  const [ollamaModel, setOllamaModel] = useState<string>(() => loadFromStorage('fvd-ollamaModel', 'llama3'));
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeNode[]>(() => loadFromStorage('fvd-knowledgeGraph', []));
  const [theme, setTheme] = useState<Theme>(() => loadFromStorage('fvd-theme', Theme.LIGHT));
  const [language, setLanguage] = useState<Language>(() => loadFromStorage('fvd-language', 'en'));
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>(() => loadFromStorage('fvd-liveChat', []));
  const [workboardNotes, setWorkboardNotes] = useState<WorkboardNote[]>(() => loadFromStorage('fvd-workboard', []));
  const [storeItems] = useState<StoreItem[]>(() => loadFromStorage('fvd-storeItems', INITIAL_STORE_ITEMS));
  const [translations, setTranslations] = useState<Record<Language, Record<string, string>> | null>(null);


  // Persist state to localStorage whenever it changes
  useEffect(() => { localStorage.setItem('fvd-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('fvd-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('fvd-classrooms', JSON.stringify(classrooms)); }, [classrooms]);
  useEffect(() => { localStorage.setItem('fvd-submissions', JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem('fvd-academicProvider', JSON.stringify(academicProvider)); }, [academicProvider]);
  useEffect(() => { localStorage.setItem('fvd-chatProvider', JSON.stringify(chatProvider)); }, [chatProvider]);
  useEffect(() => { localStorage.setItem('fvd-ollamaModel', JSON.stringify(ollamaModel)); }, [ollamaModel]);
  useEffect(() => { localStorage.setItem('fvd-knowledgeGraph', JSON.stringify(knowledgeGraph)); }, [knowledgeGraph]);
  useEffect(() => { localStorage.setItem('fvd-liveChat', JSON.stringify(liveChatMessages)); }, [liveChatMessages]);
  useEffect(() => { localStorage.setItem('fvd-workboard', JSON.stringify(workboardNotes)); }, [workboardNotes]);
  useEffect(() => { localStorage.setItem('fvd-storeItems', JSON.stringify(storeItems)); }, [storeItems]);
  useEffect(() => { localStorage.setItem('fvd-language', JSON.stringify(language)); }, [language]);

  // Load all translation files on initial app load
  useEffect(() => {
    const loadAllTranslations = async () => {
        try {
            const [enRes, ptRes, jaRes, esRes] = await Promise.all([
                fetch('/locales/en.json'),
                fetch('/locales/pt.json'),
                fetch('/locales/ja.json'),
                fetch('/locales/es.json')
            ]);
            if (!enRes.ok || !ptRes.ok || !jaRes.ok || !esRes.ok) {
                 throw new Error('Failed to fetch one or more translation files.');
            }
            const en = await enRes.json();
            const pt = await ptRes.json();
            const ja = await jaRes.json();
            const es = await esRes.json();
            setTranslations({ en, pt, ja, es });
        } catch (error) {
            console.error("Failed to load translation files:", error);
        }
    };
    loadAllTranslations();
  }, []);

  useEffect(() => { 
    localStorage.setItem('fvd-theme', JSON.stringify(theme));
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply active theme to body
  useEffect(() => {
    const activeTheme = user?.activeThemeId || 'theme-default';
    document.body.className = ''; // Clear previous theme classes
    document.body.classList.add(`${activeTheme}`);
    // Re-apply dark/light mode class
    if (theme === Theme.DARK) {
        document.body.classList.add('dark');
    }
  }, [user?.activeThemeId, theme]);

  // This effect listens for changes in localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'fvd-liveChat' && event.newValue) {
        setLiveChatMessages(JSON.parse(event.newValue));
      }
      if (event.key === 'fvd-workboard' && event.newValue) {
        setWorkboardNotes(JSON.parse(event.newValue));
      }
       if (event.key === 'fvd-users' && event.newValue) {
        setUsers(JSON.parse(event.newValue));
      }
       if (event.key === 'fvd-classrooms' && event.newValue) {
        setClassrooms(JSON.parse(event.newValue));
      }
       if (event.key === 'fvd-submissions' && event.newValue) {
        setSubmissions(JSON.parse(event.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const login = useCallback((email: string, password: string): boolean => {
    const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (userToLogin) {
      setUser(userToLogin);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id' | 'avatar' | 'points' | 'purchasedItems' | 'activeAvatarFrameId' | 'activePetId' | 'activeThemeId' | 'aiTokens' | 'aiUsageTimestamps'>) => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      points: 100, // Welcome gift
      aiTokens: userData.role === UserRole.TEACHER ? 500 : (userData.role === UserRole.SCHOOL_MANAGER ? 2000 : 100), // Managers and teachers get more tokens
      aiUsageTimestamps: {},
      purchasedItems: ['theme-default'],
      activeAvatarFrameId: null,
      activePetId: null,
      activeThemeId: 'theme-default',
      studyDecks: [],
    };
    
    // School ID assignment logic
    if (user?.role === UserRole.SCHOOL_MANAGER) {
      newUser.schoolId = user.schoolId;
    } else if (userData.role === UserRole.SCHOOL_MANAGER) {
      newUser.schoolId = `school-${Date.now()}`;
    }

    setUsers(prev => [...prev, newUser]);
  }, [user]);
  
  const updateUser = useCallback((userId: string, updatedData: Partial<Omit<User, 'id' | 'avatar'>>) => {
      setUsers(prevUsers => prevUsers.map(u => 
          u.id === userId ? { ...u, ...updatedData } : u
      ));
      if (user?.id === userId) {
          setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } as User : null);
      }
  }, [user]);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setClassrooms(prev => prev.map(c => ({
        ...c,
        studentIds: c.studentIds.filter(id => id !== userId)
    })));
  }, []);

  const updateUserAvatar = useCallback((userId: string) => {
    const newAvatar = `https://i.pravatar.cc/150?u=${Date.now()}`;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: newAvatar } : u));
     if (user?.id === userId) {
        setUser(prevUser => prevUser ? { ...prevUser, avatar: newAvatar } : null);
    }
  }, [user]);
  
  const addClassroom = useCallback((classroomData: Omit<Classroom, 'id' | 'publicId' | 'entryPassword'>): Classroom => {
    const newClassroom: Classroom = {
      ...classroomData,
      id: `c${Date.now()}`,
      publicId: Math.random().toString(36).substring(2, 8).toUpperCase(),
      entryPassword: Math.floor(1000 + Math.random() * 9000).toString(),
    };
    setClassrooms(prev => [...prev, newClassroom]);
    return newClassroom;
  }, []);

  const updateClassroom = useCallback((classroomId: string, data: { name: string; subject: string }) => {
    setClassrooms(prev => prev.map(c => 
      c.id === classroomId ? { ...c, ...data } : c
    ));
  }, []);

  const deleteClassroom = useCallback((classroomId: string) => {
    // Also delete associated chat messages and workboard notes
    const classroomToDelete = classrooms.find(c => c.id === classroomId);
    if (classroomToDelete) {
        const groupIds = (classroomToDelete.projects || []).flatMap(p => p.groups.map(g => g.id));
        setWorkboardNotes(prev => prev.filter(n => n.ownerId !== classroomId && !groupIds.includes(n.ownerId)));
    }
    setLiveChatMessages(prev => prev.filter(m => m.classroomId !== classroomId));
    setClassrooms(prev => prev.filter(c => c.id !== classroomId));
  }, [classrooms]);

  const assignStudentToClassroom = useCallback((studentId: string, classroomId: string) => {
    setClassrooms(prev => prev.map(c => {
      if (c.id === classroomId && !c.studentIds.includes(studentId)) {
        return { ...c, studentIds: [...c.studentIds, studentId] };
      }
      return c;
    }));
  }, []);

  const removeStudentFromClassroom = useCallback((studentId: string, classroomId: string) => {
    setClassrooms(prev => prev.map(c => {
      if (c.id === classroomId) {
        return { ...c, studentIds: c.studentIds.filter(id => id !== studentId) };
      }
      return c;
    }));
  }, []);

  const joinClassroom = useCallback((publicId: string, password: string): { success: boolean; message: string; } => {
    if (!user || user.role !== UserRole.STUDENT) {
        return { success: false, message: 'Only students can join classrooms.' };
    }

    const classroomTarget = classrooms.find(c => c.publicId.toUpperCase() === publicId.toUpperCase());
    if (!classroomTarget) {
        return { success: false, message: 'Classroom ID not found.' };
    }
    if (classroomTarget.entryPassword !== password) {
        return { success: false, message: 'Incorrect password.' };
    }
    if (classroomTarget.studentIds.includes(user.id)) {
        return { success: false, message: 'You are already enrolled in this class.' };
    }
    
    assignStudentToClassroom(user.id, classroomTarget.id);
    return { success: true, message: `Successfully joined ${classroomTarget.name}!` };

  }, [user, classrooms, assignStudentToClassroom]);
  
  const addAssignmentsToClassroom = useCallback((classroomId: string, newAssignments: Assignment[]) => {
      setClassrooms(prev => prev.map(c => {
          if (c.id === classroomId) {
              return { ...c, assignments: [...c.assignments, ...newAssignments] };
          }
          return c;
      }));
  }, []);

  const addAdaptiveAssignmentsToClassroom = useCallback((classroomId: string, pathways: AdaptivePathway[]) => {
      setClassrooms(prev => prev.map(c => {
          if (c.id === classroomId) {
              const newAssignments: Assignment[] = pathways.map((pathway, index) => ({
                  id: `a-ada-${Date.now()}-${index}`,
                  title: pathway.assignment.title,
                  description: pathway.assignment.description,
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week
                  questions: pathway.assignment.questions.map((q, qIndex) => ({...q, id: `q-ada-${Date.now()}-${index}-${qIndex}`})),
                  studentIds: pathway.studentIds,
              }));
              return { ...c, assignments: [...c.assignments, ...newAssignments] };
          }
          return c;
      }));
  }, []);
  
  const updateAssignmentDueDate = useCallback((classroomId: string, assignmentId: string, dueDate: string | null) => {
    setClassrooms(prev => prev.map(c => {
        if (c.id === classroomId) {
            const updatedAssignments = c.assignments.map(a => {
                if (a.id === assignmentId) {
                    return { ...a, dueDate: dueDate };
                }
                return a;
            });
            return { ...c, assignments: updatedAssignments };
        }
        return c;
    }));
  }, []);


  const addSubmission = useCallback((submissionData: Omit<Submission, 'id'>) => {
    const newSubmission: Submission = {
      ...submissionData,
      id: `s${Date.now()}`
    };
    setSubmissions(prev => [...prev, newSubmission]);
  }, []);

  const gradeSubmission = useCallback((assignmentId: string, studentId: string, grade: number | null, feedback?: string) => {
    setSubmissions(prevSubs => {
        const existingSubIndex = prevSubs.findIndex(s => s.assignmentId === assignmentId && s.studentId === studentId);

        if (existingSubIndex > -1) {
            // Update existing submission
            const newSubs = [...prevSubs];
            const currentSub = newSubs[existingSubIndex];
            newSubs[existingSubIndex] = {
                ...currentSub,
                grade: grade,
                feedback: feedback !== undefined ? feedback : currentSub.feedback,
            };
            return newSubs;
        } else {
            // Create new submission if one doesn't exist
            const newSub: Submission = {
                id: `s${Date.now()}-${studentId}-${assignmentId}`,
                assignmentId,
                studentId,
                answers: [], // No answers as it wasn't submitted through the app
                grade,
                feedback: feedback || ''
            };
            return [...prevSubs, newSub];
        }
    });
  }, []);


  const addKnowledgeNode = useCallback((nodeData: Omit<KnowledgeNode, 'id' | 'timestamp'>) => {
    const newNode: KnowledgeNode = {
        ...nodeData,
        id: `kn-${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    setKnowledgeGraph(prev => [newNode, ...prev]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  }, []);
  
  const sendLiveChatMessage = useCallback((classroomId: string, text: string) => {
    if (!user) return;
    const newMessage: LiveChatMessage = {
        id: `lcm-${Date.now()}`,
        classroomId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userRole: user.role,
        text,
        timestamp: Date.now(),
    };
    setLiveChatMessages(prev => [...prev, newMessage]);
  }, [user]);

  const addWorkboardNote = useCallback((ownerId: string, text: string, color: string, image?: string) => {
    if (!user) return;
    const newNote: WorkboardNote = {
      id: `wbn-${Date.now()}`,
      ownerId: ownerId,
      userId: user.id,
      text,
      color,
      position: { x: 50, y: 50 },
      image: image || undefined,
    };
    setWorkboardNotes(prev => [...prev, newNote]);
  }, [user]);

  const updateWorkboardNotePosition = useCallback((noteId: string, position: { x: number; y: number }) => {
    setWorkboardNotes(prev => prev.map(note => note.id === noteId ? { ...note, position } : note));
  }, []);

  const deleteWorkboardNote = useCallback((noteId: string) => {
    setWorkboardNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  const purchaseItem = useCallback((itemId: string) => {
    if (!user) return false;
    
    const item = storeItems.find(i => i.id === itemId);
    if (!item || user.points < item.price || user.purchasedItems.includes(itemId)) {
      return false;
    }
    
    const updatedUser = {
      ...user,
      points: user.points - item.price,
      purchasedItems: [...user.purchasedItems, itemId]
    };
    
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    return true;
  }, [user, storeItems]);

  const equipItem = useCallback((itemId: string) => {
    if (!user) return;

    const item = storeItems.find(i => i.id === itemId);
    if (!item || !user.purchasedItems.includes(itemId)) return;

    let updatedUser: User;
    if (item.type === 'AVATAR_FRAME') {
      updatedUser = {...user, activeAvatarFrameId: user.activeAvatarFrameId === itemId ? null : itemId };
    } else if (item.type === 'PET') {
      updatedUser = {...user, activePetId: user.activePetId === itemId ? null : itemId };
    } else if (item.type === 'THEME') {
      updatedUser = {...user, activeThemeId: user.activeThemeId === itemId ? null : itemId };
    } else {
      return;
    }

    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  }, [user, storeItems]);
  
  const uploadFileToClassroom = useCallback((classroomId: string, file: File) => {
    if (!user || user.role !== UserRole.TEACHER) return;

    const newFile: ClassroomFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file), // Create a temporary local URL
      fileType: file.type,
      uploadedBy: user.id
    };

    setClassrooms(prev => prev.map(c => {
      if (c.id === classroomId) {
        const updatedFiles = c.files ? [...c.files, newFile] : [newFile];
        return { ...c, files: updatedFiles };
      }
      return c;
    }));
  }, [user]);

  const deleteClassroomFile = useCallback((classroomId: string, fileId: string) => {
     if (!user || user.role !== UserRole.TEACHER) return;

    setClassrooms(prev => prev.map(c => {
      if (c.id === classroomId) {
        const updatedFiles = c.files?.filter(f => f.id !== fileId) || [];
        return { ...c, files: updatedFiles };
      }
      return c;
    }));
  }, [user]);

  const uploadFileToAssignment = useCallback((classroomId: string, assignmentId: string, file: File) => {
    if (!user || user.role !== UserRole.TEACHER) return;

    const newFile: ClassroomFile = {
      id: `file-assign-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      fileType: file.type,
      uploadedBy: user.id
    };

    setClassrooms(prev => prev.map(c => {
      if (c.id === classroomId) {
        const updatedAssignments = c.assignments.map(a => {
          if (a.id === assignmentId) {
            const updatedFiles = a.files ? [...a.files, newFile] : [newFile];
            return { ...a, files: updatedFiles };
          }
          return a;
        });
        return { ...c, assignments: updatedAssignments };
      }
      return c;
    }));
  }, [user]);

  const deleteFileFromAssignment = useCallback((classroomId: string, assignmentId: string, fileId: string) => {
    if (!user || user.role !== UserRole.TEACHER) return;

    setClassrooms(prev => prev.map(c => {
      if (c.id === classroomId) {
        const updatedAssignments = c.assignments.map(a => {
          if (a.id === assignmentId) {
            const updatedFiles = a.files?.filter(f => f.id !== fileId) || [];
            return { ...a, files: updatedFiles };
          }
          return a;
        });
        return { ...c, assignments: updatedAssignments };
      }
      return c;
    }));
  }, [user]);

  const updateUserWithNewData = (updatedUser: User) => {
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  
  const createStudyDeck = useCallback((name: string, subject: string) => {
    if (!user) return;
    const newDeck: StudyDeck = {
        id: `deck-${Date.now()}`,
        name,
        subject,
        cards: []
    };
    const updatedUser = {
        ...user,
        studyDecks: [...(user.studyDecks || []), newDeck]
    };
    updateUserWithNewData(updatedUser);
  }, [user]);

  const deleteStudyDeck = useCallback((deckId: string) => {
    if (!user) return;
    const updatedUser = {
        ...user,
        studyDecks: (user.studyDecks || []).filter(deck => deck.id !== deckId)
    };
    updateUserWithNewData(updatedUser);
  }, [user]);
  
  const updateStudyDeckDetails = useCallback((deckId: string, name: string, subject: string) => {
    if (!user) return;
    const updatedDecks = (user.studyDecks || []).map(deck => 
        deck.id === deckId ? { ...deck, name, subject } : deck
    );
    updateUserWithNewData({ ...user, studyDecks: updatedDecks });
  }, [user]);


  const addCardToDeck = useCallback((deckId: string, cardData: Omit<Flashcard, 'id'>) => {
    if (!user) return;
    const newCard: Flashcard = { ...cardData, id: `card-${Date.now()}` };
    const updatedDecks = (user.studyDecks || []).map(deck => {
        if (deck.id === deckId) {
            return { ...deck, cards: [...deck.cards, newCard] };
        }
        return deck;
    });
    updateUserWithNewData({ ...user, studyDecks: updatedDecks });
  }, [user]);

  const updateCardInDeck = useCallback((deckId: string, cardId: string, cardData: Omit<Flashcard, 'id'>) => {
    if (!user) return;
    const updatedDecks = (user.studyDecks || []).map(deck => {
        if (deck.id === deckId) {
            const updatedCards = deck.cards.map(card => 
                card.id === cardId ? { ...card, ...cardData } : card
            );
            return { ...deck, cards: updatedCards };
        }
        return deck;
    });
    updateUserWithNewData({ ...user, studyDecks: updatedDecks });
  }, [user]);

  const deleteCardFromDeck = useCallback((deckId: string, cardId: string) => {
    if (!user) return;
    const updatedDecks = (user.studyDecks || []).map(deck => {
        if (deck.id === deckId) {
            return { ...deck, cards: deck.cards.filter(card => card.id !== cardId) };
        }
        return deck;
    });
    updateUserWithNewData({ ...user, studyDecks: updatedDecks });
  }, [user]);
  
  // --- PROJECT HUB FUNCTIONS ---
    const createProject = useCallback((classroomId: string, projectData: Omit<Project, 'id' | 'classroomId' | 'groups'>, groupsData: Omit<ProjectGroup, 'id' | 'tasks' | 'files' | 'chatMessages' | 'workboardNotes'>[]) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            classroomId,
            ...projectData,
            groups: groupsData.map((g, i) => ({
                ...g,
                id: `pg-${Date.now()}-${i}`,
                tasks: [],
                files: [],
                chatMessages: [],
                workboardNotes: []
            }))
        };
        setClassrooms(prev => prev.map(c => 
            c.id === classroomId 
                ? { ...c, projects: [...(c.projects || []), newProject] } 
                : c
        ));
    }, []);

    const deleteProject = useCallback((classroomId: string, projectId: string) => {
        setClassrooms(prev => prev.map(c => 
            c.id === classroomId 
                ? { ...c, projects: (c.projects || []).filter(p => p.id !== projectId) }
                : c
        ));
    }, []);

    const mapNestedProjectState = (classroomId: string, projectId: string, groupId: string, updateGroup: (g: ProjectGroup) => ProjectGroup) => {
        setClassrooms(prev => prev.map(c => {
            if (c.id !== classroomId) return c;
            return {
                ...c,
                projects: (c.projects || []).map(p => {
                    if (p.id !== projectId) return p;
                    return {
                        ...p,
                        groups: p.groups.map(g => {
                            if (g.id !== groupId) return g;
                            return updateGroup(g);
                        })
                    };
                })
            };
        }));
    };
    
    const addProjectTask = useCallback((classroomId: string, projectId: string, groupId: string, text: string) => {
        const newTask: Task = { id: `task-${Date.now()}`, text, isCompleted: false, assignedTo: null };
        mapNestedProjectState(classroomId, projectId, groupId, g => ({ ...g, tasks: [...g.tasks, newTask] }));
    }, []);

    const toggleProjectTask = useCallback((classroomId: string, projectId: string, groupId: string, taskId: string) => {
        mapNestedProjectState(classroomId, projectId, groupId, g => ({
            ...g,
            tasks: g.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
        }));
    }, []);
    
    const sendProjectChatMessage = useCallback((classroomId: string, projectId: string, groupId: string, text: string, image?: string) => {
        if (!user) return;
        const newMessage: ProjectChatMessage = {
            id: `pcm-${Date.now()}`,
            groupId,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            text,
            timestamp: Date.now(),
            image
        };
        mapNestedProjectState(classroomId, projectId, groupId, g => ({ ...g, chatMessages: [...g.chatMessages, newMessage] }));
    }, [user]);

    const uploadFileToProjectGroup = useCallback((classroomId: string, projectId: string, groupId: string, file: File) => {
        if (!user) return;
        const newFile: ClassroomFile = {
            id: `pfile-${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file),
            fileType: file.type,
            uploadedBy: user.id
        };
        mapNestedProjectState(classroomId, projectId, groupId, g => ({ ...g, files: [...g.files, newFile] }));
    }, [user]);

    const deleteFileFromProjectGroup = useCallback((classroomId: string, projectId: string, groupId: string, fileId: string) => {
        mapNestedProjectState(classroomId, projectId, groupId, g => ({ ...g, files: g.files.filter(f => f.id !== fileId)}));
    }, []);

    // --- AI RESOURCE MANAGEMENT ---
    const checkAndConsumeAIResource = useCallback(async (feature: string, options: { cost?: number; isHeavy?: boolean }): Promise<void> => {
        if (!user) {
            throw new Error("User not logged in.");
        }
        const { cost = 1, isHeavy = false } = options;

        // 1. Check tokens
        if (user.aiTokens < cost) {
            throw new Error(`INSUFFICIENT_TOKENS::${user.aiTokens}::${cost}`);
        }

        // 2. Check cooldown for heavy tasks
        if (isHeavy) {
            const lastUsage = user.aiUsageTimestamps?.[feature];
            if (lastUsage) {
                const twentyFourHours = 24 * 60 * 60 * 1000;
                const timeSinceLastUsage = Date.now() - lastUsage;
                if (timeSinceLastUsage < twentyFourHours) {
                    const timeLeft = twentyFourHours - timeSinceLastUsage;
                    throw new Error(`COOLDOWN::${feature}::${timeLeft}`);
                }
            }
        }
        
        // 3. If checks pass, consume resources
        const updatedUser: User = { 
            ...user,
            aiTokens: user.aiTokens - cost,
            aiUsageTimestamps: isHeavy 
                ? { ...user.aiUsageTimestamps, [feature]: Date.now() }
                : user.aiUsageTimestamps
        };
        
        // 4. Update state
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

    }, [user, setUser, setUsers]);
    
    const refillAITokens = useCallback((userId: string, amount: number) => {
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                const updatedUser = { ...u, aiTokens: (u.aiTokens || 0) + amount };
                if (user?.id === userId) {
                    setUser(updatedUser);
                }
                return updatedUser;
            }
            return u;
        }));
    }, [user, setUser, setUsers]);
    
    // --- DAILY LOG FUNCTIONS ---
    const addDailyLog = useCallback((classroomId: string, logData: Omit<DailyLogEntry, 'id'>) => {
        const newLog: DailyLogEntry = { ...logData, id: `log-${Date.now()}`};
        setClassrooms(prev => prev.map(c => c.id === classroomId ? { ...c, dailyLogs: [newLog, ...(c.dailyLogs || [])] } : c ));
    }, []);

    const updateDailyLog = useCallback((classroomId: string, logId: string, updatedData: Partial<Omit<DailyLogEntry, 'id'>>) => {
        setClassrooms(prev => prev.map(c => {
            if (c.id !== classroomId) return c;
            const updatedLogs = (c.dailyLogs || []).map(log => log.id === logId ? { ...log, ...updatedData } : log);
            return { ...c, dailyLogs: updatedLogs };
        }));
    }, []);

    const deleteDailyLog = useCallback((classroomId: string, logId: string) => {
        setClassrooms(prev => prev.map(c => {
            if (c.id !== classroomId) return c;
            const updatedLogs = (c.dailyLogs || []).filter(log => log.id !== logId);
            return { ...c, dailyLogs: updatedLogs };
        }));
    }, []);


  const contextValue = {
    user, users, classrooms, submissions, login, logout, addUser, updateUser, deleteUser, 
    updateUserAvatar, addClassroom, updateClassroom, deleteClassroom, addSubmission, gradeSubmission, 
    academicProvider, chatProvider, setAcademicProvider, setChatProvider,
    ollamaModel, setOllamaModel,
    knowledgeGraph, addKnowledgeNode, theme, toggleTheme, language, setLanguage, liveChatMessages, workboardNotes,
    sendLiveChatMessage, addWorkboardNote, updateWorkboardNotePosition, deleteWorkboardNote,
    assignStudentToClassroom, removeStudentFromClassroom, joinClassroom, addAssignmentsToClassroom, storeItems,
    purchaseItem, equipItem, addAdaptiveAssignmentsToClassroom,
    updateAssignmentDueDate,
    translations,
    uploadFileToClassroom,
    deleteClassroomFile,
    uploadFileToAssignment,
    deleteFileFromAssignment,
    createStudyDeck,
    deleteStudyDeck,
    updateStudyDeckDetails,
    addCardToDeck,
    updateCardInDeck,
    deleteCardFromDeck,
    createProject,
    deleteProject,
    addProjectTask,
    toggleProjectTask,
    sendProjectChatMessage,
    uploadFileToProjectGroup,
    deleteFileFromProjectGroup,
    checkAndConsumeAIResource,
    refillAITokens,
    addDailyLog,
    updateDailyLog,
    deleteDailyLog,
  };

  if (!translations) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-stone-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <h1 className="text-2xl font-bold font-fredoka">Loading FeVeDucation...</h1>
        </div>
      );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};