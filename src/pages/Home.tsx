import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'wouter';
import { Plus, Trash2, FolderOpen, Loader2, Sparkles, UploadCloud, BrainCircuit, Image as ImageIcon, Download, Play, Star, Users, Video } from 'lucide-react';
import { api, Project } from '../api/client';
import { useStore } from '../store/useStore';
import Navbar from '../components/Navbar';

const stats = [
  { label: "Videos Created", value: "500+" },
  { label: "Active Users", value: "50+" },
  { label: "Average Rating", value: "4.9★" },
];

const steps = [
  { icon: <UploadCloud size={24} />, color: "text-brand-primary", title: "Upload Novel", desc: "Start with your story script or text." },
  { icon: <BrainCircuit size={24} />, color: "text-brand-accent", title: "AI Script Generation", desc: "We convert text into scenes." },
  { icon: <ImageIcon size={24} />, color: "text-brand-gold", title: "Image & Video", desc: "Generate world-class visuals." },
  { icon: <Download size={24} />, color: "text-green-500", title: "Download Final", desc: "Export your cinematic masterpiece." },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { projects, setProjects, isLoading, setLoading, setError, error } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-brand-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-brand-accent/10 blur-[120px] pointer-events-none" />
      
      <Navbar />

      <main className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Animated Mesh Gradient Background is handled via the orbs mostly, but we can add more */}
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full px-4 py-1.5 mb-8 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
            >
              <Sparkles className="text-brand-primary" size={16} />
              <span className="text-brand-primary-light text-sm font-semibold tracking-wide uppercase">AI-Powered Video Creation</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight"
            >
              Turn Your Story Into <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-purple-400 to-brand-accent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Cinematic Reality
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Upload any novel or script. CineWeave's AI generates characters, scenes, and full videos automatically. Minimum effort, maximum cinematic quality.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-primary to-purple-600 rounded-full text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Creating
              </button>
              <button
                className="w-full sm:w-auto px-8 py-4 glassmorphism rounded-full text-white font-bold text-lg hover:bg-white/5 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <Play fill="currentColor" size={20} />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center space-x-4 md:space-x-8 text-sm md:text-base font-medium text-gray-400"
            >
              {stats.map((stat, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center space-x-2">
                    {i === 2 && <Star size={16} className="text-brand-gold fill-brand-gold" />}
                    {i === 1 && <Users size={16} />}
                    {i === 0 && <Video size={16} />}
                    <span className="text-white">{stat.value}</span>
                    <span className="hidden sm:inline">{stat.label}</span>
                  </div>
                  {i < stats.length - 1 && <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />}
                </React.Fragment>
              ))}
            </motion.div>
          </div>

          <motion.div 
            style={{ y }}
            className="absolute bottom-[-20%] left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-4 opacity-30 select-none pointer-events-none"
          >
             <div className="w-full h-64 md:h-96 rounded-t-[3rem] border-t border-x border-white/10 bg-gradient-to-t from-transparent to-white/5 backdrop-blur-3xl" />
          </motion.div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 relative z-20 bg-brand-bg/50 backdrop-blur-sm border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How CineWeave Works</h2>
              <p className="text-gray-400">From story to video in 4 steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-[28px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {steps.map((step, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  key={idx} 
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl glassmorphism flex items-center justify-center mb-6 relative z-10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                    <span className={step.color}>{step.icon}</span>
                    <span className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-brand-surface border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="py-24 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Your Projects</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-medium transition-colors"
              >
                <Plus size={18} />
                <span>New Project</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8">
                {error}
              </div>
            )}

            {isLoading && projects.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glassmorphism rounded-2xl p-6 h-64 animate-pulse">
                    <div className="h-32 bg-white/5 rounded-xl mb-4" />
                    <div className="h-6 bg-white/5 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-white/5 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="glassmorphism rounded-3xl p-16 text-center border-dashed border-2 hover:border-brand-primary/50 transition-colors flex flex-col items-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <FolderOpen size={40} className="text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-8 max-w-md">Create your first cinematic video project and bring your story to life.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-light text-white rounded-full font-semibold transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  Create First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                {projects.map((project, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    key={project.id}
                    onClick={() => setLocation(`/project/${project.id}`)}
                    className="glassmorphism rounded-2xl overflow-hidden group hover:border-brand-primary/50 transition-all duration-300 flex flex-col"
                  >
                    <div className="h-40 bg-gradient-to-br from-brand-surface/80 to-brand-bg relative overflow-hidden">
                      <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/20 transition-colors" />
                      {/* Gradient placeholder thumbnail */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-card to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          project.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          project.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {project.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-primary-light transition-colors">{project.name}</h3>
                      <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-2">
                        {project.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-xs text-gray-500 font-mono">
                          {new Date(project.created_at || Date.now()).toLocaleDateString()}
                        </div>
                        <button
                          onClick={(e) => handleDelete(project.id, e)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary to-brand-accent" />
                <h2 className="text-2xl font-bold text-white">New Project</h2>
                <p className="text-gray-400 text-sm mt-1">Configure your cinematic project details.</p>
              </div>
              <form onSubmit={handleCreateProject} className="p-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Project Name</label>
                    <input
                      type="text"
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                      placeholder="e.g. Cyberpunk Odyssey"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Description <span className="text-gray-500 font-normal">(Optional)</span></label>
                    <textarea
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all min-h-[120px] resize-none"
                      placeholder="What is the story about? This helps the AI understand context."
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-white rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !newProjectName.trim()}
                    className="flex-1 px-4 py-3 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
