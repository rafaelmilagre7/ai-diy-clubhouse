
import React, { useState, useEffect, useCallback } from 'react';

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
  const [hasStarted, setHasStarted] = useState(false);

  const startTyping = useCallback(() => {
    if (!text || hasStarted || isComplete) {
      return;
    }

    console.log('[TypingEffect] Iniciando digitação:', text.substring(0, 50) + '...');
    setHasStarted(true);
    setDisplayedText('');
    
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        // Garantir que o primeiro caractere não seja cortado
        const nextChar = text[currentIndex];
        setDisplayedText(prev => prev + nextChar);
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsComplete(true);
        console.log('[TypingEffect] Digitação completa');
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [text, speed, onComplete, hasStarted, isComplete]);

  useEffect(() => {
    if (!text || isComplete) {
      return;
    }

    const timer = setTimeout(() => {
      startTyping();
    }, startDelay);

    return () => clearTimeout(timer);
  }, [text, startDelay, startTyping, isComplete]);

  // Reset quando o texto muda (nova mensagem)
  useEffect(() => {
    if (text && !isComplete) {
      setDisplayedText('');
      setIsComplete(false);
      setHasStarted(false);
    }
  }, [text]);

  return (
    <div className="whitespace-pre-wrap">
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse text-viverblue">|</span>
      )}
    </div>
  );
};
