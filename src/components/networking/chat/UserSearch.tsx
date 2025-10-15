import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface UserSearchProps {
  onSelectUser: (user: {
    id: string;
    name: string;
    avatar_url: string | null;
    company_name: string | null;
  }) => void;
  onClose: () => void;
}

export const UserSearch = ({ onSelectUser, onClose }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['user-search-connections', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Buscar apenas usuários que são conexões aceitas
      const { data, error } = await supabase
        .from('member_connections')
        .select(`
          requester:profiles!member_connections_requester_id_fkey(
            id, name, avatar_url, company_name, current_position
          ),
          recipient:profiles!member_connections_recipient_id_fkey(
            id, name, avatar_url, company_name, current_position
          )
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) throw error;

      // Mapear para pegar o outro usuário da conexão
      const connections = (data || []).map((conn: any) => {
        const isRequester = conn.requester?.id === user.id;
        return isRequester ? conn.recipient : conn.requester;
      }).filter(Boolean);

      // Filtrar por busca
      const filtered = connections.filter((u: any) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return filtered.slice(0, 10);
    },
    enabled: searchQuery.length >= 2,
  });

  return (
    <div className="border-b border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Nova Conversa</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar conexões..."
          className="pl-10"
          autoFocus
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Você só pode conversar com suas conexões aceitas
      </p>

      {searchQuery.length >= 2 && (
        <ScrollArea className="max-h-64">
          <div className="space-y-1">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Buscando...
              </p>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum membro encontrado
              </p>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={user.avatar_url || ''}
                      alt={user.name || 'Usuário'}
                    />
                    <AvatarFallback>
                      {(user.name || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name || 'Usuário'}</p>
                    {user.company_name && (
                      <p className="text-sm text-muted-foreground truncate">
                        {user.company_name}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
