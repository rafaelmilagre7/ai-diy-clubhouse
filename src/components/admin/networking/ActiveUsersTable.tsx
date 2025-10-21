import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ActiveUsersTable = () => {
  const { data: activeUsers, isLoading } = useQuery({
    queryKey: ['admin-active-networking-users'],
    queryFn: async () => {
      // Buscar usuários com mais conexões
      const { data: connections } = await supabase
        .from('member_connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted');

      // Contar conexões por usuário
      const userConnections = new Map<string, number>();
      connections?.forEach(conn => {
        userConnections.set(conn.requester_id, (userConnections.get(conn.requester_id) || 0) + 1);
        userConnections.set(conn.recipient_id, (userConnections.get(conn.recipient_id) || 0) + 1);
      });

      // Pegar top 20 usuários
      const topUserIds = Array.from(userConnections.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([userId]) => userId);

      if (topUserIds.length === 0) return [];

      // Buscar dados dos usuários
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url, company_name, current_position')
        .in('id', topUserIds);

      return users?.map(user => ({
        ...user,
        connections: userConnections.get(user.id) || 0,
      })).sort((a, b) => b.connections - a.connections) || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const columns = [
    {
      key: 'name',
      label: 'Usuário',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={item.avatar_url} />
            <AvatarFallback>{item.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'company_name',
      label: 'Empresa',
      sortable: true,
    },
    {
      key: 'current_position',
      label: 'Cargo',
      render: (item: any) => (
        <span className="text-sm">{item.current_position || 'N/A'}</span>
      ),
    },
    {
      key: 'connections',
      label: 'Conexões',
      sortable: true,
      render: (item: any) => (
        <Badge variant="default">{item.connections}</Badge>
      ),
    },
  ];

  return (
    <AdminTable
      data={activeUsers || []}
      columns={columns}
      loading={isLoading}
      emptyState={<p className="text-muted-foreground">Nenhum usuário ativo encontrado</p>}
    />
  );
};
