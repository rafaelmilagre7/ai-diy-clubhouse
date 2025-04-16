
import { useState, useEffect } from "react";
import { Module } from "@/lib/supabase";

export const useModuleInteraction = (module: Module, onComplete: () => void) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Track meaningful user interaction with content
  const handleInteraction = () => {
    setHasInteracted(true);
  };

  // Effect to auto-mark certain module types as interacted
  useEffect(() => {
    // If module has simple content or is landing/celebration type,
    // automatically mark as interacted
    if (module.type === "landing" || module.type === "celebration") {
      setHasInteracted(true);
      onComplete();
    }
  }, [module.type, onComplete]);

  return {
    hasInteracted,
    handleInteraction
  };
};
