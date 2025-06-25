
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, ExternalLink, Crown } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      id: '1',
      title: 'Desconto ChatGPT Plus',
      description: '20% de desconto na assinatura mensal do ChatGPT Plus',
      discount: '20% OFF',
      category: 'IA Tools',
      tier: 'Club',
      available: true
    },
    {
      id: '2',
      title: 'Acesso Gratuito Notion AI',
      description: '3 meses grátis do Notion AI para organização e produtividade',
      discount: '3 meses grátis',
      category: 'Produtividade',
      tier: 'Premium',
      available: false
    },
    {
      id: '3',
      title: 'Desconto Figma Professional',
      description: '15% de desconto anual no plano profissional do Figma',
      discount: '15% OFF',
      category: 'Design',
      tier: 'Club',
      available: true
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Premium': return 'default';
      case 'Club': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Benefícios</h1>
        <p className="text-muted-foreground">
          Aproveite descontos exclusivos e benefícios para membros
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <Card key={benefit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  {benefit.title}
                </CardTitle>
                {!benefit.available && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">
                    {benefit.discount}
                  </Badge>
                  <Badge variant={getTierColor(benefit.tier)}>
                    {benefit.tier}
                  </Badge>
                </div>
                
                <Button 
                  className="w-full gap-2" 
                  disabled={!benefit.available}
                >
                  {benefit.available ? (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Resgatar Benefício
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4" />
                      Upgrade para Premium
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Seja Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Desbloqueie todos os benefícios exclusivos e tenha acesso a descontos ainda maiores
            em ferramentas premium de IA e produtividade.
          </p>
          <Button>
            Fazer Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Benefits;
