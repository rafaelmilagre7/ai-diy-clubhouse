
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Zap, Users, Target } from 'lucide-react';

interface WelcomeStepProps {
  onDataChange: (data: any) => void;
  data?: any;
}

/**
 * Step de boas-vindas do onboarding
 * FASE 3: Apresentação da plataforma e benefícios
 */
export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onDataChange, data = {} }) => {
  const features = [
    {
      icon: <Rocket className="w-5 h-5 text-viverblue" />,
      title: "Soluções Práticas",
      description: "Implementações step-by-step para acelerar seus resultados"
    },
    {
      icon: <Zap className="w-5 h-5 text-viverblue" />,
      title: "Ferramentas Curadas",
      description: "As melhores ferramentas de IA selecionadas e testadas"
    },
    {
      icon: <Users className="w-5 h-5 text-viverblue" />,
      title: "Comunidade Ativa",
      description: "Conecte-se com outros profissionais e compartilhe experiências"
    },
    {
      icon: <Target className="w-5 h-5 text-viverblue" />,
      title: "Resultados Mensuráveis",
      description: "Acompanhe seu progresso e conquiste seus objetivos"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header de boas-vindas */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge className="bg-viverblue/10 text-viverblue border-viverblue/20">
            🚀 Bem-vindo à plataforma!
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Vamos configurar sua experiência personalizada
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Este setup rápido nos ajudará a personalizar sua jornada na plataforma, 
          mostrando as ferramentas e soluções mais relevantes para você.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-gray-200 hover:border-viverblue/30 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                {feature.icon}
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações do setup */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-viverblue rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">ℹ</span>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Sobre este setup inicial
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Levará apenas 2-3 minutos para completar</li>
                <li>• Todos os dados são opcionais e podem ser alterados depois</li>
                <li>• Você pode pular este setup e explorar livremente</li>
                <li>• Suas informações ficam seguras e privadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
