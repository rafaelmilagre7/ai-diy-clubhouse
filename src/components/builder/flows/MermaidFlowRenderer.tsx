import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useMermaidInit } from '@/hooks/useMermaidInit';
import { Loader2 } from 'lucide-react';

interface MermaidFlowRendererProps {
  mermaidCode: string;
  flowId: string;
}

export const MermaidFlowRenderer = ({ mermaidCode, flowId }: MermaidFlowRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useMermaidInit();

  useEffect(() => {
    if (!isInitialized || !containerRef.current || !mermaidCode) return;

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        const uniqueId = `mermaid-${flowId}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, mermaidCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err: any) {
        console.error('[MermaidFlowRenderer] Erro ao renderizar:', err);
        setError('Erro ao renderizar fluxo visual');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [mermaidCode, flowId, isInitialized]);

  if (isRendering) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container w-full overflow-x-auto py-4"
    />
  );
};
