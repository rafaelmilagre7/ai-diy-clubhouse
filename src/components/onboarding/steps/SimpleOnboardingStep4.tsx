import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface SimpleOnboardingStep4Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const SimpleOnboardingStep4: React.FC<SimpleOnboardingStep4Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    company_name: data.business_info?.company_name || '',
    position: data.business_info?.position || '',
    business_sector: data.business_info?.business_sector || '',
    company_size: data.business_info?.company_size || '',
    company_description: data.business_info?.company_description || '',
    ...data.business_info
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

  const companySizes = [
    { value: '1', label: 'Apenas eu (freelancer/autônomo)' },
    { value: '2-10', label: '2-10 funcionários' },
    { value: '11-50', label: '11-50 funcionários' },
    { value: '51-200', label: '51-200 funcionários' },
    { value: '201-1000', label: '201-1000 funcionários' },
    { value: '1000+', label: 'Mais de 1000 funcionários' }
  ];

  const businessSectors = [
    'Tecnologia', 'Consultoria', 'E-commerce', 'Educação', 'Saúde',
    'Financeiro', 'Marketing', 'Agência', 'Indústria', 'Varejo',
    'Imobiliário', 'Jurídico', 'Entretenimento', 'Outro'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Contexto Empresarial
        </h2>
        <p className="text-muted-foreground">
          Conhecer seu contexto profissional nos ajuda a personalizar as recomendações.
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da empresa</Label>
            <Input
              id="company_name"
              type="text"
              placeholder="Sua empresa"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Seu cargo/função</Label>
            <Input
              id="position"
              type="text"
              placeholder="Ex: CEO, Gerente, Analista..."
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business_sector">Setor de atuação</Label>
            <Select value={formData.business_sector} onValueChange={(value) => handleInputChange('business_sector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {businessSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_size">Tamanho da empresa</Label>
            <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Número de funcionários" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_description">
            Breve descrição do seu negócio (opcional)
          </Label>
          <Textarea
            id="company_description"
            placeholder="O que sua empresa faz? Quais são os principais produtos/serviços?"
            value={formData.company_description}
            onChange={(e) => handleInputChange('company_description', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};