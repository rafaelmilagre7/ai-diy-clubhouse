
import React from 'react';
import { PendingConnectionCard } from './PendingConnectionCard';
import { EmptyTopicsState } from '@/components/community/EmptyTopicsState';
import { ConnectionMember } from '@/types/forumTypes';

interface PendingConnectionsTabContentProps {
  pendingConnections: ConnectionMember[];
  isLoading?: boolean;
}

export const PendingConnectionsTabContent: React.FC<PendingConnectionsTabContentProps> = ({ 
  pendingConnections,
  isLoading = false
}) => {
  if (isLoading) {
    return <div className="p-4 text-center">Carregando solicitações pendentes...</div>;
  }

  if (pendingConnections.length === 0) {
    return <EmptyTopicsState searchQuery="Você não tem solicitações pendentes" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pendingConnections.map((member) => (
        <PendingConnectionCard key={member.id} member={member} />
      ))}
    </div>
  );
};
