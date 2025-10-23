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
        
        // Sanitizar código Mermaid de forma mais robusta
        let cleanedCode = mermaidCode.trim();
        const lines = cleanedCode.split('\n');
        
        // Processar cada linha
        const cleanLines = lines.map(line => {
          // Remove metadados inválidos (id:, title:) que aparecem após ]
          if (line.includes(']') && (line.includes(' id:') || line.includes(' title:'))) {
            const bracketIndex = line.lastIndexOf(']');
            return line.substring(0, bracketIndex + 1);
          }
          return line;
        }).filter(line => line.trim().length > 0);
        
        cleanedCode = cleanLines.join('\n');
        console.log(`[Mermaid][${flowId}] Código sanitizado:`, cleanedCode.substring(0, 100) + '...');
        
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

  return (
    <div className="relative group">
      {error ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-destructive text-sm">{error}</p>
          <p className="text-xs text-muted-foreground">
            Este diagrama precisa ser regenerado pela IA devido a um erro de sintaxe.
          </p>
        </div>
      ) : (
        <>
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div 
            ref={containerRef} 
            className="mermaid-container w-full overflow-x-auto py-4 transition-transform duration-200"
            style={{ 
              transformOrigin: 'top left',
            }}
          />
        </>
      )}
    </div>
  );
};
