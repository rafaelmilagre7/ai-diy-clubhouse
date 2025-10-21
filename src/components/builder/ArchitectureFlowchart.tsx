import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
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
    if (!flowchart?.mermaid_code) return;

    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
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
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });

    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = flowchart.mermaid_code;
      mermaid.run({
        querySelector: '.mermaid',
      });
    }
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