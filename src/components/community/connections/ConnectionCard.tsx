
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, UserMinus, ExternalLink } from 'lucide-react';
import { getInitials } from '@/utils/user';
import { Link } from 'react-router-dom';

interface Member {
  id: string;
  name: string;
  avatar_url?: string;
  company_name?: string;
  current_position?: string;
}

interface ConnectionCardProps {
  member: Member;
  onRemoveConnection: () => void;
  onStartConversation?: (memberId: string) => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  member,
  onRemoveConnection,
  onStartConversation
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-grow">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar_url || undefined} alt={member.name || "Usuário"} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-grow">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">
                {member.current_position || ""}
                {member.current_position && member.company_name && " • "}
                {member.company_name || ""}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartConversation?.(member.id)}
              className="flex items-center space-x-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Mensagem</span>
            </Button>
            
            <Link to={`/comunidade/membro/${member.id}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveConnection}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
