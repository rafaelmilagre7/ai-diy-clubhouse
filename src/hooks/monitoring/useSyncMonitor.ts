
import { useCallback, useRef, useState } from 'react';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

export type SyncIssueType = 'cache_miss' | 'sync_delay' | 'conflict' | 'stale_data';
export type SyncIssuePriority = 'low' | 'medium' | 'high';

interface SyncIssue {
  id: string;
  type: SyncIssueType;
  component: string;
  message: string;
  data?: any;
  priority: SyncIssuePriority;
  timestamp: number;
  resolved: boolean;
}

export const useSyncMonitor = () => {
  const { log, logError } = useLogging();
  const [issues, setIssues] = useState<SyncIssue[]>([]);
  const issueCounterRef = useRef(0);

  // Reportar problema de sincronização
  const reportSyncIssue = useCallback((
    type: SyncIssueType,
    component: string,
    message: string,
    data?: any,
    priority: SyncIssuePriority = 'medium'
  ) => {
    const issue: SyncIssue = {
      id: `sync_${++issueCounterRef.current}`,
      type,
      component,
      message,
      data,
      priority,
      timestamp: Date.now(),
      resolved: false
    };

    setIssues(prev => [...prev.slice(-49), issue]); // Manter apenas últimas 50

    // Log baseado na prioridade
    if (priority === 'high') {
      logError(`[SYNC] ${component}: ${message}`, { 
        type, 
        data, 
        showToast: false 
      });
      
      // Mostrar toast apenas para problemas críticos
      toast.error('Problema de sincronização detectado', {
        description: `${component}: ${message}`,
        duration: 5000
      });
    } else {
      log(`[SYNC] ${component}: ${message}`, { type, data, priority });
    }
  }, [log, logError]);

  // Resolver problema
  const resolveIssue = useCallback((issueId: string) => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, resolved: true }
          : issue
      )
    );
  }, []);

  // Obter estatísticas de sincronização
  const getSyncStats = useCallback(() => {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;
    const recentIssues = issues.filter(issue => issue.timestamp > last5Minutes);
    
    return {
      totalIssues: issues.length,
      recentIssues: recentIssues.length,
      unresolvedIssues: issues.filter(issue => !issue.resolved).length,
      highPriorityIssues: issues.filter(issue => issue.priority === 'high' && !issue.resolved).length,
      issuesByType: issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {} as Record<SyncIssueType, number>)
    };
  }, [issues]);

  // Limpar problemas antigos
  const clearOldIssues = useCallback(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    setIssues(prev => prev.filter(issue => 
      issue.timestamp > oneHourAgo || !issue.resolved
    ));
  }, []);

  return {
    reportSyncIssue,
    resolveIssue,
    getSyncStats,
    clearOldIssues,
    issues: issues.filter(issue => !issue.resolved),
    allIssues: issues
  };
};
