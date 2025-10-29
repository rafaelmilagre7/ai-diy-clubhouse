import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, Users, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { OnboardingSuccess } from '@/components/celebration/OnboardingSuccess';
import { TeamInviteSection } from '@/components/onboarding/TeamInviteSection';

interface Step6WelcomeProps {
  ninaMessage?: string;
  onFinish: () => Promise<boolean>;
  userType: 'entrepreneur' | 'learner';
  userName?: string;
}
export const Step6Welcome: React.FC<Step6WelcomeProps> = ({
  ninaMessage,
  onFinish,
  userType,
  userName = "Usuário"
}) => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTeamInvites, setShowTeamInvites] = useState(false);
  
  const handleContinueToTeamInvites = () => {
    console.log('[STEP6] 🚀 Botão "Continuar" clicado - iniciando finalização');
    // Pular direto para finalização ao invés de mostrar team invites
    handleFinish();
  };

  const handleTeamInvitesComplete = async () => {
    await handleFinish();
  };

  const handleSkipTeamInvites = async () => {
    console.log('[STEP6] 🔥 handleSkipTeamInvites chamado');
    await handleFinish();
  };

  const handleFinish = async () => {
    console.log('[STEP6] 🎯 handleFinish chamado - iniciando processo');
    
    if (isCompleting) {
      console.log('[STEP6] ⚠️ Já está completando, ignorando...');
      return;
    }
    
    setIsCompleting(true);
    
    try {
      console.log('[STEP6] 🔄 Chamando onFinish...');
      const success = await onFinish();
      console.log('[STEP6] 📊 onFinish retornou:', success);
      
      if (success) {
        console.log('[STEP6] ✅ Sucesso! Mostrando animação de celebração');
        setShowSuccess(true);
      } else {
        console.error('[STEP6] ❌ FALHA ao finalizar onboarding');
        alert('Erro ao finalizar onboarding. Por favor, tente novamente.');
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('[STEP6] ❌ ERRO CRÍTICO:', error);
      alert('Erro crítico ao finalizar onboarding');
      setIsCompleting(false);
    }
  };

  const handleSuccessComplete = () => {
    console.log('[STEP6] ✅ Onboarding finalizado - navegando para dashboard');
    
    // CRÍTICO: Marcar no sessionStorage que onboarding acabou de ser completado
    // Isso impede que RootRedirect interfira durante a transição
    sessionStorage.setItem('onboarding_just_completed', 'true');
    console.log('[STEP6] 🚩 Flag "onboarding_just_completed" setada no sessionStorage');
    
    // Usar React Router para navegação suave (sem reload)
    navigate('/dashboard', { replace: true });
    console.log('[STEP6] 🚀 Navegação iniciada via React Router');
  };
  return (
    <>
      {showSuccess && (
        <OnboardingSuccess
          userName={userName}
          userType={userType}
          onComplete={handleSuccessComplete}
        />
      )}

      {showTeamInvites && !showSuccess && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold">👥 Monte Sua Equipe</h2>
            <p className="text-muted-foreground">
              Convide membros para sua equipe agora ou faça isso depois
            </p>
          </div>
          <TeamInviteSection
            onComplete={handleTeamInvitesComplete}
            onSkip={handleSkipTeamInvites}
          />
        </div>
      )}
      
      {!showSuccess && !showTeamInvites && (
        <div className="space-y-8 max-w-3xl mx-auto text-center">
      <div className="space-y-4">
        
        
        <div className="space-y-2">
          
          
        </div>
      </div>

      {ninaMessage && <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Mensagem da NINA:</h3>
                <p className="text-muted-foreground leading-relaxed">{ninaMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>}

      <div className="grid md:grid-cols-2 gap-6">
        {userType === 'entrepreneur' ? (
          <>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Implementação Prática</h3>
                <p className="text-sm text-muted-foreground">
                  Guias passo a passo para implementar IA na sua empresa de forma efetiva
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Cases de Sucesso</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse cases reais de empresas que implementaram IA com sucesso
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Rede de Empreendedores</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com outros empresários implementando IA em seus negócios
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Consultoria Estratégica</h3>
                <p className="text-sm text-muted-foreground">
                  A NINA vai te acompanhar com insights estratégicos para seu negócio
                </p>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Conteúdo Estruturado</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse cursos e materiais organizados do básico ao avançado
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Projetos Práticos</h3>
                <p className="text-sm text-muted-foreground">
                  Aprenda fazendo com projetos guiados e exercícios práticos
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Comunidade de Aprendizado</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com outros estudantes e profissionais de IA
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Mentoria Personalizada</h3>
                <p className="text-sm text-muted-foreground">
                  A NINA vai te guiar com dicas e conteúdos adaptados ao seu ritmo
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          {userType === 'entrepreneur' 
            ? 'Sua jornada empresarial com IA está configurada. Clique em "Concluir" para acessar ferramentas e estratégias personalizadas!'
            : 'Sua jornada de aprendizado está configurada. Clique em "Concluir" para começar seus estudos personalizados!'
          }
        </p>
        
        <motion.div whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
          <Button onClick={handleContinueToTeamInvites} disabled={isCompleting} size="lg" className="w-full md:w-auto px-8 py-3 text-lg font-semibold group bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50">
            {isCompleting ? <>
                <CheckCircle className="w-5 h-5 mr-2 animate-spin" />
                Processando...
              </> : <>
                ✨ Continuar
              </>}
          </Button>
        </motion.div>
      </div>

      <div className="pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Você pode sempre ajustar suas preferências nas configurações da sua conta
        </p>
        </div>
      </div>
      )}
    </>
  );
};