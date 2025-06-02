
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star, Check } from 'lucide-react';
import { usePaymentAccess } from '@/hooks/payments/usePaymentAccess';

interface PaymentRequiredProps {
  courseTitle: string;
  requiredTier: 'premium' | 'enterprise';
  className?: string;
}

export const PaymentRequired: React.FC<PaymentRequiredProps> = ({
  courseTitle,
  requiredTier,
  className
}) => {
  const { paymentStatus, initiatePremiumUpgrade, isLoading } = usePaymentAccess();

  const tierConfig = {
    premium: {
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      name: 'Premium',
      price: 'R$ 97/mês',
      benefits: [
        'Acesso a todos os cursos Premium',
        'Suporte prioritário',
        'Certificados de conclusão',
        'Acesso antecipado a novos conteúdos'
      ]
    },
    enterprise: {
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      name: 'Enterprise',
      price: 'R$ 297/mês',
      benefits: [
        'Acesso completo a todos os cursos',
        'Consultoria personalizada',
        'Implementação assistida',
        'Suporte 24/7',
        'Acesso exclusivo a masterclasses'
      ]
    }
  };

  const config = tierConfig[requiredTier];
  const Icon = config.icon;

  const handleUpgrade = async () => {
    try {
      await initiatePremiumUpgrade(requiredTier);
    } catch (error) {
      console.error('Erro ao iniciar upgrade:', error);
    }
  };

  if (paymentStatus.isTrialActive) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Trial Ativo</CardTitle>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {paymentStatus.trialDaysRemaining} dias restantes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Você ainda tem acesso trial. Aproveite para explorar o curso "{courseTitle}" 
            antes que seu trial expire.
          </p>
          <Button onClick={handleUpgrade} className="w-full">
            Assinar Agora e Manter Acesso
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={`${config.bgColor} border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-6 w-6 ${config.color}`} />
            <div>
              <CardTitle className="text-xl">Upgrade Necessário</CardTitle>
              <p className="text-sm text-muted-foreground">
                Este curso requer plano {config.name}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`${config.color} border-current`}>
            {config.name}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2">
            "{courseTitle}"
          </h3>
          <p className="text-muted-foreground">
            Para acessar este curso premium, você precisa fazer upgrade para o plano {config.name}.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{config.price}</div>
            <div className="text-sm text-muted-foreground">Cancele a qualquer momento</div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">O que você ganha:</h4>
            <ul className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleUpgrade} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : `Assinar ${config.name}`}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Pagamento seguro via Stripe • Garantia de 7 dias
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
