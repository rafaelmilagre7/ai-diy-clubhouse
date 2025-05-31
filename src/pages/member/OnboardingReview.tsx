
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useOnboardingFinalData } from '@/hooks/onboarding/useOnboardingFinalData';
import { OnboardingSection } from '@/components/profile/onboarding-review/OnboardingSection';
import { PersonalInfoSection } from '@/components/profile/onboarding-review/PersonalInfoSection';
import { LocationInfoSection } from '@/components/profile/onboarding-review/LocationInfoSection';
import { DiscoveryInfoSection } from '@/components/profile/onboarding-review/DiscoveryInfoSection';
import { BusinessInfoSection } from '@/components/profile/onboarding-review/BusinessInfoSection';
import { BusinessContextSection } from '@/components/profile/onboarding-review/BusinessContextSection';
import { GoalsInfoSection } from '@/components/profile/onboarding-review/GoalsInfoSection';
import { AIExperienceSection } from '@/components/profile/onboarding-review/AIExperienceSection';
import { PersonalizationSection } from '@/components/profile/onboarding-review/PersonalizationSection';

const OnboardingReview: React.FC = () => {
  const { data: onboardingData, isLoading, error } = useOnboardingFinalData();

  if (isLoading) {
    return <LoadingScreen message="Carregando dados do onboarding..." />;
  }

  if (error || !onboardingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Dados não encontrados
            </h2>
            <p className="text-gray-300 mb-4">
              Não foram encontrados dados de onboarding para sua conta.
            </p>
            <Link to="/profile">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Revisão do Onboarding</h1>
              <p className="text-gray-300 mt-1">
                Visualize todos os dados enviados durante o processo de onboarding
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            <CheckCircle className="h-4 w-4 mr-2" />
            Concluído
          </Badge>
        </div>

        {/* Status Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-viverblue" />
              Status do Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">100%</div>
                <div className="text-sm text-gray-300">Concluído</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-viverblue">8</div>
                <div className="text-sm text-gray-300">Etapas Finalizadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">✓</div>
                <div className="text-sm text-gray-300">Dados Salvos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seções do Onboarding */}
        <div className="space-y-4">
          <PersonalInfoSection data={onboardingData.personal_info} />
          <LocationInfoSection data={onboardingData.location_info} />
          <DiscoveryInfoSection data={onboardingData.discovery_info} />
          <BusinessInfoSection data={onboardingData.business_info} />
          <BusinessContextSection data={onboardingData.business_context} />
          <GoalsInfoSection data={onboardingData.goals_info} />
          <AIExperienceSection data={onboardingData.ai_experience} />
          <PersonalizationSection data={onboardingData.personalization} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingReview;
