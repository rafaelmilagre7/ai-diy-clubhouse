import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Rocket, Users, BookOpen, Calendar, ArrowRight } from 'lucide-react';

interface Step6WelcomeProps {
  ninaMessage?: string;
  onFinish: () => void;
}

export const Step6Welcome: React.FC<Step6WelcomeProps> = ({
  ninaMessage,
  onFinish,
}) => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto text-center">
      <div className="space-y-4">
        <div className="relative">
          <Sparkles className="w-20 h-20 mx-auto text-primary animate-pulse" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-bounce" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Bem-vindo(a) ao Viver de IA!
          </h2>
          <p className="text-xl text-muted-foreground">
            Sua jornada personalizada está pronta para começar
          </p>
        </div>
      </div>

      {ninaMessage && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Mensagem da NINA:</h3>
                <p className="text-muted-foreground leading-relaxed">{ninaMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Conteúdo Personalizado</h3>
            <p className="text-sm text-muted-foreground">
              Acesse materiais e ferramentas selecionados especificamente para seu perfil e objetivos
            </p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Implementação Prática</h3>
            <p className="text-sm text-muted-foreground">
              Guias passo a passo para implementar IA na sua empresa de forma efetiva
            </p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Comunidade Exclusiva</h3>
            <p className="text-sm text-muted-foreground">
              Conecte-se com outros empreendedores e profissionais em jornadas similares
            </p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Acompanhamento Contínuo</h3>
            <p className="text-sm text-muted-foreground">
              A NINA vai te acompanhar com dicas, lembretes e conteúdos no seu ritmo
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Sua experiência personalizada já está configurada. Vamos começar sua transformação digital!
        </p>
      </div>

      <div className="pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Você pode sempre ajustar suas preferências nas configurações da sua conta
        </p>
      </div>
    </div>
  );
};