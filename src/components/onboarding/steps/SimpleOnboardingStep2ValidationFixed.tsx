import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SkipForward, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleOnboardingStep2Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep2ValidationFixed = React.memo(forwardRef<{ getData: () => any; isValid: () => boolean }, SimpleOnboardingStep2Props>(({
  data,
  onNext,
  isLoading = false,
  onDataChange
}, ref) => {
  const [formData, setFormData] = useState({
    company_name: data.business_info?.company_name || '',
    position: data.business_info?.position || '',
    company_sector: data.business_info?.company_sector || '',
    employee_count: data.business_info?.employee_count || '',
    company_stage: data.business_info?.company_stage || '',
    ...data.business_info
  });

  // 🎯 CORREÇÃO: Sincronizar com dados que chegam assincronamente do servidor
  useEffect(() => {
    if (data?.business_info) {
      console.log('[STEP2] Dados recebidos do servidor:', data.business_info);
      
      setFormData(prev => ({
        ...prev,
        ...data.business_info
      }));
    }
  }, [data?.business_info]);

  const updateStepData = useCallback((field: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Notificar mudanças para auto-save do componente pai (debounced)
      if (onDataChange) {
        onDataChange(newFormData);
      }
      
      return newFormData;
    });
  }, [onDataChange]);

  // 🎯 CORREÇÃO PRINCIPAL: Step 2 sempre válido (permite pular)
  const validateForm = useCallback(() => {
    console.log(`✅ [STEP2] Sempre válido - permite pular se necessário`);
    return true; // Sempre válido para permitir flexibilidade
  }, []);

  const handleNext = () => {
    // Sempre permite avançar, mas envia os dados se preenchidos
    onNext({ business_info: formData });
  };

  const handleSkip = () => {
    console.log('[STEP2] Pulando step - enviando dados vazios');
    onNext({ 
      business_info: {
        company_name: '',
        position: '',
        company_sector: '',
        employee_count: '',
        company_stage: ''
      }
    });
  };

  // Expor funções através da ref
  useImperativeHandle(ref, () => ({
    getData: () => ({ business_info: formData }),
    isValid: validateForm
  }), [formData, validateForm]);

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground text-xl font-bold flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            Informações Profissionais
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Conte-nos sobre sua empresa (opcional - você pode pular esta etapa)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Nome da empresa
            </Label>
            <Input
              type="text"
              value={formData.company_name}
              onChange={(e) => updateStepData('company_name', e.target.value)}
              placeholder="Ex: Minha Empresa Ltda"
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Seu cargo
            </Label>
            <Input
              type="text"
              value={formData.position}
              onChange={(e) => updateStepData('position', e.target.value)}
              placeholder="Ex: CEO, Diretor, Gerente"
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Setor da Empresa */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Setor da empresa
            </Label>
            <Select 
              value={formData.company_sector} 
              onValueChange={(value) => updateStepData('company_sector', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-60">
                {[
                  'Tecnologia',
                  'Saúde',
                  'Educação',
                  'Varejo',
                  'Serviços',
                  'Indústria',
                  'Agronegócio',
                  'Financeiro',
                  'Imobiliário',
                  'Consultoria',
                  'Outros'
                ].map((sector) => (
                  <SelectItem key={sector} value={sector} className="text-foreground hover:bg-muted">
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tamanho da Empresa */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Tamanho da empresa
            </Label>
            <Select 
              value={formData.employee_count} 
              onValueChange={(value) => updateStepData('employee_count', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Número de funcionários" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {[
                  'Apenas eu',
                  '2-10 funcionários',
                  '11-50 funcionários',
                  '51-200 funcionários',
                  '201-1000 funcionários',
                  'Mais de 1000 funcionários'
                ].map((size) => (
                  <SelectItem key={size} value={size} className="text-foreground hover:bg-muted">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Pular - Sempre visível */}
          <div className="pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground border-border hover:border-primary hover:text-primary"
              disabled={isLoading}
            >
              <SkipForward className="w-4 h-4" />
              Pular esta etapa
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Você pode voltar e preencher depois
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}));

SimpleOnboardingStep2ValidationFixed.displayName = 'SimpleOnboardingStep2ValidationFixed';