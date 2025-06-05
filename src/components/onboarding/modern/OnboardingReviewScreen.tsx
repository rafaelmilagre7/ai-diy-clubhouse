
import React from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, User, Building, Brain, ArrowRight } from 'lucide-react';

interface OnboardingReviewScreenProps {
  data: QuickOnboardingData;
  onEdit: (step: number) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export const OnboardingReviewScreen: React.FC<OnboardingReviewScreenProps> = ({
  data,
  onEdit,
  onContinue,
  isLoading = false
}) => {
  const formatList = (items: string[]) => {
    if (!items || items.length === 0) return 'Não informado';
    return items.join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Revise suas informações
        </h2>
        <p className="text-gray-300 text-lg">
          Confirme se todos os dados estão corretos antes de finalizar
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Dados Pessoais */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-viverblue" />
              <CardTitle className="text-white">Dados Pessoais</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              className="text-gray-400 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Nome:</span>
              <p className="text-white font-medium">{data.personal_info.name || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Email:</span>
              <p className="text-white font-medium">{data.personal_info.email || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">WhatsApp:</span>
              <p className="text-white font-medium">
                {data.personal_info.country_code} {data.personal_info.whatsapp || 'Não informado'}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Como nos conheceu:</span>
              <p className="text-white font-medium">{data.personal_info.how_found_us || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dados Profissionais */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-viverblue" />
              <CardTitle className="text-white">Dados Profissionais</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="text-gray-400 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Empresa:</span>
              <p className="text-white font-medium">{data.professional_info.company_name || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Cargo:</span>
              <p className="text-white font-medium">{data.professional_info.role || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Tamanho da empresa:</span>
              <p className="text-white font-medium">{data.professional_info.company_size || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Segmento:</span>
              <p className="text-white font-medium">{data.professional_info.company_segment || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Principal desafio:</span>
              <p className="text-white font-medium">{data.professional_info.main_challenge || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Experiência com IA */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-viverblue" />
              <CardTitle className="text-white">Experiência com IA</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              className="text-gray-400 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Nível de conhecimento:</span>
              <p className="text-white font-medium">{data.ai_experience.ai_knowledge_level || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Uso atual de IA:</span>
              <p className="text-white font-medium">{data.ai_experience.uses_ai || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Objetivo principal:</span>
              <p className="text-white font-medium">{data.ai_experience.main_goal || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Áreas de interesse:</span>
              <p className="text-white font-medium">{formatList(data.ai_experience.desired_ai_areas)}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Já implementou IA:</span>
              <p className="text-white font-medium">{data.ai_experience.has_implemented || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Continuar */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={onContinue}
          disabled={isLoading}
          className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 text-lg"
        >
          {isLoading ? (
            'Finalizando...'
          ) : (
            <>
              Finalizar Onboarding
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
