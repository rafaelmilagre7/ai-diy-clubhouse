
import { Profile } from '@/types/forumTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';

interface MemberCardProps {
  member: Profile;
  onConnect?: (memberId: string) => void;
  isConnected?: boolean;
}

export const MemberCard = ({ member, onConnect, isConnected = false }: MemberCardProps) => {
  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2 space-y-2 flex items-center">
        <div className="flex items-center space-x-3 w-full">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar_url || ''} alt={member.name || 'Membro'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(member.name || 'Usuário')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{member.name}</h3>
            {member.current_position && (
              <div className="flex items-center text-xs text-muted-foreground gap-1">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{member.current_position}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-1">
        {member.company_name && (
          <div className="flex items-center text-sm gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{member.company_name}</span>
          </div>
        )}
        
        {member.industry && (
          <Badge variant="outline" className="w-fit">
            {member.industry}
          </Badge>
        )}

        <div className="pt-3">
          <Button 
            variant={isConnected ? "secondary" : "default"}
            size="sm"
            className="w-full"
            onClick={() => onConnect?.(member.id)}
            disabled={isConnected}
          >
            {isConnected ? 'Conectado' : 'Conectar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
