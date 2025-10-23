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
    if (!isInitialized || !mermaidCode) {
      console.log(`[Mermaid][${flowId}] Aguardando inicialização`);
      return;
    }

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        console.log(`[Mermaid][${flowId}] 🎨 Renderizando...`);
        const uniqueId = `mermaid-${flowId}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, mermaidCode);
        
        // Aguardar um tick para garantir que o DOM está pronto
        await new Promise(resolve => setTimeout(resolve, 0));
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          console.log(`[Mermaid][${flowId}] ✅ Renderizado!`);
          setIsRendering(false);
        } else {
          console.error(`[Mermaid][${flowId}] ❌ Container não encontrado`);
          setError('Erro ao renderizar diagrama');
          setIsRendering(false);
        }
      } catch (err: any) {
        console.error(`[Mermaid][${flowId}] ❌ Erro:`, err.message || err);
        setError('Erro ao renderizar fluxo visual');
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [mermaidCode, flowId, isInitialized]);

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className="mermaid-container w-full overflow-x-auto py-4"
      />
    </div>
  );
};
