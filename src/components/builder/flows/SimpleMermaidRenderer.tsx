import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMermaidInit } from '@/hooks/useMermaidInit';
import { isMermaidInitialized } from '@/lib/mermaidManager';

interface SimpleMermaidRendererProps {
  code: string;
}

const cleanMermaidCode = (code: string): string => {
  console.log('[MERMAID] 🔧 Código original:', code);
  
  const cleaned = code
    .trim()
    // Remove múltiplas quebras de linha
    .replace(/\n{3,}/g, '\n')
    // Remove espaços extras no início/fim de cada linha
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    // Normaliza espaços ao redor de setas
    .replace(/\s*-->\s*/g, ' --> ')
    // Normaliza labels nas setas: -->|Sim| ou -->|Não|
    .replace(/-->\s*\|\s*/g, '-->|')
    .replace(/\s*\|\s*([A-Z])/g, '| $1')
    // Remove espaços antes de colchetes/chaves
    .replace(/\s+\[/g, '[')
    .replace(/\]\s+/g, '] ')
    .replace(/\s+\{/g, '{')
    .replace(/\}\s+/g, '} ');
  
  console.log('[MERMAID] ✅ Código limpo:', cleaned);
  return cleaned;
};

export const SimpleMermaidRenderer = ({ code }: SimpleMermaidRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const isInitialized = useMermaidInit();

  // Contador de tempo de loading
  useEffect(() => {
    if (isRendering) {
      const interval = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setLoadingTime(0);
    }
  }, [isRendering]);

  // FASE 1: useLayoutEffect para garantir containerRef disponível
  useLayoutEffect(() => {
    const currentRenderId = ++renderIdRef.current;
    let isActive = true;

    const renderDiagram = async () => {
      // Verificações de pré-requisitos
      if (!containerRef.current) {
        console.log('[SimpleMermaid] ⏳ Container não disponível ainda');
        setIsRendering(false);
        return;
      }

      const mermaidReady = isInitialized || isMermaidInitialized();
      if (!mermaidReady) {
        console.log('[SimpleMermaid] ⏳ Aguardando Mermaid...');
        return;
      }

      if (!code) {
        console.log('[SimpleMermaid] ⏳ Sem código para renderizar');
        setIsRendering(false);
        return;
      }

      setIsRendering(true);
      setError(null);
      console.log('[SimpleMermaid] 🎨 Iniciando renderização ID:', currentRenderId);

      try {
        const cleanedCode = cleanMermaidCode(code);
        console.log('[SimpleMermaid] 🎨 Renderizando código:', cleanedCode.substring(0, 100) + '...');

        const { default: mermaid } = await import('mermaid');
        const uniqueId = `mermaid-${currentRenderId}-${Date.now()}`;
        
        const { svg } = await mermaid.render(uniqueId, cleanedCode);
        
        // Verificar se ainda é a renderização ativa
        if (isActive && containerRef.current && renderIdRef.current === currentRenderId) {
          containerRef.current.innerHTML = svg;
          console.log('[SimpleMermaid] ✅ Renderizado com sucesso ID:', currentRenderId);
          setIsRendering(false);
        }
      } catch (err: any) {
        console.error('[SimpleMermaid] ❌ Erro:', err);
        if (isActive) {
          setError(err.message || 'Erro ao renderizar diagrama');
          setIsRendering(false);
        }
      }
    };

    renderDiagram();

    // Cleanup para evitar memory leak
    return () => {
      isActive = false;
      console.log('[SimpleMermaid] 🧹 Cleanup ID:', currentRenderId);
    };
  }, [isInitialized, code]);

  // FASE 2: Fallback de retry automático após 3s
  useEffect(() => {
    if (isRendering && loadingTime > 3 && containerRef.current) {
      console.warn('[SimpleMermaid] ⚠️ Forçando re-render após 3s');
      renderIdRef.current++;
    }
  }, [loadingTime, isRendering]);

  // FASE 3: Feedback visual melhorado com debug info
  if (isRendering) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            Renderizando fluxo... ({loadingTime}s)
          </p>
          {import.meta.env.DEV && (
            <p className="text-xs text-muted-foreground/60">
              Render ID: {renderIdRef.current} | Mermaid: {isInitialized ? '✅' : '⏳'}
            </p>
          )}
          {loadingTime > 5 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Recarregar página
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao renderizar</AlertTitle>
        <AlertDescription>
          <p className="text-sm">{error}</p>
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
