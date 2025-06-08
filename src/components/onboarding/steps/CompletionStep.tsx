
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Mail, Users, MessageSquare, Sparkles } from 'lucide-react';

interface CompletionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  allData: any;
}

/**
 * Step de finalização - FASE 5
 * Confirmação final e preferências de comunicação
 */
export const CompletionStep: React.FC<CompletionStepProps> = ({ data, onUpdate, allData }) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  // Resumo das preferências selecionadas
  const getSelectionSummary = () => {
    const summary = [];
    
    if (allData.profile?.experience) {
      const experienceLabels: Record<string, string> = {
        beginner: 'Iniciante em IA',
        intermediate: 'Intermediário em IA',
        advanced: 'Avançado em IA',
        expert: 'Expert em IA'
      };
      summary.push(experienceLabels[allData.profile.experience]);
    }

    if (allData.preferences?.interestedCategories?.length) {
      summary.push(`${allData.preferences.interestedCategories.length} área(s) de interesse`);
    }

    if (allData.goals?.primaryGoal) {
      const goalLabels: Record<string, string> = {
        automation: 'Foco em automação',
        growth: 'Foco em crescimento',
        efficiency: 'Foco em eficiência',
        learning: 'Foco em aprendizado',
        innovation: 'Foco em inovação'
      };
      summary.push(goalLabels[allData.goals.primaryGoal]);
    }

    return summary;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-viverblue rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Quase pronto! 🎉</h2>
        <p className="text-gray-600">
          Últimos detalhes para personalizarmos completamente sua experiência
        </p>
      </div>

      {/* Resumo das Escolhas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Sparkles className="w-5 h-5" />
            Seu Perfil Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getSelectionSummary().map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" />
                {item}
              </div>
            ))}
          </div>
          {getSelectionSummary().length === 0 && (
            <p className="text-sm text-green-600">
              Configuração básica - você pode personalizar mais detalhes depois!
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preferências de Comunicação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Comunicação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="wantsNewsletter"
                checked={data.wantsNewsletter || false}
                onCheckedChange={(checked) => handleChange('wantsNewsletter', !!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="wantsNewsletter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Receber newsletter personalizada
                </label>
                <p className="text-xs text-muted-foreground">
                  Conteúdo selecionado baseado no seu perfil, enviado semanalmente
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="interestedInMentoring"
                checked={data.interestedInMentoring || false}
                onCheckedChange={(checked) => handleChange('interestedInMentoring', !!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="interestedInMentoring"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Interesse em mentoria
                </label>
                <p className="text-xs text-muted-foreground">
                  Conectar-se com outros membros para trocar experiências
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Feedback Adicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="additionalFeedback">
              Algo mais que gostaria de compartilhar? (Opcional)
            </Label>
            <Textarea
              id="additionalFeedback"
              placeholder="Conte-nos sobre seus desafios específicos, expectativas ou qualquer coisa que possa nos ajudar a personalizar melhor sua experiência..."
              value={data.additionalFeedback || ''}
              onChange={(e) => handleChange('additionalFeedback', e.target.value)}
              className="min-h-[100px] mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Este feedback nos ajuda a entender melhor suas necessidades e melhorar continuamente a plataforma.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Passos */}
      <Card className="border-viverblue/30 bg-viverblue/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-viverblue">
            <Users className="w-5 h-5" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-viverblue" />
              <span>Dashboard personalizado com conteúdo relevante</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-viverblue" />
              <span>Recomendações de soluções baseadas no seu perfil</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-viverblue" />
              <span>Conexões com membros do seu segmento</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-viverblue" />
              <span>Conteúdo priorizado por seus objetivos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
