
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Calendar, Activity } from 'lucide-react';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Usuários
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Detalhes do Usuário #{id}</h1>
        <p className="text-muted-foreground">
          Informações completas e atividades do usuário
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <p className="text-muted-foreground">João Silva</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">joao@exemplo.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo de Membro</label>
                    <Badge>Club</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant="outline" className="text-green-600">Ativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Concluiu módulo "IA Básica"</span>
                  <span className="text-xs text-muted-foreground">2 dias atrás</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Iniciou solução "WhatsApp Bot"</span>
                  <span className="text-xs text-muted-foreground">5 dias atrás</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Soluções Iniciadas</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Soluções Concluídas</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tempo Total</span>
                  <span className="font-medium">12h 30min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Criado em:</strong> 15/01/2024</p>
                <p><strong>Último acesso:</strong> Hoje</p>
                <p><strong>Onboarding:</strong> Concluído</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
