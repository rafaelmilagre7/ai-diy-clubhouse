
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormacaoNovaAula = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/formacao/aulas')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Aulas
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Criar Nova Aula</h1>
        <p className="text-muted-foreground">
          Adicione uma nova aula ao sistema de aprendizagem
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Criação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Formulário de criação de aula será implementado em breve.</p>
            <div className="mt-4">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Salvar Rascunho
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoNovaAula;
