import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InviteSuccessStateProps {
  userName?: string;
  userEmail?: string;
}

const InviteSuccessState: React.FC<InviteSuccessStateProps> = ({
  userName = "Usuário",
  userEmail
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-scale-in">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
                  <Star className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl font-bold text-foreground">
                Bem-vindo, {userName}!
              </h1>
              <p className="text-primary font-medium">
                Você já está conectado à plataforma
              </p>
              <p className="text-muted-foreground">
                Sua conta está ativa e pronta para uso. Explore todas as funcionalidades disponíveis.
              </p>
            </div>

            {/* User Info */}
            {userEmail && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary font-medium">
                  Logado como: {userEmail}
                </p>
              </div>
            )}

            {/* Features Preview */}
            <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-3">O que você pode fazer agora:</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Acessar soluções exclusivas de IA
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Conectar-se com a comunidade
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Implementar automações práticas
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Participar de eventos exclusivos
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => navigate('/')} 
              className="w-full h-12 font-medium transition-all duration-200 group"
            >
              Começar
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>

            {/* Additional Info */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Primeira vez aqui? Não se preocupe, temos um guia completo para você começar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteSuccessState;