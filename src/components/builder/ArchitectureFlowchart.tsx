import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ArchitectureFlowchartProps {
  flowchart: {
    mermaid_code: string;
    description: string;
  };
}

export const ArchitectureFlowchart: React.FC<ArchitectureFlowchartProps> = ({ flowchart }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flowchart?.mermaid_code || !mermaidRef.current) return;

    const renderDiagram = async () => {
      try {
        // Limpar completamente qualquer renderização anterior
        const container = mermaidRef.current;
        if (!container) return;
        
        container.innerHTML = '';
        container.removeAttribute('data-processed');
        
        // Re-inicializar Mermaid com configuração dark
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: '#818cf8',
            primaryTextColor: '#fff',
            primaryBorderColor: '#6366f1',
            lineColor: '#94a3b8',
            secondaryColor: '#a78bfa',
            tertiaryColor: '#c084fc',
            background: '#1e293b',
            mainBkg: '#1e293b',
            secondBkg: '#334155',
            border1: '#475569',
            border2: '#64748b',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
          },
        });

        // Renderizar diretamente sem sanitização (Mermaid valida internamente)
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, flowchart.mermaid_code);
        
        // Inserir SVG
        container.innerHTML = svg;
        
        console.log('✅ Mermaid renderizado com sucesso:', id);
      } catch (error) {
        console.error('❌ Erro ao renderizar Mermaid:', error);
        
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `
            <div class="text-center py-12 text-muted-foreground space-y-3">
              <svg class="h-12 w-12 mx-auto text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="font-semibold">Erro ao renderizar fluxograma</p>
              <p class="text-xs">Código Mermaid inválido ou formato não suportado</p>
              <details class="text-left max-w-lg mx-auto mt-4 p-4 bg-muted/30 rounded-lg">
                <summary class="cursor-pointer font-mono text-xs">Ver código Mermaid</summary>
                <pre class="mt-2 text-xs overflow-auto">${flowchart.mermaid_code}</pre>
              </details>
            </div>
          `;
        }
      }
    };

    // Delay para garantir que o DOM está pronto
    const timer = setTimeout(renderDiagram, 100);
    return () => clearTimeout(timer);
  }, [flowchart]);

  const handleDownloadPNG = async () => {
    try {
      const svg = mermaidRef.current?.querySelector('svg');
      if (!svg) {
        toast.error('Fluxograma não encontrado');
        return;
      }

      // Convert SVG to canvas and download
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const blob = new Blob([data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'arquitetura-miracle-ai.png';
            link.click();
            toast.success('Fluxograma baixado com sucesso!');
          }
        });
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Erro ao baixar fluxograma:', error);
      toast.error('Erro ao baixar fluxograma');
    }
  };

  if (!flowchart?.mermaid_code) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Fluxograma não disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flowchart.description && (
        <p className="text-sm text-foreground/80 leading-relaxed">
          {flowchart.description}
        </p>
      )}

      <div className="relative bg-muted/30 rounded-lg p-6 border border-border/50 overflow-x-auto">
        <div ref={mermaidRef} className="mermaid flex items-center justify-center min-h-[300px]">
          {flowchart.mermaid_code}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleDownloadPNG} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Baixar Fluxograma (PNG)
        </Button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success/30 border border-success" />
          <span>Sucesso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-status-error/30 border border-status-error" />
          <span>Erro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/30 border border-primary" />
          <span>Processamento</span>
        </div>
      </div>
    </div>
  );
};