
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  details: any;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export default function PermissionAuditLogPage() {
  // Substituindo o Helmet pelo hook useDocumentTitle
  useDocumentTitle("Log de Auditoria de Permissões | Admin");
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*, profiles(name, email)")
        .eq("entity_type", "role_permission")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      setAuditLogs(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar logs de auditoria:", err);
      setError(err.message);
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Adicionada</Badge>;
      case "delete":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Removida</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log de Auditoria de Permissões</h1>
        <p className="text-muted-foreground">
          Acompanhe todas as alterações feitas em papéis e permissões do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
          <CardDescription>
            Os 100 registros mais recentes de alterações em permissões e papéis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando logs de auditoria...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
              <p>Ocorreu um erro ao carregar os logs de auditoria.</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro de auditoria encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium">
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{log.profiles?.name || "Usuário desconhecido"}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.profiles?.email || log.user_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        <div>
                          {log.details?.role_name && (
                            <span>
                              Papel: <strong>{log.details.role_name}</strong>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.details?.permission_name && (
                            <span>
                              Permissão: {log.details.permission_name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
