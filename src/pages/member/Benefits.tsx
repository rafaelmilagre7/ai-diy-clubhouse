import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Crown, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Benefits = () => {
  const benefits = [
    {
      title: "Acesso Premium",
      description: "Acesso completo a todas as ferramentas e cursos",
      features: ["Cursos ilimitados", "Ferramentas premium", "Suporte prioritário"],
      status: "Ativo",
      icon: Crown
    },
    {
      title: "Certificações",
      description: "Certificados reconhecidos pelo mercado",
      features: ["Certificado digital", "Validação blockchain", "Perfil LinkedIn"],
      status: "Disponível",
      icon: Star
    },
    {
      title: "Networking",
      description: "Conecte-se com profissionais da área",
      features: ["Grupos exclusivos", "Eventos premium", "Mentoria"],
      status: "Ativo",
      icon: Gift
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Benefícios</h1>
        <p className="text-muted-foreground">
          Aproveite todos os benefícios da sua assinatura
        </p>
      </div>
      
      {/* Cards de benefícios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <benefit.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </div>
                <Badge 
                  variant={benefit.status === "Ativo" ? "default" : "secondary"}
                >
                  {benefit.status}
                </Badge>
              </div>
              <CardDescription>
                {benefit.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {benefit.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de upgrade */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade de Plano
          </CardTitle>
          <CardDescription>
            Desbloqueie recursos exclusivos e acelere seu aprendizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full sm:w-auto">
            Conhecer Planos Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Benefits;