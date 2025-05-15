
import React from 'react';
import { Loader2 } from 'lucide-react';

export const MoticonAnimation: React.FC = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div className="absolute w-full h-full rounded-full bg-viverblue/20 animate-pulse-glow"></div>
      <div className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-viverblue to-viverblue-light opacity-80 animate-spin-slow"></div>
      <div className="z-10 bg-[#0F111A] rounded-full p-4">
        <div className="w-12 h-12 rounded-full bg-viverblue-light/10 flex items-center justify-center">
          <span className="text-viverblue text-2xl font-bold">IA</span>
        </div>
      </div>
    </div>
  );
};
