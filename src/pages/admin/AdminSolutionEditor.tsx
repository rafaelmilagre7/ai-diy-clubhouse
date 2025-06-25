
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye, Code, Settings } from 'lucide-react';

const AdminSolutionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/solutions')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Soluções
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editor de Solução #{id}</h1>
            <p className="text-muted-foreground">
              Edite os detalhes e módulos da solução
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input defaultValue="Assistente de IA no WhatsApp" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea 
                  defaultValue="Implemente um assistente de IA completo para WhatsApp que automatiza o atendimento ao cliente."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Input defaultValue="Operacional" />
                </div>
                <div>
                  <label className="text-sm font-medium">Dificuldade</label>
                  <Input defaultValue="Fácil" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Módulos da Solução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Módulo 1: Configuração Inicial</h4>
                      <p className="text-sm text-muted-foreground">Configurar ambiente e ferramentas</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Módulo 2: API do WhatsApp</h4>
                      <p className="text-sm text-muted-foreground">Integração com WhatsApp Business API</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  + Adicionar Módulo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da Solução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> Publicada</p>
                <p><strong>Criada em:</strong> 10/01/2024</p>
                <p><strong>Última edição:</strong> Hoje</p>
                <p><strong>Visualizações:</strong> 245</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Publicada</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Destaque</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Premium</span>
                <input type="checkbox" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSolutionEditor;
