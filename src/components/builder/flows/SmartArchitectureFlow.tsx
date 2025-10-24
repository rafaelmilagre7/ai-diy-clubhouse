import React, { useState } from 'react';
import { MermaidFlowRenderer } from './MermaidFlowRenderer';
import { FlowNodeSidebar } from './FlowNodeSidebar';
import { FlowProgressBar } from './FlowProgressBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Download,
  Sun,
  Moon,
  FileImage,
  FileText,
  Copy
} from 'lucide-react';
import { FlowExporter } from './FlowExporter';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { useFlowProgress } from '@/hooks/useFlowProgress';
import { useFlowNotes } from '@/hooks/useFlowNotes';
import { useFlowAnalytics } from '@/hooks/useFlowAnalytics';

interface Flow {
  id: string;
  title: string;
  description: string;
  mermaid_code: string;
  estimated_time?: string;
  complexity?: 'low' | 'medium' | 'high';
  key_decisions?: string[];
}

interface SmartArchitectureFlowProps {
  flow: Flow;
  solutionId: string;
  userId: string;
  progress?: any;
  onStepComplete?: (stepId: string) => void;
  onMarkSolutionComplete?: () => void;
  isCompletingSolution?: boolean;
}

const complexityConfig = {
  low: { label: 'Baixa', color: 'text-green-400' },
  medium: { label: 'Média', color: 'text-yellow-400' },
  high: { label: 'Alta', color: 'text-red-400' }
};

export const SmartArchitectureFlow: React.FC<SmartArchitectureFlowProps> = ({
  flow,
  solutionId,
  userId,
  progress: initialProgress,
  onStepComplete,
  onMarkSolutionComplete,
  isCompletingSolution = false
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Hooks customizados
  const { progress, markStepCompleted, markStepIncomplete, isStepCompleted, getStats } = useFlowProgress({
    solutionId,
    userId,
    initialProgress: initialProgress || {}
  });

  const { notes, updateNote, getNote } = useFlowNotes({
    solutionId,
    userId
  });

  const analytics = useFlowAnalytics();

  // Extrair nós do código Mermaid para contar etapas
  const extractNodes = (mermaidCode: string): string[] => {
    const nodeRegex = /([A-Z][A-Za-z0-9_]*)\[/g;
    const matches = mermaidCode.matchAll(nodeRegex);
    return Array.from(new Set(Array.from(matches, m => m[1])));
  };

  const nodes = extractNodes(flow.mermaid_code);
  const stats = getStats(nodes.length);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
    analytics.trackZoomChanged({ solution_id: solutionId, flow_type: flow.id, zoom_level: zoom + 25 });
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
    analytics.trackZoomChanged({ solution_id: solutionId, flow_type: flow.id, zoom_level: zoom - 25 });
  };

  const handleResetZoom = () => {
    setZoom(100);
    analytics.trackZoomChanged({ solution_id: solutionId, flow_type: flow.id, zoom_level: 100 });
  };

  // Export handler
  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    const elementId = `mermaid-${flow.id}`;
    const filename = `${flow.title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
    
    try {
      toast.loading(`Exportando como ${format.toUpperCase()}...`);
      
      if (format === 'png') {
        await FlowExporter.exportAsPNG(elementId, filename);
      } else if (format === 'svg') {
        await FlowExporter.exportAsSVG(elementId, filename);
      } else if (format === 'pdf') {
        await FlowExporter.exportAsPDF(elementId, filename);
      }
      
      toast.success(`Diagrama exportado como ${format.toUpperCase()}!`);
      analytics.trackFlowExported({ solution_id: solutionId, flow_type: flow.id, export_format: format });
    } catch (error: any) {
      console.error('Erro ao exportar:', error);
      toast.error(`Erro ao exportar: ${error.message}`);
    }
  };

  const handleCopyToClipboard = async () => {
    const elementId = `mermaid-${flow.id}`;
    try {
      toast.loading('Copiando imagem...');
      await FlowExporter.copyToClipboard(elementId);
      toast.success('Imagem copiada para área de transferência!');
    } catch (error: any) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar imagem');
    }
  };

  // Confetti ao completar todas as etapas
  const handleMarkSolutionComplete = () => {
    if (onMarkSolutionComplete) {
      onMarkSolutionComplete();
      
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  };

  // Node click handler (simplified - real implementation would parse SVG clicks)
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    analytics.trackFlowViewed({ solution_id: solutionId, flow_type: flow.id, step_id: nodeId });
  };

  const handleToggleComplete = () => {
    if (selectedNodeId) {
      if (isStepCompleted(selectedNodeId)) {
        markStepIncomplete(selectedNodeId);
      } else {
        markStepCompleted(selectedNodeId);
        analytics.trackStepCompleted({ solution_id: solutionId, flow_type: flow.id, step_id: selectedNodeId });
      }
    }
  };

  const handleNoteChange = (note: string) => {
    if (selectedNodeId) {
      updateNote(selectedNodeId, note);
      if (note.length > 0) {
        analytics.trackNoteAdded({ 
          solution_id: solutionId, 
          flow_type: flow.id, 
          step_id: selectedNodeId,
          note_length: note.length 
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <FlowProgressBar
        completed={stats.completed}
        total={stats.total}
        percentage={stats.percentage}
        onMarkComplete={handleMarkSolutionComplete}
        isCompleting={isCompletingSolution}
      />

      {/* Flow Card */}
      <div className={cn(
        "relative bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300",
        isFullscreen && "fixed inset-4 z-50 shadow-2xl"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border bg-surface-elevated">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-high-contrast mb-1">
                {flow.title}
              </h3>
              <p className="text-sm text-medium-contrast">
                {flow.description}
              </p>
            </div>
            <div className="flex gap-2">
              {flow.estimated_time && (
                <Badge variant="secondary" className="text-xs">
                  {flow.estimated_time}
                </Badge>
              )}
              {flow.complexity && (
                <Badge variant="outline" className={cn("text-xs", complexityConfig[flow.complexity].color)}>
                  {complexityConfig[flow.complexity].label}
                </Badge>
              )}
            </div>
          </div>

          {/* Key Decisions */}
          {flow.key_decisions && flow.key_decisions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-high-contrast">Decisões Críticas:</p>
              <ul className="space-y-1">
                {flow.key_decisions.map((decision, idx) => (
                  <li key={idx} className="text-xs text-medium-contrast flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-elevated border-b border-border">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-medium-contrast min-w-[60px] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              title="Alterar tema"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyToClipboard}
              title="Copiar imagem"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('png')}
              title="Exportar PNG"
            >
              <FileImage className="h-4 w-4 mr-1" />
              PNG
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('svg')}
              title="Exportar SVG"
            >
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('pdf')}
              title="Exportar PDF"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Sair do fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mermaid Diagram */}
        <div 
          id={`mermaid-${flow.id}`}
          className={cn(
            "p-6 overflow-auto bg-background",
            isFullscreen ? "h-[calc(100vh-280px)]" : "max-h-[600px]"
          )}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${(100 / zoom) * 100}%`,
            height: `${(100 / zoom) * 100}%`
          }}
        >
          <MermaidFlowRenderer 
            mermaidCode={flow.mermaid_code} 
            flowId={flow.id}
          />
        </div>
      </div>

      {/* Sidebar */}
      <FlowNodeSidebar
        isOpen={selectedNodeId !== null}
        onClose={() => setSelectedNodeId(null)}
        nodeId={selectedNodeId || ''}
        nodeTitle={selectedNodeId || 'Etapa'}
        nodeDescription="Clique em um nó do diagrama para ver detalhes"
        isCompleted={selectedNodeId ? isStepCompleted(selectedNodeId) : false}
        onToggleComplete={handleToggleComplete}
        note={selectedNodeId ? getNote(selectedNodeId) : ''}
        onNoteChange={handleNoteChange}
      />
    </div>
  );
};
