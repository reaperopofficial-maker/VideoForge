import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  progress: number;
  currentStep: string;
}

const STEPS = ['script', 'characters', 'images', 'videos', 'final'];
const LABELS = ['Script', 'Characters', 'Images', 'Videos', 'Final'];

export default function ProgressBar({ progress, currentStep }: Props) {
  const currentIndex = STEPS.indexOf(currentStep);
  // Default to 0 if not found, unless progress is 100 which implies done
  const activeIndex = currentStep === 'completed' || progress === 100 ? STEPS.length : Math.max(0, currentIndex);

  return (
    <div className="w-full flex-col space-y-4">
      {/* Stepper */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-border rounded-full" />
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex || (progress === 100);
          const isCurrent = idx === activeIndex && progress < 100;
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isCompleted ? '#10B981' : isCurrent ? '#7C3AED' : '#1E1E2E',
                  borderColor: isCurrent ? '#A855F7' : isCompleted ? '#10B981' : '#475569',
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isCurrent ? 'shadow-[0_0_15px_rgba(124,58,237,0.6)]' : ''}`}
              >
                {isCompleted ? (
                  <Check size={12} className="text-white" strokeWidth={3} />
                ) : isCurrent ? (
                  <motion.div 
                    animate={{ scale: [1, 0.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-white" 
                  />
                ) : null}
              </motion.div>
              <span className={`absolute top-8 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isCurrent ? 'text-brand-primary-light' : isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
                {LABELS[idx]}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar & Text */}
      <div className="pt-6 flex items-center justify-between text-sm">
        <span className="text-brand-primary-light font-bold uppercase tracking-wider text-xs">
          {currentStep === 'idle' ? 'Ready to Start' : currentStep === 'completed' ? 'All Steps Completed' : `Generating ${currentStep}...`}
        </span>
        <span className="text-white font-mono">{progress}%</span>
      </div>
      
      <div className="w-full h-1.5 bg-brand-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        />
      </div>
    </div>
  );
}
