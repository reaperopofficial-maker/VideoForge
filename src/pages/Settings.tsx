import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

export default function Settings() {
  const [, setLocation] = useLocation();
  const [anthropicKey, setAnthropicKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '');
  const [geminiGenKey, setGeminiGenKey] = useState(import.meta.env.VITE_GEMINIGEN_API_KEY || '');
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  
  const [imageModel, setImageModel] = useState('imagen-4-ultra');
  const [videoModel, setVideoModel] = useState('veo-3.1');

  const [testMode, setTestMode] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save logic since environment overrides are handled backend-side in real usage
    alert("In this preview, API Keys are managed via AI Studio Secrets Panel or backend .env file. Changes here are mock UI.");
  };

  const handleTest = () => {
    setTestMode('testing');
    setTimeout(() => {
      // Simulate real test
      setTestMode('success');
      setTimeout(() => setTestMode('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-10">
      <Navbar />
      <div className="p-4 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 mt-2 sm:mt-4">
          <header className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-12 border-b border-gray-800 pb-4 sm:pb-6">
            <button 
              onClick={() => setLocation('/')}
              className="p-2 w-fit bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white flex items-center justify-center min-w-[44px] min-h-[44px]"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Project Settings</h1>
              <p className="text-gray-500 text-sm mt-1">Configure your API keys and generation models</p>
            </div>
          </header>

          <form onSubmit={handleSave} className="space-y-6 sm:space-y-8 bg-gray-900 border border-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl">
          
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center space-x-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              <span>API Credentials</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Anthropic API Key</label>
                <div className="relative">
                  <input
                    type={showAnthropic ? "text" : "password"}
                    value={anthropicKey}
                    onChange={e => setAnthropicKey(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-base sm:text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors font-mono min-h-[44px]"
                    placeholder="sk-ant-..."
                  />
                  <button type="button" onClick={() => setShowAnthropic(!showAnthropic)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-300">
                    {showAnthropic ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">GeminiGen API Key</label>
                <div className="relative">
                  <input
                    type={showGemini ? "text" : "password"}
                    value={geminiGenKey}
                    onChange={e => setGeminiGenKey(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-base sm:text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors font-mono min-h-[44px]"
                    placeholder="Your base-64 GeminiGen Key"
                  />
                  <button type="button" onClick={() => setShowGemini(!showGemini)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-300">
                    {showGemini ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-800" />

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center space-x-2">
              <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
              <span>Model Preferences</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Image Generation Model</label>
                <select 
                  value={imageModel} 
                  onChange={e => setImageModel(e.target.value)}
                  className="w-full min-h-[44px] bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="imagen-4-ultra">imagen-4-ultra (Premium)</option>
                  <option value="nano-banana">nano-banana (Fast)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Video Generation Model</label>
                <select 
                  value={videoModel} 
                  onChange={e => setVideoModel(e.target.value)}
                  className="w-full min-h-[44px] bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="veo-3.1">veo-3.1 (Cinematic)</option>
                  <option value="veo-3-fast">veo-3-fast (Speed)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center sm:items-center bg-gray-950 -mx-4 sm:-mx-8 -mb-4 sm:-mb-8 p-4 sm:p-8 rounded-b-2xl border-t border-gray-800 mt-6 sm:mt-8 gap-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testMode === 'testing'}
              className="w-full sm:w-auto flex justify-center px-5 py-2.5 min-h-[44px] bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-medium border border-gray-700 hover:border-gray-600 flex items-center space-x-2"
            >
              {testMode === 'testing' && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />}
              {testMode === 'success' && <CheckCircle2 size={18} className="text-green-500" />}
              {testMode === 'error' && <XCircle size={18} className="text-red-500" />}
              {testMode === 'idle' && <span>Test Connection</span>}
              <span>{testMode === 'testing' ? 'Testing...' : testMode === 'success' ? 'Connected' : testMode === 'error' ? 'Failed' : ''}</span>
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex justify-center items-center space-x-2 px-6 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-600/20"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
