import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessBlockedProps {
  feature: 'solutions' | 'tools' | 'learning' | 'benefits' | 'networking' | 'events';
  title?: string;
  description?: string;
  upgradeMessage?: string;
  className?: string;
}

const FEATURE_CONFIG = {
  solutions: {
    icon: Shield,
    title: 'Acesso às Soluções Restrito',
    description: 'Você não tem permissão para acessar o catálogo de soluções.',
    upgradeMessage: 'Entre em contato com o administrador para solicitar acesso às soluções.',
    color: 'text-operational',
    bgColor: 'bg-operational/5',
    borderColor: 'border-operational/20'
  },
  tools: {
    icon: Crown,
    title: 'Ferramentas Premium',
    description: 'Esta funcionalidade requer acesso premium.',
    upgradeMessage: 'Faça upgrade do seu plano para acessar todas as ferramentas.',
    color: 'text-viverblue',
    bgColor: 'bg-viverblue/5',
    borderColor: 'border-viverblue/20'
  },
  learning: {
    icon: Shield,
    title: 'Área de Aprendizado Restrita',
    description: 'Você não tem permissão para acessar os cursos.',
    upgradeMessage: 'Entre em contato com o administrador para solicitar acesso.',
    color: 'text-strategy',
    bgColor: 'bg-strategy/5',
    borderColor: 'border-strategy/20'
  },
  benefits: {
    icon: Crown,
    title: 'Benefícios Exclusivos',
    description: 'Esta área contém benefícios exclusivos para membros premium.',
    upgradeMessage: 'Solicite acesso aos benefícios através do administrador.',
    color: 'text-revenue',
    bgColor: 'bg-revenue/5',
    borderColor: 'border-revenue/20'
  },
  networking: {
    icon: Lock,
    title: 'Networking Restrito',
    description: 'Você não tem permissão para acessar a área de networking.',
    upgradeMessage: 'Entre em contato para liberar acesso ao networking.',
    color: 'text-aurora',
    bgColor: 'bg-aurora/5',
    borderColor: 'border-aurora/20'
  },
  events: {
    icon: Lock,
    title: 'Eventos Restritos',
    description: 'Você não tem permissão para visualizar os eventos.',
    upgradeMessage: 'Solicite acesso aos eventos através do administrador.',
    color: 'text-operational',
    bgColor: 'bg-operational/5',
    borderColor: 'border-operational/20'
  }
};

export const AccessBlocked: React.FC<AccessBlockedProps> = ({
  feature,
  title,
  description,
  upgradeMessage,
  className = ''
}) => {
  const config = FEATURE_CONFIG[feature];
  const Icon = config.icon;

  return (
    <div className={`flex items-center justify-center min-h-feature-block p-4 ${className}`}>
      <Card className={`max-w-md w-full ${config.bgColor} ${config.borderColor} border-2`}>
        <CardHeader className="text-center">
          <div className={`mx-auto p-3 rounded-full ${config.bgColor} w-fit mb-4`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          <CardTitle className={`text-xl ${config.color}`}>
            {title || config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={`${config.borderColor} ${config.bgColor}`}>
            <AlertDescription className="text-center text-muted-foreground">
              {description || config.description}
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {upgradeMessage || config.upgradeMessage}
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                className={`${config.color} ${config.borderColor} hover:${config.bgColor}`}
                onClick={() => window.open('mailto:contato@viverdeia.ai?subject=Solicitação de Acesso', '_blank')}
              >
                Solicitar Acesso
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};