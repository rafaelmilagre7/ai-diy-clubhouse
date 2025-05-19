
import React, { useState, useEffect, useRef } from 'react';

interface TrailTypingTextProps {
  text: string;
  onComplete?: () => void;
  typingSpeed?: number;
}

export const TrailTypingText: React.FC<TrailTypingTextProps> = ({ 
  text, 
  onComplete,
  typingSpeed = 30
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const textToType = text || '';
    
    const typingInterval = setInterval(() => {
      if (currentIndex < textToType.length) {
        setDisplayedText(prev => prev + textToType.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, [text, onComplete, typingSpeed]);
  
  return (
    <div className="relative">
      <div 
        ref={textRef}
        className="text-lg font-medium text-center text-neutral-200 italic leading-relaxed p-6 bg-gradient-to-r from-[#0ABAB5]/10 via-[#0ABAB5]/5 to-transparent rounded-md border border-[#0ABAB5]/20"
      >
        <span className="text-[#0ABAB5]">"</span>
        {displayedText}
        <span className={`inline-block ${isComplete ? 'opacity-100' : 'animate-pulse'}`}>
          <span className="text-[#0ABAB5]">"</span>
        </span>
        {!isComplete && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#0ABAB5] animate-pulse" />
        )}
      </div>
    </div>
  );
};
