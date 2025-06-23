
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Target, Users } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Bem-vindo ao
              <span className="text-viverblue"> Viver IA</span>
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Transforme sua vida e negócio com inteligência artificial
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#1A1E2E]/50 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <Sparkles className="w-12 h-12 text-viverblue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">IA Avançada</h3>
              <p className="text-neutral-300">
                Aprenda a usar ferramentas de IA para maximizar seus resultados
              </p>
            </div>
            
            <div className="bg-[#1A1E2E]/50 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <Target className="w-12 h-12 text-viverblue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Soluções Práticas</h3>
              <p className="text-neutral-300">
                Implemente estratégias comprovadas para o seu negócio
              </p>
            </div>
            
            <div className="bg-[#1A1E2E]/50 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <Users className="w-12 h-12 text-viverblue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Comunidade</h3>
              <p className="text-neutral-300">
                Conecte-se com outros membros e compartilhe experiências
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate('/login')}
              className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 text-lg"
            >
              Entrar na Plataforma
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-neutral-400">
              Não tem conta? O acesso é feito por convite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
