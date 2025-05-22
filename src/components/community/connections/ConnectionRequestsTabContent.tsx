
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { ConnectionMember } from '@/types/forumTypes';
import { EmptyTopicsState } from '@/components/community/EmptyTopicsState';
import { getInitials } from './ConnectionCard';

interface ConnectionRequestsTabContentProps {
  requests: ConnectionMember[];
  processingRequests: Set<string>;
  onAccept: (memberId: string) => Promise<boolean | void>;
  onReject: (memberId: string) => Promise<boolean | void>;
  isLoading?: boolean;
}

export const ConnectionRequestsTabContent: React.FC<ConnectionRequestsTabContentProps> = ({
  requests,
  processingRequests,
  onAccept,
  onReject,
  isLoading = false
}) => {
  if (isLoading) {
    return <div className="p-4 text-center">Carregando solicitações recebidas...</div>;
  }

  if (requests.length === 0) {
    return <EmptyTopicsState searchQuery="Você não tem solicitações recebidas" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((member) => (
        <ConnectionRequestCard 
          key={member.id} 
          member={member} 
          isProcessing={processingRequests.has(member.id)}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
};
