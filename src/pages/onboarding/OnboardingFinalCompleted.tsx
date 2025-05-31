
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardingFinalCompleted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Onboarding Concluído! 🎉
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Perfeito! Agora vamos criar sua trilha personalizada de implementação baseada nas suas respostas.
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Próximos passos:
          </h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-viverblue rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
                1
              </div>
              <div>
                <h3 className="text-white font-medium">Trilha Personalizada</h3>
                <p className="text-gray-400">Vamos gerar sua trilha de implementação baseada no seu perfil</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-viverblue rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
                2
              </div>
              <div>
                <h3 className="text-white font-medium">Explore o Dashboard</h3>
                <p className="text-gray-400">Acesse soluções, cursos e ferramentas personalizadas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-viverblue rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
                3
              </div>
              <div>
                <h3 className="text-white font-medium">Comunidade</h3>
                <p className="text-gray-400">Conecte-se com outros empresários implementando IA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-viverblue hover:bg-viverblue-dark w-full md:w-auto px-8 py-3 text-lg"
          >
            <span>Ir para Dashboard</span>
            <ArrowRight className="ml-2" size={20} />
          </Button>
          
          <div className="text-gray-400 text-sm">
            Bem-vindo à Viver de IA! Estamos animados para ter você conosco.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFinalCompleted;
