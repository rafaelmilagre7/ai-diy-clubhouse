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
    <div className="relative flex flex-col justify-center space-y-4 h-full">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl -z-10 animate-pulse animation-delay-2000" />

      {/* Logo Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <img
            src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
            alt="VIVER DE IA"
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
          <Sparkles className="h-3 w-3" />
          Convite Exclusivo
        </div>
        
        <div className="space-y-3">
          <h1 className="font-heading text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            A maior plataforma de IA aplicada a negócios do Brasil
          </h1>
          
          <p className="text-sm md:text-base text-white/80 max-w-lg mx-auto leading-relaxed">
            +25 soluções reais e os melhores cursos e formações para você aprender e aplicar IA do zero ao avançado com quem faz na prática.
          </p>
        </div>

        {/* Invite Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 max-w-sm mx-auto shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-xs font-semibold text-white/90">Acesso liberado para:</p>
          </div>
          <p className="font-bold text-base text-white mb-3">{inviteData.email}</p>
          {inviteData.role && (
            <div className="inline-flex px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <p className="text-xs font-medium text-emerald-400">
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