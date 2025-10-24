import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMermaidInit } from '@/hooks/useMermaidInit';

interface SimpleMermaidRendererProps {
  code: string;
  onRegenerate?: () => void;
}

const cleanMermaidCode = (code: string): string => {
  return code
    .trim()
    // Remove quebras de linha extras
    .replace(/\n{3,}/g, '\n\n')
    // Remove espaços antes/depois de -->
    .replace(/\s*-->\s*/g, ' --> ')
    // Remove espaços antes/depois de |texto|
    .replace(/\|\s+/g, '|')
    .replace(/\s+\|/g, '|')
    // Remove linhas vazias
    .split('\n')
    .filter(line => line.trim())
    .join('\n');
};

export const SimpleMermaidRenderer = ({ code, onRegenerate }: SimpleMermaidRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useMermaidInit();

  useEffect(() => {
    if (!isInitialized || !code || !containerRef.current) return;

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        const cleanedCode = cleanMermaidCode(code);
        console.log('[SimpleMermaid] Renderizando código:', cleanedCode);

        const { default: mermaid } = await import('mermaid');
        const uniqueId = `mermaid-${Date.now()}`;
        
        const { svg } = await mermaid.render(uniqueId, cleanedCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }

        console.log('[SimpleMermaid] ✅ Renderizado com sucesso');
      } catch (err: any) {
        console.error('[SimpleMermaid] ❌ Erro:', err);
        setError(err.message || 'Erro ao renderizar diagrama');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [isInitialized, code]);

  if (isRendering) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Renderizando fluxo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao renderizar fluxo</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>O diagrama gerado tem um erro de sintaxe Mermaid.</p>
          <p className="text-xs font-mono bg-background/50 p-2 rounded">{error}</p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" size="sm">
              🔄 Regenerar Fluxo
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container flex justify-center items-center p-6 bg-surface-elevated/30 rounded-lg border border-border/50 overflow-auto min-h-[400px]"
    />
  );
};
