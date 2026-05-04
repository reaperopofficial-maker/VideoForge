import { create } from 'zustand';
import { Project } from '../api/client';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  messages: Message[];
  progress: number;
  currentStep: string;
  isLoading: boolean;
  error: string | null;
  
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addMessage: (message: Message) => void;
  updateProgress: (step: string, progress: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

export const useStore = create<AppState>((set) => ({
  projects: [],
  currentProject: null,
  messages: [],
  progress: 0,
  currentStep: '',
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateProgress: (currentStep, progress) => set({ currentStep, progress }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  resetState: () => set({
    currentProject: null,
    messages: [],
    progress: 0,
    currentStep: '',
    isLoading: false,
    error: null,
  }),
}));
