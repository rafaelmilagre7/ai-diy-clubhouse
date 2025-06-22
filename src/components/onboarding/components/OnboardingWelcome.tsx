
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, User } from 'lucide-react';

interface OnboardingWelcomeProps {
  userName?: string;
  memberType: 'club' | 'formacao';
  onStart: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  userName,
  memberType,
  onStart
}) => {
  const isFormacao = memberType === 'formacao';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10 text-center">
        <div className="space-y-6">
          {/* Ícone de boas-vindas */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-viverblue" />
            </div>
          </div>

          {/* Mensagem de boas-vindas */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">
              Bem-vindo{userName ? `, ${userName.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-xl text-slate-300">
              Sua conta foi criada com sucesso
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>Cadastro concluído</span>
          </div>

          {/* Descrição do próximo passo */}
          <div className="bg-slate-800/50 p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Próximo passo: Complete seu perfil
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Para personalizar sua experiência na plataforma, vamos completar seu perfil em 
              <span className="font-semibold text-viverblue"> 5 etapas rápidas</span>.
            </p>
            
            <div className="text-sm text-slate-400 space-y-2">
              <p>✅ Informações pessoais</p>
              <p>✅ Perfil empresarial</p>
              <p>✅ Conhecimento em IA</p>
              <p>✅ Objetivos e expectativas</p>
              <p>✅ Personalização da experiência</p>
            </div>

            <p className="text-sm text-slate-400">
              <strong>Tempo estimado:</strong> 3-5 minutos
            </p>
          </div>

          {/* Botão para iniciar */}
          <Button 
            onClick={onStart}
            size="lg"
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
          >
            Começar onboarding
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Mensagem adicional */}
          <p className="text-xs text-slate-400">
            Você pode pausar e retomar o processo a qualquer momento
          </p>
        </div>
      </Card>
    </div>
  );
};
