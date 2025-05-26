
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { ConnectionMember } from '@/types/forumTypes';
import { getInitials } from './ConnectionCard';

interface ConnectionRequestCardProps {
  member: ConnectionMember;
  isProcessing: boolean;
  onAccept: (memberId: string) => Promise<boolean | void>;
  onReject: (memberId: string) => Promise<boolean | void>;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  member,
  isProcessing,
  onAccept,
  onReject
}) => {
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
            
            <div className="flex space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onReject(member.id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-1" />
                    <span>Recusar</span>
                  </>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8"
                onClick={() => onAccept(member.id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    <span>Aceitar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
