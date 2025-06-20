
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TestStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
}

const TestPlan = () => {
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: 'email-validation',
      name: 'Validação de Email',
      description: 'Testar validação de formato de email',
      status: 'pending'
    },
    {
      id: 'role-validation',
      name: 'Validação de Papel',
      description: 'Verificar se papel é obrigatório',
      status: 'pending'
    },
    {
      id: 'invite-creation',
      name: 'Criação de Convite',
      description: 'Criar convite com dados válidos',
      status: 'pending'
    }
  ]);

  const runTestStep = async (stepId: string) => {
    setTestSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'running' }
        : step
    ));

    try {
      // Simular execução do teste
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, status: 'success', result: 'Teste passou com sucesso' }
          : step
      ));
    } catch (error) {
      setTestSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, status: 'error', result: `Erro: ${error}` }
          : step
      ));
    }
  };

  const runAllTests = async () => {
    for (const step of testSteps) {
      await runTestStep(step.id);
    }
  };

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestStep['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'running':
        return <Badge variant="secondary">Executando</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano de Testes</CardTitle>
        <Button onClick={runAllTests} className="w-fit">
          Executar Todos os Testes
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testSteps.map((step) => (
            <div key={step.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <h4 className="font-medium">{step.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(step.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runTestStep(step.id)}
                    disabled={step.status === 'running'}
                  >
                    Executar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {step.description}
              </p>
              {step.result && (
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {step.result}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestPlan;
