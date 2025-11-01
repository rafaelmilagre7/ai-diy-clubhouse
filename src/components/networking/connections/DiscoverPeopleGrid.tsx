import { useDiscoverProfiles } from '@/hooks/networking/useDiscoverProfiles';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionCardSkeleton } from './ConnectionCardSkeleton';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { SearchBar } from './SearchBar';
import { DiscoverHeader } from './DiscoverHeader';
import { PaginationInfo } from './PaginationInfo';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';
import { useConnections } from '@/hooks/networking/useConnections';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const DiscoverPeopleGrid = () => {
  const { user } = useAuth();
  const { 
    data: profiles, 
    isLoading, 
    error, 
    refetch, 
    nextPage, 
    previousPage, 
    hasMore, 
    page,
    isFetching 
  } = useDiscoverProfiles();
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
        <DiscoverHeader totalMembers={0} isLoading={true} />
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
      {/* ✅ UPGRADE: Header premium */}
      <DiscoverHeader 
        totalMembers={profiles?.length || 0} 
        isLoading={isLoading} 
      />

      {/* ✅ UPGRADE: SearchBar com loading state */}
      <SearchBar 
        onSearch={setSearchQuery}
        placeholder="Buscar por nome, empresa, cargo ou indústria..."
        isLoading={isFetching}
        resultsCount={filteredProfiles?.length}
      />

      {/* ✅ UPGRADE: Grid com animações */}
      {filteredProfiles && filteredProfiles.length > 0 ? (
        <>
          {/* Overlay de loading durante fetch */}
          <AnimatePresence>
            {isFetching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-aurora/30 border-t-aurora rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Carregando perfis...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <ConnectionCard 
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
              </motion.div>
            ))}
          </motion.div>

          {/* ✅ UPGRADE: Indicador de paginação premium */}
          <PaginationInfo
            currentPage={page}
            hasMore={hasMore}
            totalDisplayed={filteredProfiles.length}
            onPrevious={previousPage}
            onNext={nextPage}
            isFetching={isFetching}
          />
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
          actionLabel={searchQuery ? 'Limpar busca' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      )}
    </div>
  );
};
