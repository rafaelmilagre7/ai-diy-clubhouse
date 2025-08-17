import React from 'react';
import { Sparkles, Brain, Users2, Rocket } from 'lucide-react';

interface InviteWelcomeSectionProps {
  inviteData: {
    email: string;
    role?: {
      name: string;
    };
  };
}

const InviteWelcomeSection: React.FC<InviteWelcomeSectionProps> = ({ inviteData }) => {
  const benefits = [
    {
      icon: Brain,
      title: "Inteligência Artificial Aplicada",
      description: "Aprenda a implementar IA que gera resultados reais no seu negócio"
    },
    {
      icon: Users2,
      title: "Comunidade de Líderes",
      description: "Conecte-se com empresários que já transformaram seus negócios com IA"
    },
    {
      icon: Rocket,
      title: "Aceleração Garantida",
      description: "Metodologia comprovada para escalar seu negócio com tecnologia"
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-center space-y-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl -z-10 animate-pulse animation-delay-2000" />

      {/* Logo Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
          <svg viewBox="0 0 100 100" className="w-12 h-12 text-white">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <text x="50" y="60" textAnchor="middle" fontSize="24" fontWeight="bold" fill="url(#logoGradient)">
              VIVER
            </text>
            <text x="50" y="80" textAnchor="middle" fontSize="16" fontWeight="normal" fill="url(#logoGradient)">
              DE IA
            </text>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/30 rounded-full text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Convite Exclusivo
        </div>
        
        <div className="space-y-6">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight">
            Transforme seu negócio
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              com Inteligência Artificial
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light">
            Você foi convidado para a comunidade mais exclusiva de empreendedores 
            que estão revolucionando seus negócios com IA.
          </p>
        </div>

        {/* Invite Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <p className="text-sm font-semibold text-white/90">Acesso liberado para:</p>
          </div>
          <p className="font-bold text-2xl text-white mb-4">{inviteData.email}</p>
          {inviteData.role && (
            <div className="inline-flex px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
              <p className="text-sm font-medium text-primary">
                {inviteData.role.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-white">{benefit.title}</h3>
              <p className="text-white/70 leading-relaxed">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">500+</div>
            <div className="text-sm font-medium text-white/70">Empresários na comunidade</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">300%</div>
            <div className="text-sm font-medium text-white/70">Crescimento médio dos membros</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">30 dias</div>
            <div className="text-sm font-medium text-white/70">Para os primeiros resultados</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteWelcomeSection;