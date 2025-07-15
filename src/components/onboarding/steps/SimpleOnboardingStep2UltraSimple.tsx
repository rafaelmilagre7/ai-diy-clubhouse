import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleOnboardingStep2Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep2UltraSimple = React.memo(forwardRef<{ getData: () => any; isValid: () => boolean }, SimpleOnboardingStep2Props>(({
  data,
  onNext,
  isLoading = false,
  onDataChange
}, ref) => {
  const [formData, setFormData] = useState({
    companyName: data.business_info?.companyName || '',
    position: data.business_info?.position || '',
    businessSector: data.business_info?.businessSector || ''
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    
    // Auto-save
    if (onDataChange) {
      onDataChange({ business_info: newFormData });
    }
  }, [formData, onDataChange]);

  // SEMPRE válido - permite prosseguir em qualquer situação
  const validateForm = useCallback(() => true, []);

  const handleNext = () => {
    onNext({ business_info: formData });
  };

  const handleSkip = () => {
    // Pular completamente com dados mínimos
    onNext({ 
      business_info: { 
        companyName: 'Não informado',
        position: 'Não informado',
        businessSector: 'outros'
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
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Contexto Profissional
        </h2>
        <p className="text-muted-foreground text-lg">
          Nos ajude a personalizar sua experiência (opcional)
        </p>
        <div className="text-sm text-success bg-success/10 p-3 rounded-lg border border-success/20">
          ✅ Você pode pular esta etapa e preencher depois
        </div>
      </div>

      {/* Formulário Ultra Simples */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Informações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da Empresa - Ultra simples */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-foreground font-medium">
              Onde você trabalha? <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Nome da empresa ou 'Autônomo'"
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Posição - Ultra simples */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-foreground font-medium">
              Qual seu cargo? <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Ex: Gerente, Analista, CEO, Freelancer..."
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Setor - Ultra simples */}
          <div className="space-y-2">
            <Label htmlFor="businessSector" className="text-foreground font-medium">
              Qual sua área? <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select 
              value={formData.businessSector} 
              onValueChange={(value) => handleInputChange('businessSector', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Escolha sua área..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="juridico">Jurídico</SelectItem>
                <SelectItem value="recursos-humanos">RH</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão Pular Visível */}
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="w-full gap-2"
              type="button"
            >
              <SkipForward className="h-4 w-4" />
              Pular esta etapa
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Você pode preencher essas informações depois no seu perfil
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}));

SimpleOnboardingStep2UltraSimple.displayName = 'SimpleOnboardingStep2UltraSimple';