import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventPermissionTester } from '@/components/admin/events/debug/EventPermissionTester';
import { EventAuditDashboard } from '@/components/admin/events/debug/EventAuditDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Search, Database } from 'lucide-react';

export default function EventsDebugPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bug className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Debug de Eventos</h1>
      </div>

      <Tabs defaultValue="permission-tester" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="permission-tester" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Testador de Permissões
          </TabsTrigger>
          <TabsTrigger value="audit-dashboard" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Auditoria de Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permission-tester" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como usar o Testador de Permissões</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Email do Usuário:</strong> Digite o email exato do usuário que você quer testar</p>
              <p>• <strong>ID do Evento:</strong> Cole o UUID do evento (você pode encontrar na URL da página de edição do evento)</p>
              <p>• O teste mostrará se o usuário tem acesso e o motivo da decisão</p>
              <p>• Administradores sempre têm acesso total a todos os eventos</p>
              <p>• Eventos sem controle de acesso são públicos (todos têm acesso)</p>
            </CardContent>
          </Card>
          <EventPermissionTester />
        </TabsContent>

        <TabsContent value="audit-dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Auditoria de Dados</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Usuários sem Role:</strong> Usuários que não têm role_id definido</p>
              <p>• <strong>Roles Inexistentes:</strong> Usuários que referenciam roles que não existem mais</p>
              <p>• <strong>Controles Órfãos:</strong> Controles de acesso que referenciam eventos ou roles inexistentes</p>
              <p>• <strong>Severidade Alta:</strong> Problemas que podem impedir o funcionamento correto</p>
              <p>• <strong>Severidade Média:</strong> Problemas que podem causar confusão mas não quebram o sistema</p>
            </CardContent>
          </Card>
          <EventAuditDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}