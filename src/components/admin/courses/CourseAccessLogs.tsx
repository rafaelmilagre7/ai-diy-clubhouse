
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shield, Clock, User, AlertCircle, CheckCircle, Search, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AccessLog {
  id: string;
  user_id: string;
  event_type: string;
  event_data: {
    course_id: string;
    lesson_id?: string;
    attempt_type: string;
    success: boolean;
    user_role: string;
    error_message?: string;
    timestamp: string;
    user_agent?: string;
  };
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

interface CourseAccessLogsProps {
  courseId?: string;
}

export const CourseAccessLogs: React.FC<CourseAccessLogsProps> = ({ courseId }) => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSuccess, setFilterSuccess] = useState<string>("all");

  useEffect(() => {
    loadLogs();
  }, [courseId]);

  const loadLogs = async () => {
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
          profiles:user_id (
            name,
            email
          )
        `)
        .like('event_type', 'learning_%')
        .order('created_at', { ascending: false })
        .limit(100);

      if (courseId) {
        query = query.eq('event_data->>course_id', courseId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_data.error_message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || log.event_data.attempt_type === filterType;
    
    const matchesSuccess = filterSuccess === "all" || 
      (filterSuccess === "success" && log.event_data.success) ||
      (filterSuccess === "denied" && !log.event_data.success);

    return matchesSearch && matchesType && matchesSuccess;
  });

  const exportLogs = () => {
    const csvContent = [
      ['Data', 'Usuário', 'Email', 'Tipo', 'Sucesso', 'Papel', 'Erro'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        log.profiles?.name || 'N/A',
        log.profiles?.email || 'N/A',
        log.event_data.attempt_type,
        log.event_data.success ? 'Sim' : 'Não',
        log.event_data.user_role || 'N/A',
        log.event_data.error_message || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `access-logs-${courseId || 'all'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logs de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Logs de Acesso
          <Badge variant="secondary" className="ml-auto">
            {filteredLogs.length} registros
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por usuário ou erro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de acesso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="course_access">Acesso a curso</SelectItem>
              <SelectItem value="lesson_access">Acesso a aula</SelectItem>
              <SelectItem value="resource_access">Acesso a recurso</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterSuccess} onValueChange={setFilterSuccess}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="denied">Negado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportLogs} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Tabela de logs */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">
                            {log.profiles?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.profiles?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.event_data.attempt_type?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {log.event_data.success ? (
                        <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          Permitido
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Negado
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {log.event_data.user_role || 'N/A'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="max-w-xs">
                      {log.event_data.error_message && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {log.event_data.error_message}
                        </div>
                      )}
                      {log.event_data.lesson_id && (
                        <div className="text-xs text-muted-foreground">
                          Aula: {log.event_data.lesson_id.slice(0, 8)}...
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
