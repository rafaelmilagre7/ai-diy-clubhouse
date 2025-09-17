import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Search, User, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  isAdmin: boolean;
  hasAccess: boolean;
  reason: string;
  eventTitle: string;
  allowedRoles: string[];
  timestamp: string;
}

export const EventPermissionTester = () => {
  const [userEmail, setUserEmail] = useState('');
  const [eventId, setEventId] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testPermission = async () => {
    if (!userEmail.trim() || !eventId.trim()) {
      toast.error('Preencha email do usuário e ID do evento');
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          role_id,
          user_roles:role_id (
            name,
            description
          )
        `)
        .eq('email', userEmail.trim())
        .single();

      if (userError || !userData) {
        toast.error('Usuário não encontrado');
        return;
      }

      // Buscar dados do evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId.trim())
        .single();

      if (eventError || !eventData) {
        toast.error('Evento não encontrado');
        return;
      }

      // Verificar se é admin
      const isAdmin = (userData.user_roles as any)?.name === 'admin';

      // Buscar controle de acesso do evento
      const { data: accessControl, error: accessError } = await supabase
        .from('event_access_control')
        .select(`
          role_id,
          user_roles:role_id (
            name
          )
        `)
        .eq('event_id', eventId.trim());

      if (accessError) {
        console.error('Erro ao buscar controle de acesso:', accessError);
      }

      const allowedRoles = accessControl?.map(ac => (ac.user_roles as any)?.name || 'Role desconhecido') || [];
      
      // Determinar acesso
      let hasAccess = false;
      let reason = '';

      if (isAdmin) {
        hasAccess = true;
        reason = 'Usuário é administrador (acesso total)';
      } else if (!accessControl || accessControl.length === 0) {
        hasAccess = true;
        reason = 'Evento público (sem restrições de acesso)';
      } else {
        const allowedRoleIds = accessControl.map(ac => ac.role_id);
        hasAccess = userData.role_id ? allowedRoleIds.includes(userData.role_id) : false;
        reason = hasAccess 
          ? `Role "${(userData.user_roles as any)?.name}" está na lista permitida`
          : `Role "${(userData.user_roles as any)?.name}" NÃO está na lista permitida`;
      }

      const testResult: TestResult = {
        userId: userData.id,
        userEmail: userData.email,
        userName: userData.name || 'Nome não informado',
        userRole: (userData.user_roles as any)?.name || 'Role não encontrado',
        isAdmin,
        hasAccess,
        reason,
        eventTitle: eventData.title,
        allowedRoles,
        timestamp: new Date().toISOString()
      };

      setResult(testResult);
      
      // Log para auditoria
      console.log('[🧪 EventPermissionTester] Teste realizado:', testResult);

    } catch (error) {
      console.error('Erro ao testar permissão:', error);
      toast.error('Erro ao testar permissão');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Testador de Permissões de Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email do Usuário</label>
            <Input
              placeholder="usuario@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">ID do Evento</label>
            <Input
              placeholder="UUID do evento"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={testPermission} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testando...' : 'Testar Permissão'}
        </Button>

        {result && (
          <Card className={`border-2 ${result.hasAccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {result.hasAccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                {result.hasAccess ? 'ACESSO PERMITIDO' : 'ACESSO NEGADO'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informações do Usuário
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nome:</strong> {result.userName}</p>
                    <p><strong>Email:</strong> {result.userEmail}</p>
                    <p><strong>Role:</strong> 
                      <Badge variant={result.isAdmin ? 'destructive' : 'secondary'} className="ml-2">
                        {result.userRole}
                      </Badge>
                      {result.isAdmin && (
                        <Badge variant="destructive" className="ml-1">
                          <Shield className="w-3 h-3 mr-1" />
                          ADMIN
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Informações do Evento</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Título:</strong> {result.eventTitle}</p>
                    <p><strong>Roles Permitidos:</strong></p>
                    {result.allowedRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {result.allowedRoles.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Evento Público
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Resultado da Análise
                </h4>
                <p className={`text-sm p-3 rounded ${result.hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {result.reason}
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Teste realizado em: {new Date(result.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};