import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';

interface SimpleOnboardingStep2Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep2Fixed = React.memo(forwardRef<{ getData: () => any; isValid: () => boolean }, SimpleOnboardingStep2Props>(({
  data,
  onNext,
  isLoading = false,
  onDataChange
}, ref) => {
  const [formData, setFormData] = useState({
    companyName: data.business_info?.companyName || '',
    position: data.business_info?.position || '',
    businessSector: data.business_info?.businessSector || '',
    companySize: data.business_info?.companySize || '',
    annualRevenue: data.business_info?.annualRevenue || '',
    companyWebsite: data.business_info?.companyWebsite || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const getFieldError = (field: string) => errors[field];

  const handleInputChange = useCallback((field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    
    // Auto-save com debounce
    if (onDataChange) {
      onDataChange({ business_info: newFormData });
    }
    
    // Limpar erro do campo quando usuário interagir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [formData, onDataChange, errors]);

  // CORREÇÃO CRÍTICA: Validação muito mais tolerante
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Apenas validações básicas - permitir prosseguir com dados mínimos
    if (!formData.companyName.trim() && !formData.position.trim()) {
      newErrors.companyName = 'Informe pelo menos o nome da empresa ou sua posição';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.companyName, formData.position]);

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    // Enviar dados estruturados para o wizard
    onNext({ business_info: formData });
  };

  // Expor funções através da ref com memoização
  useImperativeHandle(ref, () => ({
    getData: () => ({ business_info: formData }),
    isValid: validateForm
  }), [formData, validateForm]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Contexto Empresarial
        </h2>
        <p className="text-muted-foreground text-lg">
          Para personalizar seu aprendizado, queremos conhecer seu ambiente de trabalho
        </p>
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          💡 Preencha pelo menos um campo para continuar
        </div>
      </div>

      {/* Informações Empresariais */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-foreground font-medium">
              Nome da Empresa/Organização
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Digite o nome da sua empresa..."
              className="bg-background border-border text-foreground"
            />
            {getFieldError('companyName') && (
              <p className="text-destructive text-sm">{getFieldError('companyName')}</p>
            )}
          </div>

          {/* Posição/Cargo */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-foreground font-medium">
              Sua Posição/Cargo
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Ex: Gerente, Analista, CEO, Empreendedor..."
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Setor de Atuação - Opcional */}
          <div className="space-y-2">
            <Label htmlFor="businessSector" className="text-foreground font-medium">
              Setor de Atuação <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select 
              value={formData.businessSector} 
              onValueChange={(value) => handleInputChange('businessSector', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione seu setor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="marketing-digital">Marketing Digital</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Porte da Empresa - Opcional */}
          <div className="space-y-2">
            <Label htmlFor="companySize" className="text-foreground font-medium">
              Porte da Empresa <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select 
              value={formData.companySize} 
              onValueChange={(value) => handleInputChange('companySize', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o porte da empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 funcionário</SelectItem>
                <SelectItem value="2-5">2-5 funcionários</SelectItem>
                <SelectItem value="6-10">6-10 funcionários</SelectItem>
                <SelectItem value="11-25">11-25 funcionários</SelectItem>
                <SelectItem value="26-50">26-50 funcionários</SelectItem>
                <SelectItem value="51-100">51-100 funcionários</SelectItem>
                <SelectItem value="101+">101+ funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}));

SimpleOnboardingStep2Fixed.displayName = 'SimpleOnboardingStep2Fixed';