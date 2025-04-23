
import { useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";

interface UseImplementationShortcutsProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstModule: boolean;
  isLastModule: boolean;
}

export const useImplementationShortcuts = ({
  onNext,
  onPrevious,
  isFirstModule,
  isLastModule
}: UseImplementationShortcutsProps) => {
  const { log } = useLogging("useImplementationShortcuts");
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se o usuário está digitando em um input, textarea ou outro campo editável, 
      // não acionar os atalhos
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
      
      switch (e.key) {
        case "ArrowRight":
          if (!isLastModule) {
            log("Keyboard shortcut: next module");
            e.preventDefault();
            onNext();
          }
          break;
        case "ArrowLeft":
          if (!isFirstModule) {
            log("Keyboard shortcut: previous module");
            e.preventDefault();
            onPrevious();
          }
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNext, onPrevious, isFirstModule, isLastModule, log]);
};
