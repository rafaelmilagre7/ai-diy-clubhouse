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
  const [retryCount, setRetryCount] = useState(0);
  const isInitialized = useMermaidInit();
  const maxRetries = 5;

  useEffect(() => {
    // Verificação básica - sem containerRef aqui para evitar race condition
    if (!isInitialized || !mermaidCode) {
      console.log(`[Mermaid][${flowId}] Aguardando inicialização:`, {
        initialized: isInitialized,
        hasCode: !!mermaidCode
      });
      return;
    }

    // Delay progressivo para garantir que o DOM está pronto
    const delayMs = 100 * (retryCount + 1);
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) {
        if (retryCount < maxRetries) {
          console.log(`[Mermaid][${flowId}] Tentativa ${retryCount + 1}/${maxRetries} - Aguardando DOM...`);
          setRetryCount(prev => prev + 1);
        } else {
          console.error(`[Mermaid][${flowId}] ❌ Max retries atingido`);
          setError('Não foi possível renderizar o diagrama');
          setIsRendering(false);
        }
        return;
      }

      // DOM pronto, renderizar
      renderDiagram();
    }, delayMs);

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      // Timeout de segurança
      const renderTimeoutId = setTimeout(() => {
        console.error(`[Mermaid][${flowId}] ⏱️ Timeout ao renderizar`);
        setError('Timeout ao renderizar fluxo');
        setIsRendering(false);
      }, 10000);

      try {
        console.log(`[Mermaid][${flowId}] 🎨 Iniciando renderização (tentativa ${retryCount + 1})`);
        const uniqueId = `mermaid-${flowId}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, mermaidCode);
        
        clearTimeout(renderTimeoutId);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          console.log(`[Mermaid][${flowId}] ✅ Renderizado com sucesso!`);
        }
      } catch (err: any) {
        clearTimeout(renderTimeoutId);
        console.error(`[Mermaid][${flowId}] ❌ Erro:`, err.message || err);
        setError('Erro ao renderizar fluxo visual');
      } finally {
        setIsRendering(false);
      }
    };

    return () => clearTimeout(timeoutId);
  }, [mermaidCode, flowId, isInitialized, retryCount, maxRetries]);

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
