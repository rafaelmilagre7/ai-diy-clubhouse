
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Briefcase, UserPlus, UserCheck } from 'lucide-react';
import { Profile } from '@/types/forumTypes';

interface MemberCardProps {
  member: Profile;
  onConnect?: (memberId: string) => void;
  isConnected?: boolean;
}

export const MemberCard = ({ member, onConnect, isConnected = false }: MemberCardProps) => {
  const handleConnect = () => {
    if (onConnect && !isConnected) {
      onConnect(member.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar_url || ''} />
            <AvatarFallback className="text-lg">
              {member.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight">{member.name || 'Usuário'}</h3>
            <p className="text-muted-foreground text-sm">
              {member.current_position || 'Profissional'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {member.company_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="truncate">{member.company_name}</span>
            </div>
          )}
          {member.industry && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{member.industry}</span>
            </div>
          )}
        </div>
        
        {member.skills && member.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {member.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {member.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{member.skills.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          {onConnect && (
            <Button 
              className="flex-1" 
              variant={isConnected ? "secondary" : "outline"}
              onClick={handleConnect}
              disabled={isConnected}
            >
              {isConnected ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Conectado
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Conectar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
