
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useOnboardingData } from '@/hooks/useOnboardingData';
import { PersonalSection } from '../sections/PersonalSection';
import { BusinessSection } from '../sections/BusinessSection';
import { AIMaturitySection } from '../sections/AIMaturitySection';
import { ObjectivesSection } from '../sections/ObjectivesSection';
import { PreferencesSection } from '../sections/PreferencesSection';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CompleteProfileTabContent = () => {
  const { data, isLoading, error } = useOnboardingData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-high-contrast">Perfil Completo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-dark animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-neutral-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-700 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados do perfil: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-high-contrast mb-2">
            Dados do onboarding não encontrados
          </h3>
          <p className="text-medium-contrast mb-6">
            Parece que você ainda não completou o onboarding ou os dados não estão disponíveis.
          </p>
          <Link to="/onboarding">
            <Button className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Completar Onboarding
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-high-contrast">Perfil Completo</h2>
          <p className="text-medium-contrast text-sm">
            Baseado nas informações coletadas no seu onboarding
          </p>
        </div>
        <Link to="/onboarding">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Atualizar Dados
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalSection data={data} />
        <BusinessSection data={data} />
        <AIMaturitySection data={data} />
        <ObjectivesSection data={data} />
        <PreferencesSection data={data} />
        
        {/* Card de resumo da jornada */}
        <Card className="glass-dark lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-high-contrast mb-4">
              Resumo da Jornada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-viverblue">
                  {data.memberType === 'club' ? 'Club' : 'Formação'}
                </p>
                <p className="text-sm text-medium-contrast">Tipo de Membro</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-viverblue">
                  {data.completedAt ? 
                    new Date(data.completedAt).toLocaleDateString('pt-BR') : 
                    'Em progresso'
                  }
                </p>
                <p className="text-sm text-medium-contrast">Data de Conclusão</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-viverblue">
                  {data.aiKnowledgeLevel ? 
                    (data.aiKnowledgeLevel === 'beginner' ? 'Iniciante' :
                     data.aiKnowledgeLevel === 'intermediate' ? 'Intermediário' :
                     data.aiKnowledgeLevel === 'advanced' ? 'Avançado' : 'Especialista') :
                    'Não definido'
                  }
                </p>
                <p className="text-sm text-medium-contrast">Nível em IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
