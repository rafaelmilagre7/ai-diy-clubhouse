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
        
        // Sanitizar código Mermaid removendo metadados inválidos
        let cleanedCode = mermaidCode.trim();
        // Remove linhas com metadados incorretos (id: e title: no final)
        const lines = cleanedCode.split('\n');
        const lastLine = lines[lines.length - 1];
        if (lastLine.includes(' id:') || lastLine.includes(' title:')) {
          // Remove tudo após o último ] antes dos metadados
          const match = lastLine.match(/^(.+?\])/);
          if (match) {
            lines[lines.length - 1] = match[1];
            cleanedCode = lines.join('\n');
          }
        }
        
        const uniqueId = `mermaid-${flowId}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanedCode);
        
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
        
        // Mensagem de erro mais específica
        const errorMsg = err.message?.includes('Parse error') 
          ? 'Erro na sintaxe do diagrama. Por favor, regenere esta seção.'
          : 'Erro ao renderizar diagrama. Tente recarregar a página.';
        
        setError(errorMsg);
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
