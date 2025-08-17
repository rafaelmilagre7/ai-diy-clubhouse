import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Rocket, Users, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
interface Step6WelcomeProps {
  ninaMessage?: string;
  onFinish: () => void;
  userType: 'entrepreneur' | 'learner';
}
export const Step6Welcome: React.FC<Step6WelcomeProps> = ({
  ninaMessage,
  onFinish,
  userType
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const handleFinish = async () => {
    setIsCompleting(true);

    // Lançar confete
    confetti({
      particleCount: 200,
      spread: 70,
      origin: {
        y: 0.6
      }
    });

    // Aguardar um pouco para mostrar o confete
    setTimeout(() => {
      onFinish();
    }, 1000);
  };
  return <div className="space-y-8 max-w-3xl mx-auto text-center">
      <div className="space-y-4">
        
        
        <div className="space-y-2">
          
          
        </div>
      </div>

      {ninaMessage && <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
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
        </Card>}

      <div className="grid md:grid-cols-2 gap-6">
        {userType === 'entrepreneur' ? (
          <>
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
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Cases de Sucesso</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse cases reais de empresas que implementaram IA com sucesso
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Rede de Empreendedores</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com outros empresários implementando IA em seus negócios
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Consultoria Estratégica</h3>
                <p className="text-sm text-muted-foreground">
                  A NINA vai te acompanhar com insights estratégicos para seu negócio
                </p>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Conteúdo Estruturado</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse cursos e materiais organizados do básico ao avançado
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Projetos Práticos</h3>
                <p className="text-sm text-muted-foreground">
                  Aprenda fazendo com projetos guiados e exercícios práticos
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Comunidade de Aprendizado</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com outros estudantes e profissionais de IA
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Mentoria Personalizada</h3>
                <p className="text-sm text-muted-foreground">
                  A NINA vai te guiar com dicas e conteúdos adaptados ao seu ritmo
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          {userType === 'entrepreneur' 
            ? 'Sua jornada empresarial com IA está configurada. Clique em "Concluir" para acessar ferramentas e estratégias personalizadas!'
            : 'Sua jornada de aprendizado está configurada. Clique em "Concluir" para começar seus estudos personalizados!'
          }
        </p>
        
        <motion.div whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
          <Button onClick={handleFinish} disabled={isCompleting} size="lg" className="w-full md:w-auto px-8 py-3 text-lg font-semibold group bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50">
            {isCompleting ? <>
                <CheckCircle className="w-5 h-5 mr-2 animate-spin" />
                Finalizando...
              </> : <>
                ✨ Concluir Onboarding
              </>}
          </Button>
        </motion.div>
      </div>

      <div className="pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Você pode sempre ajustar suas preferências nas configurações da sua conta
        </p>
      </div>
    </div>;
};