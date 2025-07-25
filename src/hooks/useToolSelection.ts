import { useState, useCallback, useEffect } from 'react';

export interface UseToolSelectionProps {
  initialTools?: string[];
  onSelectionChange?: (tools: string[]) => void;
}

export const useToolSelection = ({ 
  initialTools = [], 
  onSelectionChange 
}: UseToolSelectionProps = {}) => {
  // Inicializar com ferramentas existentes ou "Nenhuma ainda" como padrão
  const [selectedTools, setSelectedTools] = useState<string[]>(() => {
    console.log('[TOOL_SELECTION] 🚀 Inicializando com:', initialTools);
    // Se initialTools tem valores e não contém apenas "Nenhuma ainda", use-os
    if (initialTools.length > 0 && !(initialTools.length === 1 && initialTools[0] === 'Nenhuma ainda')) {
      return initialTools;
    }
    return ['Nenhuma ainda'];
  });

  // Sincronizar com initialTools quando mudarem (evitando loops desnecessários)
  useEffect(() => {
    const currentToolsStr = JSON.stringify([...selectedTools].sort());
    const initialToolsStr = JSON.stringify([...initialTools].sort());
    
    // Só sincroniza se realmente mudou e não é apenas um re-render
    if (initialToolsStr !== currentToolsStr && initialTools.length > 0) {
      console.log('[TOOL_SELECTION] 🔄 Sincronizando com initialTools:', initialTools);
      
      // Se initialTools tem valores válidos e diferentes do estado atual
      if (!(initialTools.length === 1 && initialTools[0] === 'Nenhuma ainda' && selectedTools.includes('Nenhuma ainda'))) {
        setSelectedTools(initialTools.length > 0 ? initialTools : ['Nenhuma ainda']);
      }
    }
  }, [initialTools]); // Removido selectedTools da dependência para evitar loops

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