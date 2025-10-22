import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, Copy, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!diagram?.mermaid_code || !mermaidRef.current) {
      setIsLoading(false);
      return;
    }

    const renderDiagram = async () => {
      setIsLoading(true);
      setHasError(false);
      
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
      } catch (error) {
        console.error(`❌ Erro ao renderizar ${diagramName}:`, error);
        setHasError(true);
        setIsLoading(false);
        
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `
            <div class="text-center py-12 text-muted-foreground space-y-3">
              <svg class="h-12 w-12 mx-auto text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="font-semibold">Erro ao renderizar diagrama</p>
              <p class="text-xs">Código Mermaid inválido ou formato não suportado</p>
            </div>
          `;
        }
      }
    };

    const timer = setTimeout(renderDiagram, 100);
    return () => clearTimeout(timer);
  }, [diagram, diagramName]);

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
            toast.success('Diagrama baixado!');
          }
        });
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Erro ao baixar:', error);
      toast.error('Erro ao baixar diagrama');
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  if (!diagram?.mermaid_code) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Diagrama não disponível para esta solução</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Descrição */}
      {diagram.description && (
        <p className="text-sm text-foreground/80 leading-relaxed">
          {diagram.description}
        </p>
      )}

      {/* Controles */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={handleZoomOut} variant="outline" size="sm" disabled={zoom <= 50}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={handleResetZoom} variant="outline" size="sm">
            {zoom}%
          </Button>
          <Button onClick={handleZoomIn} variant="outline" size="sm" disabled={zoom >= 200}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCopyMermaid} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copiar Código
          </Button>
          <Button onClick={handleDownloadSVG} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button onClick={handleDownloadPNG} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
        </div>
      </div>

      {/* Container do diagrama */}
      <div 
        className={`
          relative bg-muted/30 rounded-lg p-6 border border-border/50 
          overflow-auto transition-all
          ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}
        `}
      >
        {isLoading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        <div 
          ref={mermaidRef} 
          className="mermaid flex items-center justify-center min-h-[300px]"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s'
          }}
        />
      </div>
    </motion.div>
  );
};
