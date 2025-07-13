import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/simpleOnboardingTypes';

const SimpleStep2: React.FC<OnboardingStepProps> = ({
  data,
  onNext,
  onPrev,
  onUpdateData
}) => {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    position: data.position || '',
    companySize: data.companySize || '',
    aiMainChallenge: data.aiMainChallenge || ''
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdateData(newData);
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Contexto Profissional</CardTitle>
        <CardDescription>
          Conte-nos sobre sua empresa e desafios para personalizarmos ainda mais sua jornada.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Nome da empresa</Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Nome da sua empresa"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Seu cargo/função</Label>
          <Input
            id="position"
            type="text"
            placeholder="Ex: CEO, Diretor de Marketing, Analista..."
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Tamanho da empresa</Label>
          <Select 
            value={formData.companySize} 
            onValueChange={(value) => handleInputChange('companySize', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho da empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">Apenas eu (freelancer/autônomo)</SelectItem>
              <SelectItem value="2-10">2-10 funcionários</SelectItem>
              <SelectItem value="11-50">11-50 funcionários</SelectItem>
              <SelectItem value="51-200">51-200 funcionários</SelectItem>
              <SelectItem value="201-1000">201-1000 funcionários</SelectItem>
              <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aiMainChallenge">Principal desafio atual</Label>
          <Textarea
            id="aiMainChallenge"
            placeholder="Qual é o maior desafio que você enfrenta atualmente no seu trabalho ou empresa?"
            value={formData.aiMainChallenge}
            onChange={(e) => handleInputChange('aiMainChallenge', e.target.value)}
            className="w-full min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Isso nos ajuda a sugerir soluções mais relevantes
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrev}>
            Voltar
          </Button>
          <Button onClick={handleNext} size="lg" className="px-8">
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleStep2;