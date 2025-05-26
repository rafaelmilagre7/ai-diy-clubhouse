
import { useState } from 'react';
import { useCommunityMembers } from '@/hooks/community/useCommunityMembers';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { MembersFilters } from './MembersFilters';
import { MembersList } from './MembersList';
import { EmptyMembersState } from './EmptyMembersState';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const MembersDirectory = () => {
  const navigate = useNavigate();
  const {
    members,
    isLoading,
    isError,
    totalPages,
    currentPage,
    filters,
    availableIndustries,
    availableRoles,
    handlePageChange,
    handleFilterChange,
    handleRetry
  } = useCommunityMembers();

  const {
    connectedMembers,
    sendConnectionRequest,
    isLoading: connectionsLoading
  } = useNetworkConnections();

  const handleConnect = async (memberId: string) => {
    const success = await sendConnectionRequest(memberId);
    if (success) {
      toast.success("Solicitação de conexão enviada", {
        description: "O membro será notificado sobre seu interesse em conectar.",
      });
    }
  };

  const handleMessage = (memberId: string) => {
    navigate('/comunidade/mensagens', { 
      state: { selectedMemberId: memberId } 
    });
  };

  const handleClearFilters = () => {
    handleFilterChange({
      search: '',
      industry: '',
      role: '',
      availability: ''
    });
  };

  if (isError) {
    return (
      <div className="text-center py-8 space-y-4 border border-red-200 rounded-lg bg-red-50/30 p-6">
        <h3 className="text-xl font-medium mb-2">Erro ao carregar membros</h3>
        <p className="text-muted-foreground mb-2">
          Não foi possível carregar a lista de membros da comunidade.
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const hasFilters = filters.search || filters.industry || filters.role || filters.availability;

  // Converter connectedMembers em um Set de IDs para verificação mais eficiente
  const connectedMemberIds = new Set(connectedMembers.map(member => member.id));

  // Mostrar estado vazio se não há membros e não há filtros ativos
  if (!isLoading && members.length === 0 && !hasFilters) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Diretório de Membros</h2>
          <p className="text-muted-foreground">
            Conecte-se com outros empresários e profissionais da comunidade.
          </p>
        </div>

        <MembersFilters
          onFilterChange={handleFilterChange}
          industries={availableIndustries}
          roles={availableRoles}
          currentFilters={filters}
        />

        <EmptyMembersState hasFilters={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Diretório de Membros</h2>
        <p className="text-muted-foreground">
          Conecte-se com outros empresários e profissionais da comunidade.
        </p>
      </div>

      <MembersFilters
        onFilterChange={handleFilterChange}
        industries={availableIndustries}
        roles={availableRoles}
        currentFilters={filters}
      />

      {!isLoading && members.length === 0 && hasFilters ? (
        <EmptyMembersState 
          hasFilters={true} 
          onClearFilters={handleClearFilters} 
        />
      ) : (
        <MembersList
          members={members}
          isLoading={isLoading || connectionsLoading}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onConnect={handleConnect}
          onMessage={handleMessage}
          connectedMembers={connectedMemberIds}
        />
      )}
    </div>
  );
};
