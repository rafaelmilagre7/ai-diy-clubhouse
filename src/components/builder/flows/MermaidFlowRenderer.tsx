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
    if (!isInitialized || !containerRef.current || !mermaidCode) {
      console.log('[MermaidFlowRenderer] Aguardando condições:', {
        isInitialized,
        hasContainer: !!containerRef.current,
        hasMermaidCode: !!mermaidCode,
        flowId
      });
      return;
    }

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      // Timeout de segurança
      const timeoutId = setTimeout(() => {
        console.error('[MermaidFlowRenderer] ⏱️ Timeout ao renderizar:', flowId);
        setError('Timeout ao renderizar fluxo');
        setIsRendering(false);
      }, 10000); // 10 segundos

      try {
        console.log('[MermaidFlowRenderer] 🎨 Iniciando renderização:', flowId);
        const uniqueId = `mermaid-${flowId}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, mermaidCode);
        
        clearTimeout(timeoutId);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          console.log('[MermaidFlowRenderer] ✅ Renderizado com sucesso:', flowId);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('[MermaidFlowRenderer] ❌ Erro ao renderizar:', flowId, err);
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
