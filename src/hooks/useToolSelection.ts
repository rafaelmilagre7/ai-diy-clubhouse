import { useState, useCallback, useEffect, useMemo } from 'react';

export interface UseToolSelectionProps {
  initialTools?: string[];
  onSelectionChange?: (tools: string[]) => void;
}

export const useToolSelection = ({ 
  initialTools = [], 
  onSelectionChange 
}: UseToolSelectionProps = {}) => {
  // Inicializar estado apenas com initialTools
  const initialState = useMemo(() => {
    console.log('[TOOL_SELECTION] 🚀 Inicializando com:', initialTools);
    return initialTools?.length > 0 ? initialTools : [];
  }, []);

  const [selectedTools, setSelectedTools] = useState<string[]>(initialState);

  const toggleTool = useCallback((toolName: string) => {
    console.log('[TOOL_SELECTION] 🖱️ Toggle para:', toolName);
    
    setSelectedTools(prevSelected => {
      let newSelection: string[];
      
      if (prevSelected.includes(toolName)) {
        // Remover ferramenta existente
        newSelection = prevSelected.filter(tool => tool !== toolName);
        console.log('[TOOL_SELECTION] ➖ Removendo:', toolName);
      } else {
        // Adicionar nova ferramenta
        newSelection = [...prevSelected, toolName];
        console.log('[TOOL_SELECTION] ➕ Adicionando:', toolName);
      }
      
      console.log('[TOOL_SELECTION] 🔄 Mudança:', prevSelected, '→', newSelection);
      
      // Notificar mudança
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