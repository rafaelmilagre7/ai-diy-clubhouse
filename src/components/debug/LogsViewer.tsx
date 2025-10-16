import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Trash2, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface LogsViewerProps {
  logs: string[];
  onClear: () => void;
  className?: string;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({ logs, onClear, className = "" }) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'warning'>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll para os logs mais recentes
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  
  const parseLogEntry = (log: string): LogEntry => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestampMatch = log.match(/\[(\d{2}:\d{2}:\d{2})\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : '';
    const message = log.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, '');
    
    let type: LogEntry['type'] = 'info';
    if (message.includes('✅') || message.includes('sucesso')) type = 'success';
    else if (message.includes('❌') || message.includes('Erro')) type = 'error';
    else if (message.includes('⚠️') || message.includes('Aviso')) type = 'warning';
    
    return { id, timestamp, message, type };
  };
  
  const parsedLogs = logs.map(parseLogEntry);
  const filteredLogs = filter === 'all' 
    ? parsedLogs 
    : parsedLogs.filter(log => log.type === filter);
  
  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };
  
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-slate-300';
    }
  };
  
  const exportLogs = () => {
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-debug-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const logCounts = {
    all: parsedLogs.length,
    success: parsedLogs.filter(l => l.type === 'success').length,
    error: parsedLogs.filter(l => l.type === 'error').length,
    warning: parsedLogs.filter(l => l.type === 'warning').length,
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Logs de Debug
            {logs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {logs.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(['all', 'success', 'error', 'warning'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className={cn(
                    "h-7 px-2 text-xs",
                    filter === type && "bg-aurora-primary hover:bg-aurora-primary-dark"
                  )}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {type === 'all' ? 'Todos' : type}
                  {logCounts[type] > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {logCounts[type]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
            
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
                  className="h-7 px-2 text-xs hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">
              {logs.length === 0 ? 'Os logs aparecerão aqui...' : 'Nenhum log corresponde ao filtro selecionado'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-xs text-slate-500 font-mono min-w-[60px]">
                    {log.timestamp}
                  </span>
                  <span className="text-sm">
                    {getLogIcon(log.type)}
                  </span>
                  <span className={cn("text-sm font-mono flex-1", getLogColor(log.type))}>
                    {log.message.replace(/^[✅❌⚠️ℹ️]\s*/, '')}
                  </span>
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