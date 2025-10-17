import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface JsonViewerProps {
  data: any;
  title?: string;
  className?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title, className = "" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const jsonString = JSON.stringify(data, null, 2);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success('JSON copiado para área de transferência');
  };
  
  if (!data) return null;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-200">{title}</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 px-2 text-xs text-slate-400 hover:text-slate-200"
            >
              {isCollapsed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {isCollapsed ? 'Mostrar' : 'Ocultar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </Button>
          </div>
        </div>
      )}
      
      {!isCollapsed && (
        <div className="bg-surface-elevated border border-border rounded-lg overflow-hidden">
          <pre className="p-4 text-sm text-foreground overflow-auto max-h-64">
            <code className="text-green-400">
              {jsonString}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};