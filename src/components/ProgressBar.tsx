import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  progress: number;
  currentStep: string;
}

export default function ProgressBar({ progress, currentStep }: Props) {
  const isComplete = progress === 100 && currentStep === 'final';
  
  return (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
      <motion.div
        className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
      />
    </div>
  );
}
