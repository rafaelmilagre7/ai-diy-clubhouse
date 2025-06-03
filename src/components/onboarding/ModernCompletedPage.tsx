
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

export const ModernCompletedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    // Auto-redirect após 5 segundos
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <div className="p-8 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-1/2 transform translate-x-8 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">
              Parabéns, {profile?.name?.split(' ')[0] || 'Membro'}! 🎉
            </h1>
            <p className="text-xl text-gray-300">
              Seu onboarding foi concluído com sucesso!
            </p>
          </div>

          <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-viverblue">
              O que acontece agora?
            </h3>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-viverblue rounded-full"></div>
                Acesso completo à plataforma Viver de IA
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-viverblue rounded-full"></div>
                Trilha de implementação personalizada
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-viverblue rounded-full"></div>
                Comunidade exclusiva de empreendedores
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-viverblue rounded-full"></div>
                Ferramentas e recursos de IA
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleGoToDashboard}
              size="lg"
              className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2"
            >
              <span>Ir para o Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Redirecionamento automático em 5 segundos...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
