import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Building, Users, DollarSign } from 'lucide-react';
import { SimpleOnboardingData } from '@/hooks/useSimpleOnboarding';

interface SimpleStep2Props {
  data: SimpleOnboardingData;
  onNext: (stepData: Partial<SimpleOnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  isLoading: boolean;
}

const COMPANY_SECTORS = [
  'Tecnologia',
  'Saúde',
  'Educação',
  'Financeiro',
  'Varejo',
  'Manufatura',
  'Serviços',
  'Agronegócio',
  'Construção',
  'Consultoria',
  'Outro'
];

const COMPANY_SIZES = [
  'Apenas eu (1 pessoa)',
  'Pequena (2-10 pessoas)',
  'Média (11-50 pessoas)',
  'Grande (51-200 pessoas)',
  'Muito grande (200+ pessoas)'
];

export const SimpleStep2: React.FC<SimpleStep2Props> = ({ data, onNext, onPrevious, isLoading }) => {
  const [formData, setFormData] = useState({
    company_name: data.business_info.company_name || '',
    position: data.business_info.position || '',
    company_sector: data.business_info.company_sector || '',
    company_size: data.business_info.company_size || '',
  });

  // Atualizar formData quando data mudar
  useEffect(() => {
    setFormData({
      company_name: data.business_info.company_name || '',
      position: data.business_info.position || '',
      company_sector: data.business_info.company_sector || '',
      company_size: data.business_info.company_size || '',
    });
  }, [data.business_info]);

  const handleSubmit = async () => {
    const stepData: Partial<SimpleOnboardingData> = {
      business_info: {
        company_name: formData.company_name.trim(),
        position: formData.position.trim(),
        company_sector: formData.company_sector,
        company_size: formData.company_size,
      }
    };

    await onNext(stepData);
  };

  const handleSkip = async () => {
    // Pular este step mantendo dados vazios
    const stepData: Partial<SimpleOnboardingData> = {
      business_info: {}
    };

    await onNext(stepData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Contexto empresarial</h1>
        <p className="text-muted-foreground">
          Ajude-nos a entender melhor seu ambiente de trabalho para personalizar nossas recomendações.
        </p>
        <p className="text-sm text-muted-foreground">
          ✨ Este passo é opcional - você pode pular se preferir
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Nome da empresa */}
        <div className="space-y-2">
          <Label htmlFor="company_name" className="flex items-center gap-2 text-sm font-medium">
            <Building className="w-4 h-4" />
            Nome da empresa
          </Label>
          <Input
            id="company_name"
            type="text"
            placeholder="Digite o nome da sua empresa"
            value={formData.company_name}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
          />
        </div>

        {/* Cargo/Posição */}
        <div className="space-y-2">
          <Label htmlFor="position" className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            Seu cargo ou função
          </Label>
          <Input
            id="position"
            type="text"
            placeholder="Ex: CEO, Gerente de TI, Analista..."
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
          />
        </div>

        {/* Setor */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="w-4 h-4" />
            Setor da empresa
          </Label>
          <Select value={formData.company_sector} onValueChange={(value) => handleInputChange('company_sector', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tamanho da empresa */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4" />
            Tamanho da empresa
          </Label>
          <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
          ← Voltar
        </Button>
        
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
            Pular esta etapa
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              'Continuar →'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};