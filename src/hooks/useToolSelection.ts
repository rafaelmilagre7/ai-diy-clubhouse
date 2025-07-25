import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseToolSelectionProps {
  initialTools?: string[];
  onSelectionChange?: (tools: string[]) => void;
}

export const useToolSelection = ({ 
  initialTools = [], 
  onSelectionChange 
}: UseToolSelectionProps = {}) => {
  // Usar ref para evitar re-inicializações desnecessárias
  const initializedRef = useRef(false);
  const lastNotifiedRef = useRef<string>('');
  
  // Inicializar apenas uma vez
  const [selectedTools, setSelectedTools] = useState<string[]>(() => {
    console.log('[TOOL_SELECTION] 🚀 Inicializando com:', initialTools);
    if (initialTools && initialTools.length > 0) {
      return initialTools;
    }
    return ['Nenhuma ainda'];
  });

  // Sincronizar apenas quando initialTools muda significativamente
  useEffect(() => {
    if (initializedRef.current) return; // Já foi inicializado
    
    if (initialTools && initialTools.length > 0) {
      console.log('[TOOL_SELECTION] 🔄 Sincronizando com initialTools:', initialTools);
      setSelectedTools(initialTools);
      initializedRef.current = true;
    }
  }, [initialTools]);

  const toggleTool = useCallback((toolName: string) => {
    console.log('[TOOL_SELECTION] 🖱️ Toggle para:', toolName);
    
    setSelectedTools(prevSelected => {
      let newSelection: string[];
      
      if (toolName === 'Nenhuma ainda') {
        // Se clicou em "Nenhuma ainda", limpar tudo e só deixar essa
        newSelection = ['Nenhuma ainda'];
        console.log('[TOOL_SELECTION] ✅ Selecionando apenas "Nenhuma ainda"');
      } else {
        // Se tem "Nenhuma ainda" selecionada, remover ela primeiro
        const currentWithoutNone = prevSelected.filter(tool => tool !== 'Nenhuma ainda');
        
        if (currentWithoutNone.includes(toolName)) {
          // Remover ferramenta existente
          newSelection = currentWithoutNone.filter(tool => tool !== toolName);
          console.log('[TOOL_SELECTION] ➖ Removendo:', toolName);
          
          // Se ficou vazio, adicionar "Nenhuma ainda"
          if (newSelection.length === 0) {
            newSelection = ['Nenhuma ainda'];
            console.log('[TOOL_SELECTION] ✅ Lista vazia, adicionando "Nenhuma ainda"');
          }
        } else {
          // Adicionar nova ferramenta
          newSelection = [...currentWithoutNone, toolName];
          console.log('[TOOL_SELECTION] ➕ Adicionando:', toolName);
        }
      }
      
      console.log('[TOOL_SELECTION] 🔄 Mudança:', prevSelected, '→', newSelection);
      
      // Evitar notificações duplicadas
      const newSelectionStr = JSON.stringify(newSelection.sort());
      if (onSelectionChange && lastNotifiedRef.current !== newSelectionStr) {
        lastNotifiedRef.current = newSelectionStr;
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
    const newSelection = ['Nenhuma ainda'];
    setSelectedTools(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [onSelectionChange]);

  const hasRealTools = selectedTools.length > 0 && !selectedTools.includes('Nenhuma ainda');
  const selectionCount = hasRealTools ? selectedTools.length : 0;

  return {
    selectedTools,
    toggleTool,
    isSelected,
    clearSelection,
    hasRealTools,
    selectionCount
  };
};