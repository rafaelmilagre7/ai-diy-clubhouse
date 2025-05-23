
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConnectionMember } from '@/types/forumTypes';
import { getInitials } from './ConnectionCard';
import { X } from 'lucide-react';

interface PendingConnectionCardProps {
  member: ConnectionMember;
  onCancel?: (recipientId: string) => Promise<void>;
}

export const PendingConnectionCard: React.FC<PendingConnectionCardProps> = ({ member, onCancel }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Link to={`/comunidade/membro/${member.id}`} className="flex items-center space-x-4 flex-grow">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar_url || undefined} alt={member.name || "Usuário"} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">
                {member.current_position || ""}
                {member.current_position && member.company_name && " • "}
                {member.company_name || ""}
              </p>
              <p className="text-xs text-muted-foreground italic">
                Solicitação enviada
              </p>
            </div>
          </Link>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(member.id)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
