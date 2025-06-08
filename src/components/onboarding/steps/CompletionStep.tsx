
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Mail, Users, MessageSquare } from 'lucide-react';

interface CompletionStepProps {
  onDataChange: (data: any) => void;
  data?: any;
}

/**
 * Step de finalização do onboarding
 * FASE 3: Conclusão e próximos passos
 */
export const CompletionStep: React.FC<CompletionStepProps> = ({ onDataChange, data = {} }) => {
  const updateField = (field: string, value: any) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  const nextSteps = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Explore as Soluções",
      description: "Veja implementações práticas baseadas no seu perfil"
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: "Conecte-se à Comunidade",
      description: "Participe de discussões e compartilhe experiências"
    },
    {
      icon: <Mail className="w-5 h-5 text-purple-500" />,
      title: "Acompanhe seu Progresso",
      description: "Use o dashboard para monitorar suas implementações"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Setup Quase Concluído!</h2>
        <p className="text-gray-600">
          Parabéns! Você está pronto para aproveitar ao máximo a plataforma
        </p>
      </div>

      <div className="space-y-6">
        {/* Resumo Personalizado */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Sua Experiência Personalizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Com base nas suas respostas, preparamos uma experiência personalizada para você:
            </p>
            <ul className="text-sm text-green-700 space-y-2">
              <li>• Dashboard otimizado para seu nível de experiência</li>
              <li>• Soluções priorizadas baseadas nos seus interesses</li>
              <li>• Ferramentas recomendadas para seus objetivos</li>
              <li>• Conteúdo adaptado ao seu estilo de aprendizado</li>
            </ul>
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg border border-gray-200">
                  {step.icon}
                  <div>
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferências de Comunicação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-viverblue" />
              Comunicação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={data.wantsNewsletter || false}
                onCheckedChange={(checked) => updateField('wantsNewsletter', checked)}
              />
              <Label htmlFor="newsletter" className="text-sm">
                Quero receber newsletter com novidades e dicas
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mentoring"
                checked={data.interestedInMentoring || false}
                onCheckedChange={(checked) => updateField('interestedInMentoring', checked)}
              />
              <Label htmlFor="mentoring" className="text-sm">
                Tenho interesse em programa de mentoria
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-viverblue" />
              Feedback (Opcional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="feedback">
              Alguma expectativa específica ou sugestão para melhorarmos sua experiência?
            </Label>
            <Textarea
              id="feedback"
              value={data.additionalFeedback || ''}
              onChange={(e) => updateField('additionalFeedback', e.target.value)}
              placeholder="Compartilhe suas expectativas, dúvidas ou sugestões..."
              className="mt-2"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Chamada para Ação */}
        <Card className="border-viverblue bg-viverblue/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-viverblue mb-2">
                Tudo pronto para começar!
              </h3>
              <p className="text-sm text-gray-700">
                Clique em "Concluir Setup" para salvar suas preferências e começar sua jornada na plataforma.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
