
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import confetti from 'canvas-confetti';

export const OnboardingCompletedNew: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  React.useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gray-800/50 backdrop-blur-sm p-12 rounded-3xl border border-gray-700/50 shadow-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle className="w-24 h-24 text-green-500" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Onboarding Concluído! 🎉
          </h1>
          
          <p className="text-xl text-gray-300 mb-2">
            Parabéns, {profile?.name || 'empresário'}!
          </p>
          
          <p className="text-gray-400 mb-8 leading-relaxed">
            Seu perfil foi criado com sucesso. Agora você tem acesso completo à plataforma 
            Viver de IA e pode começar sua jornada de transformação digital.
          </p>

          {/* Next Steps */}
          <div className="bg-viverblue/10 border border-viverblue/20 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-viverblue mb-3">
              Próximos passos:
            </h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Sua trilha de implementação personalizada será gerada</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Acesso liberado às soluções e ferramentas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Networking inteligente com outros membros</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Comunidade e eventos exclusivos</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-viverblue to-purple-600 hover:from-viverblue-dark hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            <span>Ir para o Dashboard</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-gray-500 mt-6">
            Bem-vindo à comunidade Viver de IA! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompletedNew;
