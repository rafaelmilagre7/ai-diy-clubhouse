import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate, Link } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { SimpleOnboardingWizard } from '@/components/onboarding/SimpleOnboardingWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const OnboardingPage = () => {
  let user, profile, isLoading;
  
  try {
    ({ user, profile, isLoading } = useAuth());
  } catch (error) {
    // Se o contexto de auth não estiver disponível, permitir visualização sem auth
    console.warn('Auth context não disponível:', error);
    user = null;
    profile = null;
    isLoading = false;
  }

  if (isLoading) {
    return <LoadingScreen message="Carregando seus dados..." />;
  }

  // Se não há usuário, mostrar aviso de que precisa fazer login para salvar
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Banner de aviso */}
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-4 text-center">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ <strong>Você não está logado.</strong> Você pode visualizar o onboarding, mas os dados não serão salvos.{' '}
            <Link to="/login" className="underline font-medium">
              Faça login aqui
            </Link>
          </p>
        </div>
        
        {/* Onboarding */}
        <div className="flex-1">
          <SimpleOnboardingWizard />
        </div>
      </div>
    );
  }

  // Se já completou onboarding, vai para dashboard
  if (profile?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SimpleOnboardingWizard />
  );
};

export default OnboardingPage;