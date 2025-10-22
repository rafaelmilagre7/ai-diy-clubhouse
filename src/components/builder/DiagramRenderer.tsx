import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { 
  Download, Maximize2, Minimize2, Copy, 
  ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Info, Move
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiagramRendererProps {
  diagram: {
    mermaid_code: string;
    description: string;
  } | null;
  diagramName: string;
  diagramTitle: string;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({ 
  diagram, 
  diagramName,
  diagramTitle 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!diagram?.mermaid_code || !mermaidRef.current) {
      setIsLoading(false);
      return;
    }

    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const container = mermaidRef.current;
        if (!container) return;
        
        container.innerHTML = '';
        container.removeAttribute('data-processed');
        
        // Configuração Mermaid otimizada
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: '#22d3ee',
            primaryTextColor: '#fff',
            primaryBorderColor: '#06b6d4',
            lineColor: '#94a3b8',
            secondaryColor: '#0891b2',
            tertiaryColor: '#0e7490',
            background: '#0f172a',
            mainBkg: '#0f172a',
            secondBkg: '#1e293b',
            border1: '#334155',
            border2: '#475569',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
          },
          journey: {
            useMaxWidth: true,
          },
          sequence: {
            useMaxWidth: true,
          }
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, diagram.mermaid_code);
        
        container.innerHTML = svg;
        setIsLoading(false);
        console.log(`✅ Diagrama ${diagramName} renderizado com sucesso`);
      } catch (err: any) {
        console.error(`❌ Erro ao renderizar ${diagramName}:`, err);
        setError(err.message || 'Erro desconhecido ao renderizar diagrama');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(renderDiagram, 100);
    return () => clearTimeout(timer);
  }, [diagram, diagramName, retryCount]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !error) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    toast.success('Visão resetada');
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      toast.info(`Tentando novamente... (${retryCount + 1}/3)`);
    } else {
      toast.error('Máximo de tentativas atingido');
    }
  };

  const handleDownloadPNG = async () => {
    try {
      const svg = mermaidRef.current?.querySelector('svg');
      if (!svg) {
        toast.error('Diagrama não encontrado');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const blob = new Blob([data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx?.scale(2, 2);
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${diagramName}.png`;
            link.click();
            toast.success('PNG baixado!');
          }
        });
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Erro ao baixar:', error);
      toast.error('Erro ao baixar PNG');
    }
  };

  const handleDownloadSVG = () => {
    try {
      const svg = mermaidRef.current?.querySelector('svg');
      if (!svg) {
        toast.error('Diagrama não encontrado');
        return;
      }

      const data = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagramName}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('SVG baixado!');
    } catch (error) {
      console.error('Erro ao baixar SVG:', error);
      toast.error('Erro ao baixar SVG');
    }
  };

  const handleCopyMermaid = () => {
    if (diagram?.mermaid_code) {
      navigator.clipboard.writeText(diagram.mermaid_code);
      toast.success('Código Mermaid copiado!');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    if (!isFullscreen) {
      resetView();
    }
  };

  if (!diagram?.mermaid_code) {
    return (
      <div className="text-center py-12 text-muted-foreground space-y-3">
        <Info className="h-12 w-12 mx-auto opacity-50" />
        <p className="font-medium">Diagrama não disponível</p>
        <p className="text-xs">Este diagrama não foi gerado para esta solução</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}
      >
        {/* Header com descrição */}
        <AnimatePresence>
          {diagram.description && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
            >
              <p className="text-sm text-foreground/90 leading-relaxed">
                {diagram.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar de controles */}
        <div className="flex flex-wrap gap-2 items-center justify-between bg-surface-elevated/50 p-3 rounded-lg border border-border/50">
          {/* Controles de zoom/pan */}
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} 
                  variant="outline" 
                  size="sm"
                  disabled={zoom <= 0.5 || isLoading || !!error}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Diminuir zoom</TooltipContent>
            </Tooltip>

            <Button 
              onClick={resetView} 
              variant="outline" 
              size="sm"
              disabled={isLoading || !!error}
              className="min-w-[60px]"
            >
              {Math.round(zoom * 100)}%
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))} 
                  variant="outline" 
                  size="sm"
                  disabled={zoom >= 3 || isLoading || !!error}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aumentar zoom</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={resetView} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading || !!error}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resetar visão</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading || !!error}
                  className="cursor-move"
                >
                  <Move className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Arraste para mover</TooltipContent>
            </Tooltip>
          </div>

          {/* Ações */}
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleCopyMermaid} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  <Copy className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Código</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar código Mermaid</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleDownloadSVG} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading || !!error}
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">SVG</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Baixar como SVG</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleDownloadPNG} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading || !!error}
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">PNG</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Baixar como PNG (alta qualidade)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={toggleFullscreen} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading || !!error}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Container do diagrama com pan/zoom */}
        <div 
          ref={containerRef}
          className={`
            relative bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl 
            border border-border/50 overflow-hidden
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            ${isFullscreen ? 'h-[calc(100vh-180px)]' : 'min-h-[400px] max-h-[600px]'}
          `}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-sm text-muted-foreground">Renderizando diagrama...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-lg w-full space-y-4 text-center"
              >
                <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Erro ao renderizar diagrama</h3>
                  <p className="text-sm text-muted-foreground">
                    O código Mermaid gerado pela IA contém erros de sintaxe.
                  </p>
                  {retryCount < 3 && (
                    <p className="text-xs text-muted-foreground">
                      Tentativa {retryCount}/3
                    </p>
                  )}
                </div>

                <div className="flex gap-2 justify-center">
                  {retryCount < 3 && (
                    <Button onClick={handleRetry} size="sm" variant="default">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  )}
                  <Button 
                    onClick={() => setShowDetails(!showDetails)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {showDetails ? 'Ocultar' : 'Ver'} Detalhes
                  </Button>
                </div>

                <AnimatePresence>
                  {showDetails && (
                    <motion.details 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-left"
                      open
                    >
                      <summary className="text-sm font-medium mb-2 cursor-pointer">
                        Erro técnico:
                      </summary>
                      <pre className="text-xs p-4 bg-destructive/10 border border-destructive/30 rounded-lg overflow-auto max-h-48 text-destructive">
                        {error}
                      </pre>
                      
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                        <p className="font-medium">Código Mermaid gerado:</p>
                        <pre className="p-2 bg-background/50 rounded overflow-auto max-h-32">
                          {diagram.mermaid_code}
                        </pre>
                      </div>
                    </motion.details>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Diagrama renderizado */}
          {!error && !isLoading && (
            <div 
              className="w-full h-full flex items-center justify-center p-8"
              style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
            >
              <div 
                ref={mermaidRef} 
                className="mermaid"
              />
            </div>
          )}

          {/* Hint de controles (apenas quando não há erro) */}
          {!error && !isLoading && (
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
              <p className="flex items-center gap-2">
                <Info className="h-3 w-3" />
                <span className="hidden sm:inline">Use Ctrl+Scroll para zoom • Arraste para mover</span>
                <span className="sm:hidden">Ctrl+Scroll = zoom</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer com estatísticas (apenas fullscreen) */}
        {isFullscreen && !error && (
          <div className="text-xs text-muted-foreground text-center">
            {diagramTitle} • Zoom: {Math.round(zoom * 100)}% • Pan: X:{Math.round(pan.x)} Y:{Math.round(pan.y)}
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};