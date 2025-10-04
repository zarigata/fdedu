



export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  SCHOOL_MANAGER = 'school_manager',
}

export enum AIProvider {
  GEMINI = 'gemini',
  OPENROUTER = 'openrouter',
  OLLAMA = 'ollama',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export type Language = 'en' | 'pt' | 'ja' | 'es';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface StudyDeck {
  id: string;
  name: string;
  subject: string;
  cards: Flashcard[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  points: number;
  aiTokens: number; // NEW: Tracks available AI credits
  aiUsageTimestamps: Record<string, number>; // NEW: Tracks cooldowns for heavy features
  purchasedItems: string[]; // array of store item IDs
  activeAvatarFrameId: string | null;
  activePetId: string | null;
  activeThemeId: string | null;
  schoolId?: string; // NEW: Associates user with a school
  likes?: string;
  dislikes?: string;
  socials?: {
    website?: string;
    discord?: string;
    x?: string;
  };
  studyDecks?: StudyDeck[];
}

export interface School {
  id: string;
  name: string;
  domain: string;
  featureFlags: Record<string, boolean | string | number>;
  createdAt: string;
}

export interface ClassroomFile {
  id: string;
  name: string;
  url: string; // This will be a blob URL
  fileType: string;
  uploadedBy: string; // teacherId or studentId
}

export interface Classroom {
  id: string;
  name:string;
  subject: string;
  teacherId: string;
  studentIds: string[];
  assignments: Assignment[];
  color: string;
  pattern: number;
  publicId: string; // The user-facing, shareable ID
  entryPassword: string; // The password students use to join
  files?: ClassroomFile[];
  projects?: Project[];
  dailyLogs?: DailyLogEntry[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  questions: Question[];
  studentIds?: string[]; // For differentiated assignments
  files?: ClassroomFile[];
}

export interface Question {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'open-ended' | 'essay';
  options?: string[];
  answer?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: { questionId: string; answer: string }[];
  grade: number | null;
  feedback?: string;
}

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    parts?: { text: string }[];
    content?: string; // For OpenRouter/Ollama compatibility
}


export interface AIPersona {
  name: string;
  systemInstruction: string;
}

export interface KnowledgeNode {
  id: string;
  timestamp: string;
  userQuestion: string;
  aiAnswer: string;
  assignmentTitle: string;
  aiPersona: string;
}

export interface LiveChatMessage {
  id: string;
  classroomId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  text: string;
  timestamp: number;
}

export interface WorkboardNote {
  id: string;
  ownerId: string; // classroomId or groupId
  userId: string;
  text: string;
  color: string;
  position: { x: number, y: number };
  image?: string; // For base64 encoded images
}

export interface ThemeContent {
  store: string;
  games: string;
  trainer: string;
  tutor: string;
  studyDecks: string;
}

export type StoreItemType = 'AVATAR_FRAME' | 'PET' | 'THEME';

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: StoreItemType;
    image?: string;
}

// For Adaptive Pathways Feature
export interface AdaptivePathway {
    groupName: 'Accelerated' | 'Proficient' | 'Needs Reinforcement' | string;
    studentIds: string[];
    studentNames: string[];
    assignment: Omit<Assignment, 'id' | 'studentIds'>;
}

export interface AdaptivePathwayPlan {
    pathways: AdaptivePathway[];
}


// --- NEW: Group Project Hub ---

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  assignedTo: string | null; // studentId or null for unassigned
}

export interface ProjectChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
  image?: string; // For AI generated images
}

export interface ProjectGroup {
    id: string;
    name: string;
    studentIds: string[];
    tasks: Task[];
    files: ClassroomFile[];
    chatMessages: ProjectChatMessage[];
    workboardNotes: WorkboardNote[];
}

export interface Project {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  dueDate: string | null;
  groups: ProjectGroup[];
}

// --- NEW: Daily Classroom Log ---

export interface DailyLogResource {
    id: string;
    type: 'file' | 'link';
    name: string;
    url: string; 
}

export interface DailyLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  lessonTopic: string;
  lessonSummary: string;
  assignedAssignmentIds: string[];
  resources: DailyLogResource[];
  announcements: string;
  attendance: Record<string, 'present' | 'absent' | 'tardy'>; // key is studentId
  teacherNotes?: string; // Only visible to teacher and admin/manager
}