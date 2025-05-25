
import { MemberConnection } from '@/types/forumTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Building2, Briefcase, UserMinus } from 'lucide-react';
import { getInitials } from '@/components/community/utils/membership';

interface ConnectionsTabContentProps {
  connections: any[];
  onRemoveConnection: (connectionId: string) => void;
}

export const ConnectionsTabContent = ({ 
  connections, 
  onRemoveConnection 
}: ConnectionsTabContentProps) => {
  if (connections.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Nenhuma conexão ainda</h3>
        <p className="text-muted-foreground">
          Vá para a seção de membros para se conectar com outros profissionais.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => {
        const member = connection.connection;
        return (
          <Card key={connection.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member?.avatar_url || ''} />
                  <AvatarFallback>
                    {getInitials(member?.name || 'Usuário')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">{member?.name || 'Usuário'}</CardTitle>
                  {member?.current_position && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {member.current_position}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {member?.company_name && (
                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  {member.company_name}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700"
                onClick={() => onRemoveConnection(connection.id)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remover Conexão
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
