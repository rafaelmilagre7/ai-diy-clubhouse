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
      description: "Transforme sua empresa com soluções de inteligência artificial"
    },
    {
      icon: Users,
      title: "Comunidade Expert",
      description: "Conecte-se com outros profissionais e especialistas"
    },
    {
      icon: Zap,
      title: "Implementação Rápida",
      description: "Soluções práticas que geram resultados imediatos"
    },
    {
      icon: Target,
      title: "Resultados Garantidos",
      description: "Metodologias comprovadas para maximizar seus lucros"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          Convite Especial
        </div>
        
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
          Bem-vindo ao futuro dos negócios
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Você foi convidado para fazer parte da comunidade mais inovadora de IA empresarial do Brasil
        </p>

        <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-2">Convite para:</p>
          <p className="font-semibold text-lg text-primary">{inviteData.email}</p>
          {inviteData.role && (
            <p className="text-sm text-muted-foreground mt-2">
              Função: <span className="text-foreground font-medium">{inviteData.role.name}</span>
            </p>
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
      <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Empresas Transformadas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">Taxa de Sucesso</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">2M+</div>
            <div className="text-muted-foreground">Em Receita Gerada</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteWelcomeSection;