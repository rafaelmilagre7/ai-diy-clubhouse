
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Rocket, Users, Target, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface WelcomeStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

/**
 * Step de boas-vindas - FASE 5
 * Introdução amigável e acordo de termos
 */
export const WelcomeStep: React.FC<WelcomeStepProps> = ({ data, onUpdate }) => {
  const handleAgreementChange = (field: string, checked: boolean) => {
    onUpdate({
      ...data,
      [field]: checked
    });
  };

  return (
    <div className="space-y-8">
      {/* Introdução */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-viverblue to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">
          Bem-vindo(a) ao Viver de IA! 🚀
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Vamos personalizar sua experiência para que você aproveite ao máximo nossa plataforma. 
          Este processo leva apenas 2-3 minutos e vai nos ajudar a mostrar conteúdo mais relevante para você.
        </p>
      </div>

      {/* Benefícios */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            title: 'Conteúdo Personalizado',
            description: 'Soluções e ferramentas adequadas ao seu perfil'
          },
          {
            icon: Rocket,
            title: 'Aceleração',
            description: 'Implementações mais rápidas e eficazes'
          },
          {
            icon: Users,
            title: 'Networking',
            description: 'Conexões com pessoas do seu segmento'
          },
          {
            icon: CheckCircle,
            title: 'Priorização',
            description: 'Foco no que realmente importa para você'
          }
        ].map((benefit, index) => (
          <Card key={index} className="p-4 text-center border-viverblue/20">
            <CardContent className="p-0">
              <benefit.icon className="w-8 h-8 text-viverblue mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-2">{benefit.title}</h3>
              <p className="text-xs text-gray-600">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acordo */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900">Antes de começar:</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasWatched"
              checked={data.hasWatched || false}
              onCheckedChange={(checked) => handleAgreementChange('hasWatched', !!checked)}
            />
            <label htmlFor="hasWatched" className="text-sm text-gray-700 leading-relaxed">
              Confirmo que já explorei um pouco a plataforma e estou pronto(a) para personalizar minha experiência
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreedToTerms"
              checked={data.agreedToTerms || false}
              onCheckedChange={(checked) => handleAgreementChange('agreedToTerms', !!checked)}
            />
            <label htmlFor="agreedToTerms" className="text-sm text-gray-700 leading-relaxed">
              Concordo em compartilhar informações do meu perfil para receber recomendações personalizadas e 
              conectar-me com outros membros relevantes
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          💡 <strong>Lembre-se:</strong> Todas as informações são opcionais e você pode alterar suas 
          preferências a qualquer momento no seu perfil.
        </p>
      </div>
    </div>
  );
};
