import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Image as ImageIcon } from 'lucide-react';
import { Scene } from '../api/client';

export default function AssetGallery({ scenes }: { scenes: Scene[] }) {
  const [, setLocation] = useLocation();

  if (!scenes || scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <ImageIcon size={48} className="opacity-20 mb-4" />
        <p>No images generated yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      {scenes.map(scene => (
        <motion.div 
          key={scene.id} 
          className="relative aspect-square md:aspect-[9/16] lg:aspect-[4/3] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            if (scene.image_url) {
               setLocation(`/preview/image/${encodeURIComponent(scene.image_url)}`);
            }
          }}
        >
          {scene.image_url ? (
            <>
              <img 
                src={scene.image_url} 
                alt={`Scene ${scene.scene_number}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white font-medium">Click to Preview</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-700">
              {scene.status === 'processing' ? 'Generating...' : 'No Image'}
            </div>
          )}
          <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur pl-2 pr-3 py-1 text-white text-xs font-mono rounded-lg border border-white/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            SCENE {scene.scene_number}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
