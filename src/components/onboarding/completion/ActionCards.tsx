
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ActionCardsProps {
  onGoToTrail: () => void;
  onGoToDashboard: () => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  onGoToTrail,
  onGoToDashboard
}) => {
  const actions = [
    {
      icon: Zap,
      title: 'Iniciar Implementação',
      description: 'Acesse sua trilha personalizada e comece a implementar soluções de IA',
      buttonText: 'Ver Trilha',
      onClick: onGoToTrail,
      variant: 'primary' as const,
      gradient: 'from-viverblue to-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Explorar Dashboard',
      description: 'Monitore seu progresso e explore todas as funcionalidades',
      buttonText: 'Ir para Dashboard',
      onClick: onGoToDashboard,
      variant: 'secondary' as const,
      gradient: 'from-purple-600 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Conectar-se',
      description: 'Participe da comunidade e troque experiências com outros membros',
      buttonText: 'Ver Comunidade',
      onClick: () => window.location.href = '/comunidade',
      variant: 'secondary' as const,
      gradient: 'from-green-600 to-teal-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
          className="group"
        >
          <Card className="glassmorphism border-gray-700/50 hover:border-viverblue/30 transition-all duration-300 h-full group-hover:transform group-hover:scale-105">
            <CardContent className="p-6 flex flex-col h-full">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${action.gradient} mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {action.title}
              </h3>
              
              <p className="text-gray-400 text-sm mb-6 flex-grow">
                {action.description}
              </p>
              
              <Button
                onClick={action.onClick}
                variant={action.variant}
                className={`w-full ${action.variant === 'primary' ? 'bg-viverblue hover:bg-viverblue-dark' : ''}`}
              >
                {action.buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
