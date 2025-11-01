import { useDiscoverProfiles } from '@/hooks/networking/useDiscoverProfiles';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionCardSkeleton } from './ConnectionCardSkeleton';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { Compass, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConnections } from '@/hooks/networking/useConnections';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const DiscoverPeopleGrid = () => {
  const { user } = useAuth();
  const { data: profiles, isLoading, error, refetch, nextPage, hasMore, page } = useDiscoverProfiles();
  const [searchQuery, setSearchQuery] = useState('');
  const { sendConnectionRequestAsync } = useConnections();
  const [connectingIds, setConnectingIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const handleConnect = async (profileId: string) => {
    try {
      setConnectingIds(prev => new Set(prev).add(profileId));

      await sendConnectionRequestAsync(profileId);
      
      // Mostrar badge "Solicitação Enviada" por 2 segundos
      setPendingIds(prev => new Set(prev).add(profileId));
      setTimeout(() => {
        setPendingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        
        // Remover card após animação
        const updatedProfiles = profiles?.filter(p => p.id !== profileId);
        queryClient.setQueryData(['discover-profiles', user?.id, page], updatedProfiles);
      }, 2000);
      
      queryClient.invalidateQueries({ queryKey: ['networking-stats'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      
      toast.success('Solicitação enviada!', {
        description: 'Aguarde a resposta do membro'
      });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      console.error('Erro ao conectar:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setConnectingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  // Filtrar perfis baseado na busca
  const filteredProfiles = profiles?.filter(profile => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(query) ||
      profile.company_name?.toLowerCase().includes(query) ||
      profile.current_position?.toLowerCase().includes(query) ||
      profile.industry?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-primary/30">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text-primary">Descobrir Pessoas</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ConnectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={`Erro ao carregar membros: ${error.message}`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-primary/30">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text-primary">Descobrir Pessoas</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredProfiles?.length || 0} {filteredProfiles?.length === 1 ? 'membro' : 'membros'}
            </span>
          </div>
        </div>

        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, empresa, cargo ou indústria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
          />
        </div>
      </div>

      {/* Grid de Perfis */}
      {filteredProfiles && filteredProfiles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <ConnectionCard 
                key={profile.id}
                connection={{
                  id: profile.id,
                  requester_id: '',
                  recipient_id: profile.id,
                  status: 'none' as any,
                  created_at: profile.created_at,
                  updated_at: profile.created_at,
                  recipient: {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    avatar_url: profile.avatar_url,
                    company_name: profile.company_name,
                    current_position: profile.current_position,
                    industry: profile.industry,
                  }
                }}
                variant="discover"
                onConnect={() => handleConnect(profile.id)}
                isConnecting={connectingIds.has(profile.id)}
                showPendingBadge={pendingIds.has(profile.id)}
              />
            ))}
          </div>

          {/* Botão Carregar Mais */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button 
                onClick={nextPage} 
                variant="outline" 
                className="gap-2 hover:bg-aurora/10 hover:border-aurora/40 focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2"
              >
                <Users className="w-4 h-4" />
                Carregar Mais Perfis
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={searchQuery ? Search : Users}
          title={searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum membro disponível'}
          description={
            searchQuery 
              ? 'Tente ajustar sua busca ou explore outros termos'
              : 'Novos membros aparecerão aqui em breve'
          }
        />
      )}
    </div>
  );
};
