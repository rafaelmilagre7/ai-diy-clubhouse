import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Trash2, 
  Download, 
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Bug
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedLogEntry {
  id: string;
  timestamp: string;
  category: 'config' | 'connectivity' | 'templates' | 'test' | 'system';
  level: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: string;
  metadata?: Record<string, any>;
}

interface AdvancedLogsViewerProps {
  logs: string[];
  onClear: () => void;
  className?: string;
}

export const AdvancedLogsViewer: React.FC<AdvancedLogsViewerProps> = ({ 
  logs, 
  onClear, 
  className = "" 
}) => {
  const [filter, setFilter] = useState<{
    category: string;
    level: string;
    search: string;
  }>({
    category: 'all',
    level: 'all',
    search: ''
  });
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para os logs mais recentes
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const parseAdvancedLogEntry = (log: string): AdvancedLogEntry => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestampMatch = log.match(/\[(\d{2}:\d{2}:\d{2})\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : '';
    
    let message = log.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, '');
    
    // Detectar categoria baseada no conteúdo
    let category: AdvancedLogEntry['category'] = 'system';
    if (message.includes('configuração') || message.includes('Config') || message.includes('TOKEN')) {
      category = 'config';
    } else if (message.includes('conectividade') || message.includes('API') || message.includes('latência')) {
      category = 'connectivity';
    } else if (message.includes('template') || message.includes('Business ID')) {
      category = 'templates';
    } else if (message.includes('teste') || message.includes('envio')) {
      category = 'test';
    }
    
    // Detectar nível baseado no emoji/conteúdo
    let level: AdvancedLogEntry['level'] = 'info';
    if (message.includes('✅') || message.includes('sucesso')) {
      level = 'success';
    } else if (message.includes('❌') || message.includes('Erro') || message.includes('falhou')) {
      level = 'error';
    } else if (message.includes('⚠️') || message.includes('Aviso')) {
      level = 'warning';
    }
    
    // Extrair duração se presente
    const durationMatch = message.match(/(\d+ms)/);
    const duration = durationMatch ? durationMatch[1] : undefined;
    
    // Limpar emojis da mensagem para exibição
    const cleanMessage = message.replace(/^[✅❌⚠️ℹ️🔍🌐📱🎯📋⚙️]\s*/, '');
    
    return {
      id,
      timestamp,
      category,
      level,
      message: cleanMessage,
      duration,
      metadata: { original: log }
    };
  };

  const parsedLogs = logs.map(parseAdvancedLogEntry);
  
  const filteredLogs = parsedLogs.filter(log => {
    const categoryMatch = filter.category === 'all' || log.category === filter.category;
    const levelMatch = filter.level === 'all' || log.level === filter.level;
    const searchMatch = filter.search === '' || 
      log.message.toLowerCase().includes(filter.search.toLowerCase());
    
    return categoryMatch && levelMatch && searchMatch;
  });

  const getLogIcon = (level: AdvancedLogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-operational" />;
      case 'error': return <XCircle className="h-4 w-4 text-status-error" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      default: return <Info className="h-4 w-4 text-operational" />;
    }
  };

  const getCategoryIcon = (category: AdvancedLogEntry['category']) => {
    switch (category) {
      case 'config': return '⚙️';
      case 'connectivity': return '🌐';
      case 'templates': return '📋';
      case 'test': return '🧪';
      default: return '📱';
    }
  };

  const getCategoryColor = (category: AdvancedLogEntry['category']) => {
    switch (category) {
      case 'config': return 'border-operational text-operational';
      case 'connectivity': return 'border-operational text-operational';
      case 'templates': return 'border-strategy text-strategy';
      case 'test': return 'border-status-warning text-status-warning';
      default: return 'border-border text-muted-foreground';
    }
  };

  const logCounts = {
    all: parsedLogs.length,
    config: parsedLogs.filter(l => l.category === 'config').length,
    connectivity: parsedLogs.filter(l => l.category === 'connectivity').length,
    templates: parsedLogs.filter(l => l.category === 'templates').length,
    test: parsedLogs.filter(l => l.category === 'test').length,
    system: parsedLogs.filter(l => l.category === 'system').length,
  };

  const levelCounts = {
    all: parsedLogs.length,
    success: parsedLogs.filter(l => l.level === 'success').length,
    error: parsedLogs.filter(l => l.level === 'error').length,
    warning: parsedLogs.filter(l => l.level === 'warning').length,
    info: parsedLogs.filter(l => l.level === 'info').length,
  };

  const exportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.category.toUpperCase()}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-debug-advanced-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bug className="h-5 w-5 text-aurora-primary" />
            Logs Avançados de Debug
            {logs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredLogs.length}/{logs.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportLogs}
                  className="h-7 px-2 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Exportar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onClear}
                  className="h-7 px-2 text-xs hover:bg-status-error/10 hover:text-status-error hover:border-status-error/30"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Filtros Avançados */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nos logs..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-48 h-8 text-sm bg-surface-elevated border-border"
            />
          </div>
          
          <Select value={filter.category} onValueChange={(value) => setFilter(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="w-36 h-8 text-sm bg-surface-elevated border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias ({logCounts.all})</SelectItem>
              <SelectItem value="config">⚙️ Config ({logCounts.config})</SelectItem>
              <SelectItem value="connectivity">🌐 API ({logCounts.connectivity})</SelectItem>
              <SelectItem value="templates">📋 Templates ({logCounts.templates})</SelectItem>
              <SelectItem value="test">🧪 Testes ({logCounts.test})</SelectItem>
              <SelectItem value="system">📱 Sistema ({logCounts.system})</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filter.level} onValueChange={(value) => setFilter(prev => ({ ...prev, level: value }))}>
            <SelectTrigger className="w-32 h-8 text-sm bg-surface-elevated border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Níveis ({levelCounts.all})</SelectItem>
              <SelectItem value="success">✅ Sucesso ({levelCounts.success})</SelectItem>
              <SelectItem value="error">❌ Erro ({levelCounts.error})</SelectItem>
              <SelectItem value="warning">⚠️ Aviso ({levelCounts.warning})</SelectItem>
              <SelectItem value="info">ℹ️ Info ({levelCounts.info})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-surface-elevated border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              {logs.length === 0 
                ? 'Os logs aparecerão aqui...' 
                : 'Nenhum log corresponde aos filtros selecionados'
              }
            </p>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 p-3 rounded hover:bg-muted/50 transition-colors border border-border/50"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground font-mono min-w-timestamp">
                      {log.timestamp}
                    </span>
                    
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs px-2 py-0", getCategoryColor(log.category))}
                    >
                      {getCategoryIcon(log.category)} {log.category}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      {getLogIcon(log.level)}
                      <span className="text-sm text-foreground flex-1 min-w-0">
                        {log.message}
                      </span>
                    </div>
                    
                    {log.duration && (
                      <Badge variant="outline" className="text-xs border-aurora-primary text-aurora-primary">
                        <Clock className="w-3 h-3 mr-1" />
                        {log.duration}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};