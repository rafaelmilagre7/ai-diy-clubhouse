
import React from 'react';
import { Keyboard } from 'lucide-react';

export const KeyboardShortcuts = () => {
  return (
    <div className="hidden md:flex justify-center items-center mt-6 text-xs text-muted-foreground">
      <Keyboard className="h-3 w-3 mr-1" />
      <span className="mr-4">Atalhos de teclado:</span>
      
      <div className="flex space-x-4">
        <div className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-semibold mr-1">←</kbd>
          <span>Módulo anterior</span>
        </div>
        
        <div className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-semibold mr-1">→</kbd>
          <span>Próximo módulo</span>
        </div>
        
        <div className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-semibold mr-1">Space</kbd>
          <span>Concluir módulo</span>
        </div>
      </div>
    </div>
  );
};
