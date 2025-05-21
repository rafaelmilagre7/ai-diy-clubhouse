
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionMember } from '@/types/forumTypes';

interface ConnectionCardProps {
  member: ConnectionMember;
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

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ member }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <Link to={`/comunidade/membro/${member.id}`} className="flex items-center space-x-4">
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
      </CardContent>
    </Card>
  );
};
