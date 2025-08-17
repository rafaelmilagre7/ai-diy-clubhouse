import React from 'react';
import { Sparkles } from 'lucide-react';

interface InviteWelcomeSectionProps {
  inviteData: {
    email: string;
    role?: {
      name: string;
    };
  };
}

const InviteWelcomeSection: React.FC<InviteWelcomeSectionProps> = ({ inviteData }) => {
  return (
    <div className="relative flex flex-col justify-center space-y-6 py-6">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl -z-10 animate-pulse animation-delay-2000" />

      {/* Logo Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <img
            src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
            alt="VIVER DE IA"
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/30 rounded-full text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Convite Exclusivo
        </div>
        
        <div className="space-y-4">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight">
            A maior plataforma de IA aplicada a negócios do Brasil
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
            +25 soluções reais e os melhores cursos e formações para você aprender e aplicar IA do zero ao avançado com quem faz na prática.
          </p>
        </div>

        {/* Invite Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md mx-auto shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <p className="text-sm font-semibold text-white/90">Acesso liberado para:</p>
          </div>
          <p className="font-bold text-xl text-white mb-4">{inviteData.email}</p>
          {inviteData.role && (
            <div className="inline-flex px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
              <p className="text-sm font-medium text-primary">
                {inviteData.role.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteWelcomeSection;