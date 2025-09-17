import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserWithAccess {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

interface EventAccessPreviewProps {
  selectedRoles: string[];
  eventId?: string;
}

export const EventAccessPreview = ({ selectedRoles, eventId }: EventAccessPreviewProps) => {
  const [usersWithAccess, setUsersWithAccess] = useState<UserWithAccess[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loadUsersWithAccess = async () => {
    if (selectedRoles.length === 0 && !showPreview) return;

    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role_id,
          user_roles:role_id (
            name,
            description
          )
        `);

      // Se não há roles selecionados, evento é público (todos têm acesso)
      if (selectedRoles.length > 0) {
        query = query.in('role_id', selectedRoles);
      }

      const { data: users, error } = await query;

      if (error) {
        console.error('Erro ao buscar usuários com acesso:', error);
        return;
      }

      // Adicionar admins (sempre têm acesso)
      const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role_id,
          user_roles:role_id (
            name,
            description
          )
        `)
        .eq('user_roles.name', 'admin');

      if (adminError) {
        console.error('Erro ao buscar admins:', adminError);
      }

      // Combinar usuários evitando duplicatas
      const allUsers = [...(users || [])];
      if (admins) {
        admins.forEach(admin => {
          if (!allUsers.find(u => u.id === admin.id)) {
            allUsers.push(admin);
          }
        });
      }

      const formattedUsers: UserWithAccess[] = allUsers.map(user => ({
        id: user.id,
        name: user.name || 'Nome não informado',
        email: user.email,
        role: (user.user_roles as any)?.name || 'Role não encontrado',
        isAdmin: (user.user_roles as any)?.name === 'admin'
      }));

      setUsersWithAccess(formattedUsers);

      // Buscar total de usuários na plataforma
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setTotalUsers(count || 0);

    } catch (error) {
      console.error('Erro ao carregar preview de acesso:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPreview) {
      loadUsersWithAccess();
    }
  }, [selectedRoles, showPreview]);

  const isPublicEvent = selectedRoles.length === 0;
  const accessPercentage = totalUsers > 0 ? Math.round((usersWithAccess.length / totalUsers) * 100) : 0;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview de Acesso
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            disabled={loading}
          >
            {showPreview ? 'Ocultar' : 'Mostrar'} Preview
          </Button>
        </CardTitle>
      </CardHeader>
      
      {showPreview && (
        <CardContent>
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {isPublicEvent ? totalUsers : usersWithAccess.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Usuários com acesso
                </div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {isPublicEvent ? '100%' : `${accessPercentage}%`}
                </div>
                <div className="text-sm text-muted-foreground">
                  Da base de usuários
                </div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {selectedRoles.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Roles selecionados
                </div>
              </div>
            </div>

            {/* Status do Evento */}
            <div className={`p-4 rounded-lg border-2 ${
              isPublicEvent 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-center gap-2 font-semibold mb-2">
                {isPublicEvent ? (
                  <Users className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                {isPublicEvent ? 'Evento Público' : 'Evento Restrito'}
              </div>
              <p className="text-sm">
                {isPublicEvent 
                  ? 'Todos os usuários registrados na plataforma terão acesso a este evento.'
                  : `Apenas usuários com os roles selecionados terão acesso a este evento.`
                }
              </p>
            </div>

            {/* Lista de Usuários (se evento restrito) */}
            {!isPublicEvent && showPreview && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários que terão acesso ({usersWithAccess.length})
                </h4>
                
                {loading ? (
                  <div className="text-center py-4">Carregando usuários...</div>
                ) : usersWithAccess.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {usersWithAccess.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={user.isAdmin ? 'destructive' : 'secondary'}>
                            {user.role}
                          </Badge>
                          {user.isAdmin && (
                            <Badge variant="destructive" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              ADMIN
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>Nenhum usuário encontrado com os roles selecionados</p>
                    <p className="text-sm">Apenas administradores terão acesso</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};