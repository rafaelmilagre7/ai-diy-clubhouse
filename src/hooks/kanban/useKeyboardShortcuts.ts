import { useEffect } from 'react';

interface KeyboardShortcutsHandlers {
  onFocusSearch?: () => void;
  onNewCard?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onOpenCard?: () => void;
  onCloseModal?: () => void;
  onDeleteCard?: () => void;
  onEditCard?: () => void;
}

export const useKeyboardShortcuts = (handlers: KeyboardShortcutsHandlers, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input/textarea ou se modal estiver aberto
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;

      // Atalho para focar busca funciona mesmo durante digitação
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        handlers.onFocusSearch?.();
        return;
      }

      // Outros atalhos apenas quando não estiver digitando
      if (isTyping) return;

      switch (e.key) {
        case 'n':
          e.preventDefault();
          handlers.onNewCard?.();
          break;
        case 'j':
          e.preventDefault();
          handlers.onNavigateDown?.();
          break;
        case 'k':
          e.preventDefault();
          handlers.onNavigateUp?.();
          break;
        case 'Enter':
          handlers.onOpenCard?.();
          break;
        case 'Escape':
          handlers.onCloseModal?.();
          break;
        case 'd':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handlers.onDeleteCard?.();
          }
          break;
        case 'e':
          e.preventDefault();
          handlers.onEditCard?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
};
