
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Users } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

export const StepDiscoveryInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const discoveryOptions = [
    'Google/Pesquisa',
    'YouTube',
    'Instagram',
    'LinkedIn',
    'Facebook',
    'Indicação de amigo/colega',
    'G4 Educação',
    'MeetHub',
    'Evento/Palestra',
    'Podcast',
    'Blog/Artigo',
    'Outro'
  ];

  const isFormValid = () => {
    return data.discovery_info.how_found_us;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Como você conheceu o Viver de IA?
        </h2>
        <p className="text-gray-300">
          Queremos entender como chegou até nós para melhorarmos ainda mais.
        </p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-viverblue" />
            Como nos encontrou
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="how_found_us" className="text-white">Como você conheceu o Viver de IA? *</Label>
            <Select 
              value={data.discovery_info.how_found_us || ''} 
              onValueChange={(value) => onUpdate('discovery_info', {
                ...data.discovery_info,
                how_found_us: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione como nos conheceu" />
              </SelectTrigger>
              <SelectContent>
                {discoveryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(data.discovery_info.how_found_us === 'Indicação de amigo/colega' || 
            data.discovery_info.how_found_us === 'Outro') && (
            <div>
              <Label htmlFor="referred_by" className="text-white">
                {data.discovery_info.how_found_us === 'Indicação de amigo/colega' 
                  ? 'Quem te indicou?' 
                  : 'Por favor, especifique:'}
              </Label>
              <Input
                id="referred_by"
                value={data.discovery_info.referred_by || ''}
                onChange={(e) => onUpdate('discovery_info', {
                  ...data.discovery_info,
                  referred_by: e.target.value
                })}
                placeholder={
                  data.discovery_info.how_found_us === 'Indicação de amigo/colega'
                    ? "Nome da pessoa que te indicou"
                    : "Especifique como nos conheceu"
                }
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className="bg-viverblue hover:bg-viverblue/90"
        >
          Próxima Etapa
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Etapa {currentStep} de {totalSteps}
      </div>
    </div>
  );
};
