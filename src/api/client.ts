import axios from 'axios';

// Force base URL to local proxy path
const baseURL = '/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  novel_text?: string;
  scenes?: Scene[];
  characters?: Character[];
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  description: string;
  image_prompt: string;
  video_prompt: string;
  image_url?: string;
  video_url?: string;
  local_video_path?: string;
  status: string;
  duration: number;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  appearance: string;
  image_prompt: string;
  image_url?: string;
  reference_prompt?: string;
}

export const api = {
  getProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get('/projects');
    return Array.isArray(res.data) ? res.data : [];
  },
  createProject: async (name: string, description: string): Promise<Project> => {
    const res = await apiClient.post('/projects', { name, description });
    return res.data;
  },
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
  uploadNovel: async (projectId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/projects/${projectId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  generateScript: async (projectId: string): Promise<any> => {
    const res = await apiClient.post(`/generate/script/${projectId}`);
    return res.data;
  },
  generateCharacters: async (projectId: string): Promise<any> => {
    const res = await apiClient.post(`/generate/characters/${projectId}`);
    return res.data;
  },
  generateImages: async (projectId: string): Promise<any> => {
    const res = await apiClient.post(`/generate/images/${projectId}`);
    return res.data;
  },
  generateVideos: async (projectId: string): Promise<any> => {
    const res = await apiClient.post(`/generate/videos/${projectId}`);
    return res.data;
  },
  generateFinal: async (projectId: string): Promise<any> => {
    const res = await apiClient.post(`/generate/final/${projectId}`);
    return res.data;
  },
  chatWithAgent: async (projectId: string, message: string, history: any[]): Promise<any> => {
    const res = await apiClient.post(`/agent/chat`, { project_id: projectId, message, history });
    return res.data;
  },
  getProjectStatus: async (projectId: string): Promise<any> => {
    const res = await apiClient.get(`/agent/status/${projectId}`);
    return res.data;
  },
  getProjectDetails: async (projectId: string): Promise<Project> => {
    const res = await apiClient.get(`/projects/${projectId}`);
    return res.data;
  }
};
