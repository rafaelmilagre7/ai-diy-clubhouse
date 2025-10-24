import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useMermaidInit } from '@/hooks/useMermaidInit';
import { Loader2 } from 'lucide-react';

interface MermaidFlowRendererProps {
  mermaidCode: string;
  flowId: string;
  zoom?: number;
}

export const MermaidFlowRenderer = ({ mermaidCode, flowId, zoom: externalZoom = 100 }: MermaidFlowRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useMermaidInit();

  // Aplicar zoom ao SVG quando mudar
  useEffect(() => {
    if (containerRef.current && !isRendering) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${externalZoom / 100})`;
        svg.style.transformOrigin = 'center';
        svg.style.transition = 'transform 0.2s ease-out';
      }
    }
  }, [externalZoom, isRendering]);

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
        
        // Sanitizar código Mermaid de forma ultra-robusta
        let cleanedCode = mermaidCode.trim();
        
        // Remove espaços extras em branco que causam erros de parsing
        cleanedCode = cleanedCode
          .split('\n')
          .map(line => {
            // Remove espaços extras no final das linhas
            line = line.trimEnd();
            
            // Corrige parênteses e colchetes com espaços extras
            line = line.replace(/\]\s+\(/g, '](');
            line = line.replace(/\)\s+\[/g, ')[');
            
            // Remove metadados inválidos após fechamento de nós
            if (line.includes(']')) {
              // Remove id:, title:, class: após ]
              line = line.replace(/\]\s*(id|title|class):[^\s\]\-\>]*/g, ']');
            }
            
            // Corrige espaços extras em arrows
            line = line.replace(/\s*-->\s*/g, ' --> ');
            line = line.replace(/\s*---\s*/g, ' --- ');
            line = line.replace(/\s*-\.->\s*/g, ' -.-> ');
            
            return line;
          })
          .filter(line => line.trim().length > 0)
          .join('\n');
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
            className="mermaid-container w-full overflow-auto py-4 transition-all duration-200 flex items-center justify-center"
            style={{ 
              transformOrigin: 'center',
              minHeight: '400px'
            }}
          />
        </>
      )}
    </div>
  );
};
