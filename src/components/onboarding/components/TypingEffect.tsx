
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  startDelay?: number;
}

export const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  speed = 30,
  onComplete,
  startDelay = 0
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Start typing effect
  const startTyping = useCallback(() => {
    if (!text || !isMountedRef.current || isTyping) {
      console.log('[TypingEffect] Não pode iniciar:', { text: !!text, mounted: isMountedRef.current, isTyping });
      return;
    }

    console.log('[TypingEffect] Iniciando digitação para:', text.substring(0, 30) + '...');
    setIsTyping(true);
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        cleanup();
        return;
      }

      if (currentIndex < text.length) {
        const nextChar = text[currentIndex];
        setDisplayedText(prev => prev + nextChar);
        currentIndex++;
      } else {
        cleanup();
        setIsComplete(true);
        setIsTyping(false);
        console.log('[TypingEffect] Digitação completa');
        onComplete?.();
      }
    }, speed);
  }, [text, speed, onComplete, isTyping, cleanup]);

  // Reset and start typing when text changes
  useEffect(() => {
    if (!text) return;

    console.log('[TypingEffect] Texto mudou, resetando:', text.substring(0, 30) + '...');
    
    // Reset states
    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(false);
    
    // Clear any existing timers
    cleanup();

    // Start typing after delay
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        startTyping();
      }
    }, startDelay);

    return cleanup;
  }, [text, startDelay, startTyping, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[TypingEffect] Componente desmontando');
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="whitespace-pre-wrap">
      {displayedText}
      {!isComplete && isTyping && (
        <span className="animate-pulse text-viverblue">|</span>
      )}
    </div>
  );
};
