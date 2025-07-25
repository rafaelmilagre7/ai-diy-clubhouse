import React from 'react';
import { Label } from '@/components/ui/label';
import { CheckSquare } from 'lucide-react';
import { ToolGrid } from './ToolGrid';
import { useToolSelection } from '@/hooks/useToolSelection';

interface ToolSelectorProps {
  initialTools?: string[];
  onSelectionChange: (tools: string[]) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ 
  initialTools, 
  onSelectionChange 
}) => {
  const { selectedTools, toggleTool, selectionCount } = useToolSelection({
    initialTools,
    onSelectionChange
  });

  console.log('[TOOL_SELECTOR] 🔄 Renderizando com:', selectedTools, 'Count:', selectionCount);
  console.log('[TOOL_SELECTOR] 📥 initialTools recebido:', initialTools);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Quais ferramentas de IA você já usa? (opcional)
        </Label>
        {selectionCount > 0 && (
          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
            {selectionCount} selecionada{selectionCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <ToolGrid 
        selectedTools={selectedTools}
        onToolToggle={toggleTool}
      />
    </div>
  );
};