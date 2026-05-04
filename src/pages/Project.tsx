import React, { useEffect, useState, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import ChatBox from '../components/ChatBox';
import ProgressBar from '../components/ProgressBar';
import { FileText, Image as ImageIcon, Video, Users, ArrowLeft, Download, Upload, PlayCircle, Loader2, Play } from 'lucide-react';

export default function ProjectPage() {
  const [match, params] = useRoute('/project/:id');
  const [, setLocation] = useLocation();
  const { currentProject, setCurrentProject, isLoading, setLoading, setError, currentStep, progress, updateProgress } = useStore();
  const [activeTab, setActiveTab] = useState<'characters' | 'storyboard' | 'videos' | 'final'>('storyboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = (params as any)?.id;

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
      setupEventSource(projectId);
    }
  }, [projectId]);

  const setupEventSource = (id: string) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || '/api';
      const eventSource = new EventSource(`${baseURL}/generate/progress/${id}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateProgress(data.step, data.progress);
        
        // Refresh project data to get new assets if something completed
        if (data.progress === 100) {
          loadProject(id, false);
        }
      };

      return () => eventSource.close();
    } catch (e) {
      console.error("SSE Setup failed", e);
    }
  };

  const loadProject = async (id: string, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await api.getProjectDetails(id);
      setCurrentProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
      setLocation('/');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    setLoading(true);
    try {
      await api.uploadNovel(projectId, file);
      await loadProject(projectId);
    } catch (err: any) {
      setError(err.message || 'Failed to upload novel text');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAction = async (actionFn: (id: string) => Promise<any>, stepName: string) => {
    if (!projectId) return;
    try {
      await actionFn(projectId);
    } catch (err: any) {
      setError(err.message || `Failed to perform action: ${stepName}`);
    }
  };

  if (isLoading && !currentProject) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-primary flex-col space-y-4">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-medium">Loading project...</p>
      </div>
    );
  }

  if (!currentProject) return null;

  return (
    <div className="min-h-screen bg-brand-bg text-gray-100 flex flex-col md:flex-row overflow-hidden h-[100dvh]">
      
      {/* LEFT PANEL (55%) */}
      <div className="w-full md:w-[55%] flex-1 md:flex-none md:h-full flex flex-col border-r border-white/5 bg-brand-surface overflow-hidden order-2 md:order-1 relative z-10">
        
        {/* Top Header */}
        <header className="flex-shrink-0 p-4 border-b border-white/5 bg-brand-surface/80 backdrop-blur flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLocation('/')}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold truncate max-w-sm hover:text-brand-primary transition-colors cursor-pointer">{currentProject.name}</h1>
          </div>
          <div className="flex flex-col items-end">
             <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              currentProject.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              currentProject.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {currentProject.status}
            </span>
          </div>
        </header>

        {/* Tabs (Pill Style) */}
        <div className="flex p-4 border-b border-white/5 bg-brand-bg flex-shrink-0 overflow-x-auto scrollbar-hide space-x-2">
          {[
            { id: 'characters', label: 'Characters', icon: <Users size={16} /> },
            { id: 'storyboard', label: 'Storyboard', icon: <ImageIcon size={16} /> },
            { id: 'videos', label: 'Videos', icon: <Video size={16} /> },
            { id: 'final', label: 'Final', icon: <PlayCircle size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${
                activeTab === tab.id ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'characters' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProject.characters && currentProject.characters.length > 0 ? (
                    currentProject.characters.map(char => (
                      <div key={char.id} className="glassmorphism rounded-2xl overflow-hidden group">
                        <div className="aspect-square bg-brand-card relative overflow-hidden">
                          {char.image_url ? (
                            <img src={char.image_url} alt={char.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-600 font-medium">No Image</div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/90 to-transparent" />
                          <div className="absolute top-2 right-2 px-2 py-1 glassmorphism rounded-md text-[10px] uppercase font-bold text-gray-300">
                             Reference
                          </div>
                        </div>
                        <div className="p-4 relative -mt-10 z-10">
                          <h3 className="font-bold text-white text-lg drop-shadow-md">{char.name}</h3>
                          <p className="text-xs text-gray-400 mt-2 line-clamp-3 font-medium bg-black/40 p-2 rounded-lg backdrop-blur-md">{char.appearance}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 rounded-full glassmorphism flex items-center justify-center mb-4 opacity-50">
                        <Users size={32} />
                      </div>
                      <p>No characters generated yet.</p>
                      <button onClick={() => handleAction(api.generateCharacters, 'Characters')} className="mt-4 text-brand-primary hover:underline text-sm font-medium">Generate Characters</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'storyboard' && (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {currentProject.scenes && currentProject.scenes.length > 0 ? (
                    currentProject.scenes.map(scene => (
                      <div key={scene.id} className="glassmorphism rounded-2xl overflow-hidden group relative flex flex-col">
                        <div className="aspect-video bg-brand-card relative overflow-hidden shrink-0">
                          {scene.image_url ? (
                            <img src={scene.image_url} alt={`Scene ${scene.scene_number}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="absolute inset-2 flex items-center justify-center text-gray-600 font-medium text-xs text-center border-dashed border border-white/10 rounded-xl">
                              {scene.status === 'processing' ? <Loader2 className="animate-spin" /> : 'No Image'}
                            </div>
                          )}
                          <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                            S{scene.scene_number}
                          </div>
                           <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-md text-gray-300 text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                            {scene.duration}s
                          </div>
                        </div>
                        <div className="p-3">
                           <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed group-hover:line-clamp-none transition-all duration-300">{scene.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 rounded-full glassmorphism flex items-center justify-center mb-4 opacity-50">
                        <FileText size={32} />
                      </div>
                      <p>No scenes generated yet.</p>
                      <button onClick={() => handleAction(api.generateScript, 'Script')} className="mt-4 text-brand-primary hover:underline text-sm font-medium">Generate Script</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="flex flex-col space-y-4">
                    {currentProject.scenes && currentProject.scenes.length > 0 ? (
                      currentProject.scenes.map(scene => (
                        <div key={scene.id} className="glassmorphism rounded-2xl flex flex-col sm:flex-row overflow-hidden border border-white/5">
                          <div className="sm:w-48 aspect-video bg-black relative shrink-0">
                            {scene.video_url ? (
                               <video 
                                src={scene.video_url} 
                                poster={scene.image_url}
                                controls 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                               scene.image_url ? 
                                <img src={scene.image_url} className="absolute inset-0 w-full h-full object-cover opacity-50" /> :
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-card"></div>
                            )}
                             <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                               S{scene.scene_number}
                             </div>
                             {scene.status === 'processing' && !scene.video_url && (
                                <div className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                   <Loader2 className="animate-spin mb-2" size={24} />
                                   <span className="text-[10px] font-bold uppercase tracking-wider">Generating</span>
                                </div>
                             )}
                          </div>
                          
                          <div className="p-4 flex-1 flex flex-col justify-center">
                             <h4 className="text-sm font-bold text-white mb-1">Scene {scene.scene_number}</h4>
                             <p className="text-xs text-gray-400 line-clamp-2 md:line-clamp-1 mb-3">{scene.description}</p>
                             
                             <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-500 uppercase">
                                   <span className="bg-white/5 px-2 py-1 rounded glassmorphism">{scene.duration}s</span>
                                   <span className="bg-brand-primary/10 text-brand-primary-light px-2 py-1 rounded glassmorphism">Veo 3.1</span>
                                </div>
                                
                                {scene.video_url && (
                                   <a href={scene.video_url} download className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white">
                                      <Download size={14} />
                                   </a>
                                )}
                             </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 rounded-full glassmorphism flex items-center justify-center mb-4 opacity-50">
                          <Video size={32} />
                        </div>
                        <p>No videos generated yet.</p>
                      </div>
                    )}
                </div>
              )}

              {activeTab === 'final' && (
                 <div className="flex flex-col items-center">
                    <div className="w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
                       {currentProject.status === 'completed' ? (
                           <div className="w-full h-full flex flex-col items-center justify-center text-brand-primary">
                             {/* Temporary placeholder until custom player component is mounted */}
                             <PlayCircle size={64} className="mb-4 opacity-80" />
                             <p className="font-bold text-white">Final Render Ready</p>
                           </div>
                       ) : (
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-brand-surface/50 backdrop-blur-sm">
                             <Video size={48} className="mb-4 opacity-30" />
                             <p className="font-semibold text-lg text-gray-300">Final video not yet rendered</p>
                             <p className="text-sm">Complete all steps to merge the final video.</p>
                           </div>
                       )}
                    </div>
                    
                    {currentProject.status === 'completed' && (
                       <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                          <a 
                            href={`/projects/${currentProject.id}/final_video.mp4`} 
                            download
                            className="bg-gradient-to-r from-brand-gold to-yellow-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center space-x-2"
                          >
                            <Download size={20} />
                            <span>Download Master Video</span>
                          </a>
                          
                          <div className="flex gap-4 p-4 glassmorphism rounded-full">
                             <div className="flex flex-col items-center px-4">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Scenes</span>
                                <span className="text-white font-medium">{currentProject.scenes?.length || 0}</span>
                             </div>
                             <div className="w-px bg-white/10"></div>
                             <div className="flex flex-col items-center px-4">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Role</span>
                                <span className="text-white font-medium">Director</span>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT PANEL (45%) */}
      <div className="w-full md:w-[45%] flex-1 md:flex-none md:h-full flex flex-col bg-brand-bg md:bg-black/20 overflow-hidden order-1 md:order-2 shadow-2xl relative z-20">
        
        {/* Quick Actions & Progress Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 bg-brand-surface/30 backdrop-blur-md shrink-0 space-y-6">
          <ProgressBar progress={progress} currentStep={currentStep} />
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <input 
              type="file" 
              accept=".txt,.md" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            {currentProject.novel_text ? (
               <div className="col-span-2 glassmorphism border-brand-primary/30 p-4 rounded-xl flex items-center justify-between mb-2">
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                     <FileText size={20} />
                   </div>
                   <div>
                     <p className="font-bold text-sm text-white">Story Uploaded</p>
                     <p className="text-xs text-gray-400">{currentProject.novel_text.length} characters</p>
                   </div>
                 </div>
                 <button onClick={() => fileInputRef.current?.click()} className="text-[10px] uppercase font-bold text-brand-primary hover:text-brand-primary-light transition-colors">Replace</button>
               </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="col-span-2 border-2 border-dashed border-white/10 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 group mb-2"
              >
                <Upload size={32} className="mb-2 group-hover:text-brand-primary transition-colors" />
                <span className="font-bold text-sm text-white group-hover:text-brand-primary-light">Drop your novel here</span>
                <span className="text-xs mt-1">Supports .txt files</span>
              </button>
            )}

            <button 
              onClick={() => handleAction(api.generateScript, 'Script')}
              className="glassmorphism hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl p-3 flex items-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <FileText size={16} className="text-brand-primary" />
              <span className="text-sm font-semibold">Generate Script</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateCharacters, 'Characters')}
              className="glassmorphism hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl p-3 flex items-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <Users size={16} className="text-brand-accent" />
              <span className="text-sm font-semibold">Generate Cast</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateImages, 'Images')}
              className="glassmorphism hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl p-3 flex items-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <ImageIcon size={16} className="text-brand-gold" />
              <span className="text-sm font-semibold">Generate Images</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateVideos, 'Videos')}
              className="glassmorphism hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl p-3 flex items-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <Video size={16} className="text-blue-400" />
              <span className="text-sm font-semibold">Make Videos</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateFinal, 'Final Video')}
               className="col-span-2 mt-2 bg-gradient-to-r from-brand-primary to-brand-primary-light hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] text-white rounded-xl p-3 flex justify-center items-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] font-bold"
            >
              <PlayCircle size={18} fill="currentColor" stroke="none" />
              <span>Make Final Details & Merge</span>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatBox projectId={projectId!} />
        </div>
        
      </div>
    </div>
  );
}
