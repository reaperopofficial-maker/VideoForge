import React, { useEffect, useState, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import ChatBox from '../components/ChatBox';
import ProgressBar from '../components/ProgressBar';
import { FileText, Image as ImageIcon, Video, Users, ArrowLeft, Download, Upload, PlayCircle } from 'lucide-react';

export default function ProjectPage() {
  const [match, params] = useRoute('/project/:id');
  const [, setLocation] = useLocation();
  const { currentProject, setCurrentProject, isLoading, setLoading, setError, currentStep, progress, updateProgress } = useStore();
  const [activeTab, setActiveTab] = useState<'characters' | 'storyboard' | 'videos'>('storyboard');
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
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading...</div>;
  }

  if (!currentProject) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row overflow-hidden h-[100dvh]">
      
      {/* CONTENT AREA (Asset Gallery): Bottom on mobile, Left 50% on tablet, Left 60% on desktop */}
      <div className="w-full md:w-1/2 lg:w-[60%] flex-1 md:flex-none md:h-full flex flex-col border-t md:border-t-0 md:border-r border-gray-800 bg-gray-950 overflow-hidden order-2 md:order-1">
        {/* Header */}
        <header className="flex-shrink-0 p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLocation('/')}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold truncate max-w-md">{currentProject.name}</h1>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
            currentProject.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {currentProject.status.toUpperCase()}
          </span>
        </header>

        {/* Tabs */}
        <div className="flex px-2 md:px-4 border-b border-gray-800 bg-gray-900/20 flex-shrink-0 overflow-x-auto scrollbar-hide">
          {[
            { id: 'storyboard', label: 'Storyboard', icon: <ImageIcon size={16} /> },
            { id: 'characters', label: 'Characters', icon: <Users size={16} /> },
            { id: 'videos', label: 'Videos', icon: <Video size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 md:px-6 py-3 md:py-4 font-medium text-sm transition-colors relative min-h-[48px] ${
                activeTab === tab.id ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'characters' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentProject.characters && currentProject.characters.length > 0 ? (
                    currentProject.characters.map(char => (
                      <div key={char.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
                        <div className="aspect-[3/4] bg-gray-950 relative overflow-hidden">
                          {char.image_url ? (
                            <img src={char.image_url} alt={char.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-700">No Image</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-100">{char.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{char.appearance}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center text-gray-500">No characters generated yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'storyboard' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {currentProject.scenes && currentProject.scenes.length > 0 ? (
                    currentProject.scenes.map(scene => (
                      <div key={scene.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group relative">
                        <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur text-white text-xs font-mono px-2 py-1 rounded">
                          S{scene.scene_number}
                        </div>
                        <div className="aspect-[9/16] bg-gray-950 relative overflow-hidden">
                          {scene.image_url ? (
                            <img src={scene.image_url} alt={`Scene ${scene.scene_number}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-700 font-light text-sm p-4 text-center border-dashed border border-gray-800 rounded-xl m-2">
                              {scene.status === 'processing' ? 'Generating...' : 'No Image'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center text-gray-500">No scenes generated yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="space-y-8">
                  {/* Final Video Header if exists */}
                  <div className="border border-blue-900/50 bg-blue-950/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <PlayCircle size={100} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                      <Video className="text-blue-500" /> Final Master Video
                    </h2>
                    {currentProject.status === 'completed' ? (
                       <a 
                        href={`/projects/${currentProject.id}/final_video.mp4`} 
                        download
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
                      >
                         <Download size={18} />
                         <span>Download App Final Render</span>
                       </a>
                    ) : (
                      <p className="text-gray-500">Final video has not been rendered yet.</p>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-gray-400 mt-6 sm:mt-8 mb-4 border-b border-gray-800 pb-2">Individual Scene Clips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {currentProject.scenes && currentProject.scenes.length > 0 ? (
                      currentProject.scenes.map(scene => (
                        <div key={scene.id} className="flex flex-col gap-2">
                          <div className="relative pt-[177.77%] bg-black rounded-xl overflow-hidden border border-gray-800">
                            {scene.video_url ? (
                              <video 
                                src={scene.video_url} 
                                poster={scene.image_url}
                                controls 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-700 bg-gray-900">
                                No Video
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 flex justify-between px-1">
                            <span>Scene {scene.scene_number}</span>
                            <span>{scene.duration}s</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center text-gray-500">No videos generated yet.</div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CHAT AREA: Top on mobile, Right 50% on tablet, Right 40% on desktop */}
      <div className="w-full md:w-1/2 lg:w-[40%] flex-1 md:flex-none md:h-full flex flex-col bg-gray-900 overflow-hidden order-1 md:order-2 z-10 shadow-xl md:shadow-none">
        
        {/* Status & Actions */}
        <div className="p-4 sm:p-6 border-b border-gray-800 shrink-0 space-y-4 sm:space-y-6">
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400 uppercase tracking-wider text-xs font-bold">Progress</span>
              <span className="text-blue-400">{progress}%</span>
            </div>
            <ProgressBar progress={progress} currentStep={currentStep} />
            <p className="text-xs text-gray-500 mt-1 capitalize font-medium">{currentStep || 'Idle'}</p>
          </div>

          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
             <input 
              type="file" 
              accept=".txt,.md" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center lg:justify-start space-x-1.5 px-3 py-2 min-h-[44px] bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Upload size={16} /> <span>Novel Text</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateScript, 'Script')}
              className="flex items-center justify-center lg:justify-start space-x-1.5 px-3 py-2 min-h-[44px] bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText size={16} /> <span>1. Script</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateCharacters, 'Characters')}
              className="flex items-center justify-center lg:justify-start space-x-1.5 px-3 py-2 min-h-[44px] bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Users size={16} /> <span>2. Cast</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateImages, 'Images')}
              className="flex items-center justify-center lg:justify-start space-x-1.5 px-3 py-2 min-h-[44px] bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              <ImageIcon size={16} /> <span>3. Images</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateVideos, 'Videos')}
              className="flex items-center justify-center lg:justify-start space-x-1.5 px-3 py-2 min-h-[44px] bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Video size={16} /> <span>4. Videos</span>
            </button>
            <button 
              onClick={() => handleAction(api.generateFinal, 'Final Video')}
              className="col-span-2 lg:col-span-1 flex items-center justify-center space-x-1.5 px-3 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 rounded-lg text-sm font-medium transition-colors w-full mt-2 shadow-lg shadow-blue-500/20"
            >
              <PlayCircle size={16} /> <span>Merge Final Render</span>
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
