
import React from "react";

interface MagicSceneProps {
  stage?: number;
  onCanvasCreated?: () => void;
  isAnimating?: boolean;
}

// Versão simplificada sem Three.js
export function MagicScene({ 
  stage = 1, 
  onCanvasCreated, 
  isAnimating = false 
}: MagicSceneProps) {
  React.useEffect(() => {
    if (onCanvasCreated) {
      onCanvasCreated();
    }
  }, [onCanvasCreated]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'transparent' }}
    >
      <div 
        className={`w-40 h-40 rounded-full bg-[#0ABAB5] bg-opacity-50 ${isAnimating ? 'animate-pulse' : ''}`}
        style={{
          boxShadow: `0 0 ${isAnimating ? '30px' : '15px'} #0ABAB5`,
          transition: 'all 0.3s ease-in-out'
        }}
      />
    </div>
  );
}
