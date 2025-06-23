
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Monitor, Smartphone, Globe, Clock, LogOut } from 'lucide-react';

interface ActiveSession {
  id: string;
  user_id: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  last_activity: string;
  session_duration: string;
  is_current?: boolean;
}

export const ActiveSessions = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados de sessões ativas para demonstração
    const loadActiveSessions = () => {
      const mockSessions: ActiveSession[] = [
        {
          id: 'session-1',
          user_id: 'user-123',
          device_type: 'desktop',
          browser: 'Chrome 120.0',
          location: 'São Paulo, SP',
          last_activity: new Date(Date.now() - 300000).toISOString(),
          session_duration: '2h 30m',
          is_current: true
        },
        {
          id: 'session-2',
          user_id: 'user-456',
          device_type: 'mobile',
          browser: 'Safari Mobile',
          location: 'Rio de Janeiro, RJ',
          last_activity: new Date(Date.now() - 600000).toISOString(),
          session_duration: '45m'
        },
        {
          id: 'session-3',
          user_id: 'user-789',
          device_type: 'desktop',
          browser: 'Firefox 121.0',
          location: 'Belo Horizonte, MG',
          last_activity: new Date(Date.now() - 900000).toISOString(),
          session_duration: '1h 15m'
        }
      ];

      setSessions(mockSessions);
      setLoading(false);
    };

    loadActiveSessions();

    // Atualizar sessões a cada 30 segundos
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'tablet':
        return <Monitor className="h-4 w-4 text-green-500" />;
      case 'desktop':
      default:
        return <Monitor className="h-4 w-4 text-purple-500" />;
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sessões Ativas
          <Badge variant="outline" className="ml-auto">
            {sessions.length} sessões
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão ativa encontrada</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  {getDeviceIcon(session.device_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        ID: {session.user_id.substring(0, 8)}...
                      </p>
                      {session.is_current && (
                        <Badge variant="default" className="text-xs">Atual</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        <span>{session.browser}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{session.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Ativa há {session.session_duration}</span>
                      </div>
                      
                      <div className="text-xs">
                        Última atividade: {new Date(session.last_activity).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
                
                {!session.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                    className="ml-2"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
