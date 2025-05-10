
import React from "react";

interface MagicSphereProps {
  stage?: number;
  isAnimating?: boolean;
}

// Versão simplificada sem Three.js
export function MagicSphere({ stage = 1, isAnimating = false }: MagicSphereProps) {
  return (
    <div 
      className={`w-32 h-32 rounded-full bg-[#0ABAB5] ${isAnimating ? 'animate-pulse' : ''}`}
      style={{
        opacity: 0.8,
        boxShadow: `0 0 25px #0ABAB5, 0 0 50px #0ABAB5`,
        animation: isAnimating ? 'pulse 2s infinite' : 'none'
      }}
    />
  );
}
