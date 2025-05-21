
import { useState } from 'react';
import { useCommunityMembers } from '@/hooks/community/useCommunityMembers';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { MembersFilters } from './MembersFilters';
import { MembersList } from './MembersList';
import { toast } from 'sonner';

export const MembersDirectory = () => {
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

  // Converter connectedMembers em um Set de IDs para verificação mais eficiente
  const connectedMemberIds = new Set(connectedMembers.map(member => member.id));

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

      <MembersList
        members={members}
        isLoading={isLoading || connectionsLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onConnect={handleConnect}
        connectedMembers={connectedMemberIds}
      />
    </div>
  );
};
