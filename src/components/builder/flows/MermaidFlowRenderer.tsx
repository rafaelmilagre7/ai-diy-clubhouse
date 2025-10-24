import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
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

  useLayoutEffect(() => {
    if (!isInitialized || !mermaidCode) {
      if (import.meta.env.DEV) {
        console.log(`[Mermaid][${flowId}] Aguardando inicialização`);
      }
      return;
    }

    let isActive = true;

    const renderDiagram = async () => {
      if (!isActive) return;
      
      setIsRendering(true);
      setError(null);

      try {
        if (import.meta.env.DEV) {
          console.log(`[Mermaid][${flowId}] 🎨 Renderizando...`);
        }
        
        // Sanitizar código Mermaid de forma ultra-robusta
        let cleanedCode = mermaidCode.trim();
        
        // Remove espaços extras em branco que causam erros de parsing
        cleanedCode = cleanedCode
          .split('\n')
          .map(line => {
            line = line.trimEnd();
            line = line.replace(/\]\s+\(/g, '](');
            line = line.replace(/\)\s+\[/g, ')[');
            
            if (line.includes(']')) {
              line = line.replace(/\]\s*(id|title|class):[^\s\]\-\>]*/g, ']');
            }
            
            line = line.replace(/\s*-->\s*/g, ' --> ');
            line = line.replace(/\s*---\s*/g, ' --- ');
            line = line.replace(/\s*-\.->\s*/g, ' -.-> ');
            
            return line;
          })
          .filter(line => line.trim().length > 0)
          .join('\n');
        
        if (import.meta.env.DEV) {
          console.log(`[Mermaid][${flowId}] Código sanitizado:`, cleanedCode.substring(0, 100) + '...');
        }
        
        const uniqueId = `mermaid-${flowId}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanedCode);
        
        if (!isActive) return;
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          if (import.meta.env.DEV) {
            console.log(`[Mermaid][${flowId}] ✅ Renderizado!`);
          }
          setIsRendering(false);
        } else {
          console.error(`[Mermaid][${flowId}] ❌ Container não encontrado`);
          setError('Erro ao renderizar diagrama');
          setIsRendering(false);
        }
      } catch (err: any) {
        if (!isActive) return;
        console.error(`[Mermaid][${flowId}] ❌ Erro:`, err.message || err);
        
        const errorMsg = err.message?.includes('Parse error') 
          ? 'Erro na sintaxe do diagrama. Por favor, regenere esta seção.'
          : 'Erro ao renderizar diagrama. Tente recarregar a página.';
        
        setError(errorMsg);
        setIsRendering(false);
      }
    };

    renderDiagram();

    return () => {
      isActive = false;
    };
  }, [mermaidCode, flowId, isInitialized]);

  return (
    <div className="relative min-h-[400px]">
      {/* Loader como overlay */}
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Container sempre presente no DOM */}
      <div 
        ref={containerRef} 
        className="mermaid-container w-full overflow-auto py-4 transition-all duration-200 flex items-center justify-center"
        style={{ 
          transformOrigin: 'center',
          minHeight: '400px'
        }}
      />

      {/* Mensagem de erro como overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center py-8 space-y-3 bg-background/90 backdrop-blur-sm rounded-lg p-6 border border-destructive/50">
            <p className="text-destructive text-sm">{error}</p>
            <p className="text-xs text-muted-foreground">
              Este diagrama precisa ser regenerado pela IA devido a um erro de sintaxe.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
