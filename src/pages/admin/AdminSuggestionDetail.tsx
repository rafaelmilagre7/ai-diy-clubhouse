
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, User, Calendar } from 'lucide-react';

const AdminSuggestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/suggestions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Sugestões
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Detalhes da Sugestão #{id}</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie detalhes da sugestão selecionada
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conteúdo da Sugestão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Implementar nova funcionalidade de dashboard</h3>
                  <p className="text-muted-foreground mt-2">
                    Seria interessante ter um dashboard mais interativo com widgets personalizáveis 
                    para que cada usuário possa configurar as informações que deseja visualizar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comentários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                <p>Sistema de comentários será implementado em breve.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Autor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> João Silva</p>
                <p><strong>Email:</strong> joao@exemplo.com</p>
                <p><strong>Papel:</strong> Membro</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Status da Sugestão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p><strong>Status:</strong> Em Análise</p>
                  <p><strong>Criada em:</strong> 15/01/2024</p>
                  <p><strong>Última atualização:</strong> 20/01/2024</p>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" variant="default">
                    Aprovar Sugestão
                  </Button>
                  <Button className="w-full" variant="outline">
                    Marcar como Em Desenvolvimento
                  </Button>
                  <Button className="w-full" variant="destructive">
                    Rejeitar Sugestão
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSuggestionDetail;
