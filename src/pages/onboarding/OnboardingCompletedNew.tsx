
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OnboardingCompletedNew = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpar backup local após conclusão
    localStorage.removeItem('onboarding-backup');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Onboarding Concluído! 🎉
          </h1>
          <p className="text-gray-400 text-lg">
            Parabéns! Você concluiu seu onboarding na Viver de IA. 
            Agora vamos começar sua jornada de implementação de IA no seu negócio.
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Próximos Passos</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-viverblue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Acesse seu Dashboard</h3>
                <p className="text-gray-400 text-sm">Veja seu progresso e trilha personalizada</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-viverblue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Explore a Comunidade</h3>
                <p className="text-gray-400 text-sm">Conecte-se com outros empresários</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-viverblue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Inicie sua Trilha</h3>
                <p className="text-gray-400 text-sm">Comece a implementar IA no seu negócio</p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2 mx-auto"
          size="lg"
        >
          <span>Ir para Dashboard</span>
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingCompletedNew;
