
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConnectionMember } from '@/types/forumTypes';
import { Trash2 } from 'lucide-react';

interface ConnectionCardProps {
  member: ConnectionMember;
  onRemove?: (connectionId: string) => Promise<void>;
}

export const getInitials = (name: string | null): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ member, onRemove }) => {
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
              {member.industry && (
                <p className="text-xs text-muted-foreground">{member.industry}</p>
              )}
            </div>
          </Link>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(member.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
