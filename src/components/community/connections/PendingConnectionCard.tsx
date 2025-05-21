
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionMember } from '@/types/forumTypes';
import { getInitials } from './ConnectionCard';

interface PendingConnectionCardProps {
  member: ConnectionMember;
}

export const PendingConnectionCard: React.FC<PendingConnectionCardProps> = ({ member }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar_url || undefined} alt={member.name || "Usuário"} />
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-grow">
            <Link to={`/comunidade/membro/${member.id}`} className="font-medium hover:underline">
              {member.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {member.current_position || ""}
              {member.current_position && member.company_name && " • "}
              {member.company_name || ""}
            </p>
            <p className="text-xs text-muted-foreground italic">
              Solicitação enviada
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
