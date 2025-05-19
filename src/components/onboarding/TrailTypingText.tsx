
import React, { useState, useEffect, useRef } from 'react';

interface TrailTypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export const TrailTypingText: React.FC<TrailTypingTextProps> = ({
  text,
  speed = 20,
  delay = 200,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const textIndex = useRef(0);

  useEffect(() => {
    // Reseta o estado quando o texto muda
    setDisplayedText('');
    setIsComplete(false);
    textIndex.current = 0;
    
    // Limpar intervalos anteriores
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Adicionar atraso inicial
    const timeoutId = setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        if (textIndex.current < text.length) {
          setDisplayedText(prev => prev + text.charAt(textIndex.current));
          textIndex.current += 1;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            setIsComplete(true);
            if (onComplete) {
              onComplete();
            }
          }
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, delay, onComplete]);

  return (
    <div className="relative">
      <p className="text-neutral-300">{displayedText}</p>
      {!isComplete && (
        <span className="inline-block ml-1 w-2 h-4 bg-[#0ABAB5] animate-pulse" />
      )}
    </div>
  );
};
