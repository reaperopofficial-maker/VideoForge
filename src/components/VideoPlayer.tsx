import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Maximize, Download } from 'lucide-react';
import { useLocation } from 'wouter';

interface Props {
  src: string;
  poster?: string;
  duration?: number;
  title?: string;
}

export default function VideoPlayer({ src, poster, duration, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       if (!containerRef.current?.contains(document.activeElement)) return;

       switch (e.key.toLowerCase()) {
         case ' ':
         case 'k':
           e.preventDefault();
           togglePlay();
           break;
         case 'f':
           e.preventDefault();
           if (videoRef.current) {
             setLocation(`/preview/video/${encodeURIComponent(src)}`);
           }
           break;
       }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setProgress((current / dur) * 100);
  };

  return (
    <div 
      ref={containerRef}
      className="relative group bg-black rounded-xl overflow-hidden border border-gray-800 w-full flex items-center justify-center focus-within:ring-2 focus-within:ring-blue-500 outline-none"
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto max-h-[80vh] object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />
      
      {/* Mobile Play Button overlay (visible when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:hidden">
            <div className="w-16 h-16 bg-blue-600/90 rounded-full flex items-center justify-center text-white shadow-xl">
               <Play size={32} className="ml-2" />
            </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity flex flex-col justify-end p-2 sm:p-4 ${isPlaying ? 'opacity-0 md:group-hover:opacity-100' : 'opacity-100'}`}>
        
        <div className="flex items-center justify-between text-white/90 mb-2 px-1">
           <span className="text-xs sm:text-sm font-medium line-clamp-1">{title || 'Video'}</span>
           <span className="text-xs font-mono shrink-0 ml-2">{duration ? `${duration}s` : ''}</span>
        </div>

        {/* Progress bar */}
        <div 
          className="h-2 sm:h-1 bg-gray-600/50 w-full mb-3 sm:mb-4 cursor-pointer relative rounded-full"
          onClick={(e) => {
            if (!videoRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = clickPos * videoRef.current.duration;
          }}
        >
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition-colors text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 focus:outline-none"
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
          </button>
          
          <div className="flex items-center gap-1 sm:gap-3">
            <a 
              href={src} 
              download
              className="p-3 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={20} />
            </a>
            <button 
              onClick={() => {
                videoRef.current?.pause();
                setIsPlaying(false);
                setLocation(`/preview/video/${encodeURIComponent(src)}`);
              }}
              className="p-3 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center focus:outline-none"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
