import { useState, useCallback } from 'react';

export interface UseToolSelectionProps {
  initialTools?: string[];
  onSelectionChange?: (tools: string[]) => void;
}

export const useToolSelection = ({ 
  initialTools = [], 
  onSelectionChange 
}: UseToolSelectionProps = {}) => {
  // Estado simples sem dependências circulares
  const [selectedTools, setSelectedTools] = useState<string[]>(() => {
    console.log('[TOOL_SELECTION] 🚀 Inicializando com:', initialTools);
    return initialTools || [];
  });

  const toggleTool = useCallback((toolName: string) => {
    console.log('[TOOL_SELECTION] 🖱️ Toggle para:', toolName);
    
    setSelectedTools(prevSelected => {
      const isSelected = prevSelected.includes(toolName);
      let newSelection: string[];
      
      if (isSelected) {
        newSelection = prevSelected.filter(tool => tool !== toolName);
        console.log('[TOOL_SELECTION] ➖ Removendo:', toolName);
      } else {
        newSelection = [...prevSelected, toolName];
        console.log('[TOOL_SELECTION] ➕ Adicionando:', toolName);
      }
      
      console.log('[TOOL_SELECTION] 🔄 Mudança:', prevSelected, '→', newSelection);
      
      // Notificar mudança de forma síncrona
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  }, [onSelectionChange]);

  const isSelected = useCallback((toolName: string) => {
    return selectedTools.includes(toolName);
  }, [selectedTools]);

  const clearSelection = useCallback(() => {
    console.log('[TOOL_SELECTION] 🧹 Limpando seleção');
    const newSelection: string[] = [];
    setSelectedTools(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [onSelectionChange]);

  const hasRealTools = selectedTools.length > 0;
  const selectionCount = selectedTools.length;

  return {
    selectedTools,
    toggleTool,
    isSelected,
    clearSelection,
    hasRealTools,
    selectionCount
  };
};