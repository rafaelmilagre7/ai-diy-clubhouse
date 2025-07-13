import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SimpleOnboardingStepProps } from '../types/simpleOnboardingTypes';

const SimpleStep1: React.FC<SimpleOnboardingStepProps> = ({
  data,
  onNext,
  onUpdateData
}) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || ''
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdateData(newData);
  };

  const handleNext = () => {
    // Validação básica
    if (!formData.name.trim()) {
      alert('Por favor, preencha seu nome.');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Por favor, preencha seu email.');
      return;
    }

    onNext();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Vamos nos conhecer melhor!</CardTitle>
        <CardDescription>
          Precisamos de algumas informações básicas para personalizar sua experiência.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Opcional - para contato direto quando necessário
          </p>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={handleNext} size="lg" className="px-8">
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleStep1;