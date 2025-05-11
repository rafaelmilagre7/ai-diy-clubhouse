
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  target_user_id?: string;
  role_id?: string;
  role_name?: string;
  permission_id?: string;
  permission_code?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  profile?: {
    name: string;
    email: string;
  };
  target_profile?: {
    name: string;
    email: string;
  };
}

export default function PermissionAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("permission_audit_logs")
        .select(`
          *,
          profile:user_id (name, email),
          target_profile:target_user_id (name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      setLogs(data as AuditLog[]);
    } catch (err: any) {
      console.error("Erro ao buscar logs de auditoria:", err);
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    
    return (
      log.profile?.name?.toLowerCase().includes(searchLower) ||
      log.profile?.email?.toLowerCase().includes(searchLower) ||
      log.target_profile?.name?.toLowerCase().includes(searchLower) ||
      log.target_profile?.email?.toLowerCase().includes(searchLower) ||
      log.action_type.toLowerCase().includes(searchLower) ||
      log.role_name?.toLowerCase().includes(searchLower) ||
      log.permission_code?.toLowerCase().includes(searchLower)
    );
  });

  // Formatar tipo de ação para exibição
  const formatActionType = (actionType: string) => {
    switch (actionType) {
      case "assign_role":
        return "Atribuir papel";
      case "add_permission":
        return "Adicionar permissão";
      case "remove_permission":
        return "Remover permissão";
      case "create_role":
        return "Criar papel";
      case "update_role":
        return "Atualizar papel";
      case "delete_role":
        return "Excluir papel";
      default:
        return actionType;
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", {
      locale: ptBR,
    });
  };

  return (
    <PermissionGuard permission="permissions.view">
      <Helmet>
        <title>Log de Auditoria de Permissões | Admin</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Log de Auditoria de Permissões
            </h1>
            <p className="text-muted-foreground">
              Acompanhe alterações em papéis e permissões no sistema
            </p>
          </div>
          <Button onClick={fetchLogs} variant="outline">
            Atualizar
          </Button>
        </div>

        <div className="w-full flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <Input
            placeholder="Buscar por usuário, papel ou permissão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                Carregando logs de auditoria...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? "Nenhum registro encontrado para a busca realizada."
                  : "Nenhum registro de alteração de permissões encontrado."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Usuário Alvo</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Permissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          {log.profile?.name || log.profile?.email || log.user_id}
                        </TableCell>
                        <TableCell>{formatActionType(log.action_type)}</TableCell>
                        <TableCell>
                          {log.target_profile?.name ||
                            log.target_profile?.email ||
                            log.target_user_id ||
                            "-"}
                        </TableCell>
                        <TableCell>{log.role_name || "-"}</TableCell>
                        <TableCell>{log.permission_code || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
