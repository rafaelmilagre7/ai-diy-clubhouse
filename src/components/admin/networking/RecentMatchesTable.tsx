import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnlineIndicator } from "@/components/realtime/OnlineIndicator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const RecentMatchesTable = () => {
  const { data: matches, isLoading } = useQuery({
    queryKey: ['admin-recent-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('network_matches')
        .select(`
          *,
          user_profile:profiles!network_matches_user_id_fkey(id, name, avatar_url, email),
          matched_profile:profiles!network_matches_matched_user_id_fkey(id, name, avatar_url, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pendente" },
      accepted: { variant: "default", label: "Aceito" },
      rejected: { variant: "destructive", label: "Rejeitado" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: 'user',
      label: 'Usuário',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src={item.user_profile?.avatar_url} />
              <AvatarFallback>{item.user_profile?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <OnlineIndicator 
              userId={item.user_profile?.id} 
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border"
              showOffline={false}
            />
          </div>
          <span className="text-sm">{item.user_profile?.name}</span>
        </div>
      ),
    },
    {
      key: 'matched',
      label: 'Match',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src={item.matched_profile?.avatar_url} />
              <AvatarFallback>{item.matched_profile?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <OnlineIndicator 
              userId={item.matched_profile?.id} 
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border"
              showOffline={false}
            />
          </div>
          <span className="text-sm">{item.matched_profile?.name}</span>
        </div>
      ),
    },
    {
      key: 'compatibility_score',
      label: 'Compatibilidade',
      sortable: true,
      render: (item: any) => (
        <Badge variant="outline">
          {((item.compatibility_score || 0) * 100).toFixed(0)}%
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => getStatusBadge(item.status),
    },
    {
      key: 'created_at',
      label: 'Data',
      sortable: true,
      render: (item: any) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      ),
    },
  ];

  return (
    <AdminTable
      data={matches || []}
      columns={columns}
      loading={isLoading}
      emptyState={<p className="text-muted-foreground">Nenhum match encontrado</p>}
    />
  );
};
