
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { Search, RefreshCw, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AccessLog {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
  profiles: {
    name: string;
    email: string;
  };
}

export const CourseAccessLogs: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('analytics')
        .select(`
          id,
          user_id,
          event_type,
          event_data,
          created_at,
          profiles!inner(
            name,
            email
          )
        `)
        .or('event_type.ilike.%learning_%,event_type.ilike.%course_%')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar logs:', error);
        toast.error('Erro ao carregar logs de acesso');
        return;
      }

      // Processar os dados para garantir que profiles seja um objeto, não array
      const processedData = data?.map(log => ({
        ...log,
        profiles: Array.isArray(log.profiles) ? log.profiles[0] : log.profiles
      })) || [];

      setLogs(processedData);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      toast.error('Erro ao carregar logs de acesso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter]);

  const filteredLogs = logs.filter(log =>
    log.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.event_data?.course_id?.includes(searchTerm) ||
    log.event_data?.lesson_id?.includes(searchTerm)
  );

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes('success') || eventType.includes('completed')) return 'default';
    if (eventType.includes('denied') || eventType.includes('error')) return 'destructive';
    if (eventType.includes('attempt')) return 'secondary';
    return 'outline';
  };

  const formatEventData = (eventData: any) => {
    if (!eventData) return '-';
    
    const important = [];
    if (eventData.course_id) important.push(`Curso: ${eventData.course_id.slice(-8)}`);
    if (eventData.lesson_id) important.push(`Aula: ${eventData.lesson_id.slice(-8)}`);
    if (eventData.success !== undefined) important.push(`Sucesso: ${eventData.success ? 'Sim' : 'Não'}`);
    if (eventData.error_message) important.push(`Erro: ${eventData.error_message.slice(0, 30)}...`);
    
    return important.join(' | ') || JSON.stringify(eventData).slice(0, 50) + '...';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Logs de Acesso aos Cursos
        </CardTitle>
        <CardDescription>
          Monitoramento de tentativas de acesso a cursos e aulas do sistema de aprendizado
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, curso ou aula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">Todos os Eventos</option>
            <option value="learning_course_access">Acesso a Cursos</option>
            <option value="learning_lesson_access">Acesso a Aulas</option>
            <option value="learning_resource_access">Acesso a Recursos</option>
          </select>
          
          <Button 
            onClick={fetchLogs}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tabela de Logs */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Carregando logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.profiles?.name || 'Nome não disponível'}</div>
                        <div className="text-sm text-muted-foreground">{log.profiles?.email || 'Email não disponível'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEventBadgeVariant(log.event_type)}>
                        {log.event_type.replace('learning_', '').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {formatEventData(log.event_data)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.event_data?.success === true ? (
                        <Badge variant="default">Sucesso</Badge>
                      ) : log.event_data?.success === false ? (
                        <Badge variant="destructive">Falha</Badge>
                      ) : (
                        <Badge variant="secondary">Info</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredLogs.length} de {logs.length} logs
          </div>
        )}
      </CardContent>
    </Card>
  );
};
