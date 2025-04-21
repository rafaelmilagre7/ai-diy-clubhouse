
import React, { useState, useEffect } from "react";

interface TrailTypingTextProps {
  text: string;
  onComplete?: () => void;
}

export const TrailTypingText = ({ text, onComplete }: TrailTypingTextProps) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!text || index >= text.length) {
      if (index >= text.length) {
        onComplete && onComplete();
      }
      return;
    }
    const timeout = setTimeout(() => {
      setDisplayText(text.substring(0, index + 1));
      setIndex(index + 1);
    }, 30);
    return () => clearTimeout(timeout);
  }, [index, text, onComplete]);

  return (
    <p className="text-gray-700 text-center text-base min-h-[4rem] max-w-3xl mx-auto px-4 select-text whitespace-pre-wrap">
      {displayText}
    </p>
  );
};
