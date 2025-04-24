
import React from 'react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from '@/types/onboarding';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewStepProps {
  data: OnboardingData | null;
  onComplete: () => Promise<boolean>;
  isSaving: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onComplete, isSaving }) => {
  const navigate = useNavigate();

  const handleComplete = async () => {
    await onComplete();
  };

  if (!data) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Informações básicas de contato</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Nome:</dt>
                <dd>{data.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Email:</dt>
                <dd>{data.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Telefone:</dt>
                <dd>{data.ddi} {data.phone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Profissionais</CardTitle>
            <CardDescription>Informações sobre sua empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Empresa:</dt>
                <dd>{data.company_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Cargo:</dt>
                <dd>{data.current_position}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Setor:</dt>
                <dd>{data.company_sector}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contexto do Negócio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{data.business_model}</p>
          {data.business_challenges && data.business_challenges.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium">Principais desafios:</h4>
              <ul className="list-disc pl-5 mt-2">
                {data.business_challenges.map((challenge, index) => (
                  <li key={index}>{challenge}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-[#0ABAB5]/10 p-6 rounded-lg border border-[#0ABAB5]/20">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-[#0ABAB5]" />
          <h3 className="text-lg font-medium">Todas as etapas concluídas!</h3>
        </div>
        <p className="text-center mt-2 text-gray-400">
          Agora você pode finalizar seu onboarding e começar a usar a plataforma. 
          Você poderá editar suas informações posteriormente.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate('/onboarding/complementary')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        
        <Button 
          onClick={handleComplete} 
          disabled={isSaving}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSaving ? (
            "Finalizando..."
          ) : (
            "Finalizar Onboarding"
          )}
        </Button>
      </div>
    </div>
  );
};
