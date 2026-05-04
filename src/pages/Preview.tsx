import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { X, Download } from 'lucide-react';

export default function Preview() {
  const [match, params] = useRoute('/preview/:type/:id');
  const [, setLocation] = useLocation();

  if (!match || !params) return null;
  const { type, id } = params;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
      <header className="flex justify-between items-center p-6 text-gray-400">
        <div className="text-sm font-mono tracking-widest uppercase">
          Preview • {type}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors hover:text-white">
             <Download size={24} />
          </button>
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-red-500/20 rounded-full transition-colors hover:text-red-400"
          >
             <X size={24} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
            {type === 'image' ? (
                <img src={decodeURIComponent(id)} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl" />
            ) : (
                <video src={decodeURIComponent(id)} controls autoPlay className="max-w-full max-h-full shadow-2xl rounded-xl border border-gray-800" />
            )}
        </div>
      </main>
    </div>
  );
}
