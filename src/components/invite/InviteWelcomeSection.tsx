import React from 'react';
import { Sparkles, Users, Zap, Target } from 'lucide-react';

interface InviteWelcomeSectionProps {
  inviteData: {
    email: string;
    role?: {
      name: string;
    };
  };
}

const InviteWelcomeSection: React.FC<InviteWelcomeSectionProps> = ({ inviteData }) => {
  const features = [
    {
      icon: Sparkles,
      title: "IA Revolucionária",
      description: "Automatize processos e aumente sua receita em até 300% com IA personalizada para seu negócio"
    },
    {
      icon: Users,
      title: "Rede Exclusiva",
      description: "Acesso direto a CEOs, especialistas e líderes que já implementaram IA com sucesso"
    },
    {
      icon: Zap,
      title: "Resultados em 30 dias",
      description: "Metodologia comprovada para implementar IA e ver resultados práticos no primeiro mês"
    },
    {
      icon: Target,
      title: "ROI Garantido",
      description: "Acompanhamento personalizado até você alcançar o retorno esperado do investimento"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <img 
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
          alt="VIVER DE IA Club"
          className="w-32 h-auto mx-auto mb-6"
        />
      </div>

      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-full text-sm font-semibold text-primary mb-6 animate-pulse">
          <Sparkles className="h-4 w-4" />
          Convite Exclusivo
        </div>
        
        <h1 className="font-heading text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6 leading-tight">
          Transforme sua empresa com IA
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Você recebeu um convite exclusivo para entrar na <span className="text-primary font-semibold">comunidade líder em IA empresarial</span> e acelerar seus resultados
        </p>

        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20 rounded-xl p-6 max-w-md mx-auto shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-primary">Convite ativo para:</p>
          </div>
          <p className="font-bold text-xl text-foreground">{inviteData.email}</p>
          {inviteData.role && (
            <div className="mt-3 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full inline-block">
              <p className="text-sm font-medium text-primary">
                {inviteData.role.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group bg-card border border-border rounded-lg p-6 hover:bg-accent transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl p-8 shadow-xl">
        <h3 className="text-center text-lg font-semibold text-foreground mb-6">
          Por que escolher nossa comunidade:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">300+</div>
            <div className="text-sm font-medium text-muted-foreground">Empresas transformadas</div>
            <div className="text-xs text-muted-foreground">Confiança comprovada</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">+Eficiência</div>
            <div className="text-sm font-medium text-muted-foreground">Aumento de eficiência operacional</div>
            <div className="text-xs text-muted-foreground">Processos automatizados</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Escale</div>
            <div className="text-sm font-medium text-muted-foreground">Escale sua empresa sem precisar</div>
            <div className="text-xs text-muted-foreground">escalar pessoas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteWelcomeSection;