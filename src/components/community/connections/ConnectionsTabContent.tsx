
import React from 'react';
import { ConnectionCard } from './ConnectionCard';
import { EmptyTopicsState } from '@/components/community/EmptyTopicsState';
import { ConnectionMember } from '@/types/forumTypes';

interface ConnectionsTabContentProps {
  connections: ConnectionMember[];
  onRemoveConnection?: (connectionId: string) => Promise<void>;
}

export const ConnectionsTabContent: React.FC<ConnectionsTabContentProps> = ({ 
  connections, 
  onRemoveConnection 
}) => {
  if (connections.length === 0) {
    return <EmptyTopicsState searchQuery="Você ainda não tem conexões" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((member) => (
        <ConnectionCard 
          key={member.id} 
          member={member} 
          onRemove={onRemoveConnection}
        />
      ))}
    </div>
  );
};
