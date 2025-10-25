import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import BroadcastForm from "@/components/admin/notifications/BroadcastForm";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminBroadcast() {
  return (
    <AdminLayout>
      <Helmet>
        <title>Broadcast de Notificações | Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Enviar Notificações em Massa</h1>
          <p className="text-muted-foreground mt-2">
            Envie notificações para todos os usuários ou grupos específicos da plataforma
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <BroadcastForm />
          </CardContent>
        </Card>

        {/* Dicas de uso */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">💡 Dicas para Broadcasts Efetivos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use títulos curtos e chamativos (máx. 50 caracteres)</li>
              <li>• Mensagens devem ser claras e diretas ao ponto</li>
              <li>• Adicione uma URL de ação para aumentar engajamento</li>
              <li>• Teste com um grupo pequeno antes de enviar para todos</li>
              <li>• Evite enviar broadcasts muito frequentemente</li>
              <li>• Prioridade alta (5) deve ser usada apenas para urgências</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
