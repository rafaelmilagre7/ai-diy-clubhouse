import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimpleOnboardingStep2Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const SimpleOnboardingStep2: React.FC<SimpleOnboardingStep2Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    country: data.location_info?.country || 'Brasil',
    state: data.location_info?.state || '',
    city: data.location_info?.city || '',
    timezone: data.location_info?.timezone || 'America/Sao_Paulo',
    ...data.location_info
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const brazilStates = [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
    'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
    'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
    'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
    'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Onde você está localizado?
        </h2>
        <p className="text-muted-foreground">
          Conhecer sua localização nos ajuda a personalizar horários e eventos regionais.
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu estado" />
              </SelectTrigger>
              <SelectContent>
                {brazilStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            type="text"
            placeholder="Sua cidade"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};