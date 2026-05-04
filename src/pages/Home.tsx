import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Plus, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { api, Project } from '../api/client';
import { useStore } from '../store/useStore';
import Navbar from '../components/Navbar';

export default function Home() {
  const [, setLocation] = useLocation();
  const { projects, setProjects, isLoading, setLoading, setError, error } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    setLoading(true);
    try {
      const created = await api.createProject(newProjectName, newProjectDesc);
      setProjects([created, ...projects]);
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setLocation(`/project/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setLoading(true);
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 mt-4">
            <div className="w-full text-center md:text-left text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Your Projects
            </div>
            
            <div className="w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                <Plus size={20} />
                <span>New Project</span>
              </button>
            </div>
          </header>

          {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 flex items-center">
            {error}
          </div>
        )}

          {isLoading && projects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-48 animate-pulse w-full">
                <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-gray-900/50 border border-gray-800 rounded-3xl border-dashed">
            <FolderOpen size={48} className="text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-gray-400 mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-6 font-light">Create your first AI video project to get started.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map((project) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  key={project.id}
                  className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl shadow-black/20"
                >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 line-clamp-1">{project.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      project.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      project.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-600 font-mono">
                    {project.id ? project.id.substring(0, 8) : 'Unknown'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setLocation(`/project/${project.id}`)}
                      className="px-4 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-gray-100">Create New Project</h2>
            </div>
            <form onSubmit={handleCreateProject} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    placeholder="e.g. Cyberpunk Story"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[100px] resize-none"
                    placeholder="What is this story about?"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newProjectName.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
