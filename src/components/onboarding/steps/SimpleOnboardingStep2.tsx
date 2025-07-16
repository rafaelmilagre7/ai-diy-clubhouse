import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';

interface SimpleOnboardingStep2Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep2 = React.memo(forwardRef<{ getData: () => any; isValid: () => boolean }, SimpleOnboardingStep2Props>(({
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
    companyWebsite: data.business_info?.companyWebsite || '',
    ...data.business_info
  });

  // 🎯 CORREÇÃO: Sincronizar com dados que chegam assincronamente do servidor
  useEffect(() => {
    if (data?.business_info) {
      console.log('[STEP2] Dados recebidos do servidor:', data.business_info);
      
      setFormData(prev => ({
        ...prev,
        // Preservar dados já digitados ou usar dados do servidor
        companyName: prev.companyName || data.business_info?.companyName || '',
        position: prev.position || data.business_info?.position || '',
        businessSector: prev.businessSector || data.business_info?.businessSector || '',
        companySize: prev.companySize || data.business_info?.companySize || '',
        annualRevenue: prev.annualRevenue || data.business_info?.annualRevenue || '',
        companyWebsite: prev.companyWebsite || data.business_info?.companyWebsite || ''
      }));
    }
  }, [data?.business_info]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const getFieldError = (field: string) => errors[field];

  const handleInputChange = useCallback((field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);

    // Notificar mudanças para auto-save (debounced)
    if (onDataChange) {
      onDataChange(newFormData);
    }

    // Limpar erro do campo quando usuário interagir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [formData, onDataChange, errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.position) {
      newErrors.position = 'Posição é obrigatória';
    }

    if (!formData.businessSector) {
      newErrors.businessSector = 'Setor de atuação é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.position, formData.businessSector]);

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
          Conte-me sobre seu mundo profissional
        </h2>
        <p className="text-muted-foreground text-lg">
          Essas informações me ajudam a personalizar suas recomendações de IA
        </p>
      </div>

      <Card className="bg-card border border-border">
        <CardContent className="space-y-6 pt-6">
          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-foreground font-medium">
              Empresa onde trabalha
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Ex: Google, Microsoft, Empresa XYZ..."
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">Isso nos ajuda a entender seu contexto empresarial</p>
          </div>

          {/* Cargo/Posição */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-foreground font-medium">
              Cargo/Posição *
            </Label>
            <p className="text-xs text-muted-foreground">Seu cargo nos ajuda a sugerir as melhores estratégias de IA</p>
            <Select 
              value={formData.position} 
              onValueChange={(value) => handleInputChange('position', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione seu cargo..." />
              </SelectTrigger>
              <SelectContent>
                {/* C-Level & Fundadores */}
                <SelectItem value="fundador">Fundador</SelectItem>
                <SelectItem value="co-fundador">Co-fundador</SelectItem>
                <SelectItem value="ceo">CEO</SelectItem>
                <SelectItem value="cto">CTO</SelectItem>
                <SelectItem value="cfo">CFO</SelectItem>
                <SelectItem value="coo">COO</SelectItem>
                
                {/* Executivos */}
                <SelectItem value="presidente">Presidente</SelectItem>
                <SelectItem value="diretor-executivo">Diretor Executivo</SelectItem>
                <SelectItem value="diretor">Diretor</SelectItem>
                <SelectItem value="vp">VP (Vice-Presidente)</SelectItem>
                <SelectItem value="socio">Sócio</SelectItem>
                
                {/* Gerência */}
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="head">Head</SelectItem>
                <SelectItem value="coordenador">Coordenador</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                
                {/* Técnico/Operacional */}
                <SelectItem value="especialista">Especialista</SelectItem>
                <SelectItem value="analista">Analista</SelectItem>
                <SelectItem value="consultor">Consultor</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="assistente">Assistente</SelectItem>
                
                {/* Independentes */}
                <SelectItem value="empreendedor">Empreendedor</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="autonomo">Autônomo</SelectItem>
                
                {/* Outros */}
                <SelectItem value="estudante">Estudante</SelectItem>
                <SelectItem value="estagiario">Estagiário</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('position') && (
              <p className="text-destructive text-sm">{getFieldError('position')}</p>
            )}
          </div>

          {/* Setor de Atuação */}
          <div className="space-y-2">
            <Label htmlFor="businessSector" className="text-foreground font-medium">
              Setor de Atuação *
            </Label>
            <p className="text-xs text-muted-foreground">Cada setor tem oportunidades únicas de IA</p>
            <Select 
              value={formData.businessSector} 
              onValueChange={(value) => handleInputChange('businessSector', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione seu setor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inteligencia-artificial">Inteligência Artificial</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="marketing-digital">Marketing Digital</SelectItem>
                <SelectItem value="e-commerce">E-commerce</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="juridico">Jurídico</SelectItem>
                <SelectItem value="recursos-humanos">Recursos Humanos</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="logistica">Logística</SelectItem>
                <SelectItem value="imobiliario">Imobiliário</SelectItem>
                <SelectItem value="alimenticio">Alimentício</SelectItem>
                <SelectItem value="energia">Energia</SelectItem>
                <SelectItem value="telecomunicacoes">Telecomunicações</SelectItem>
                <SelectItem value="agronegocio">Agronegócio</SelectItem>
                <SelectItem value="construcao">Construção</SelectItem>
                <SelectItem value="governo">Governo</SelectItem>
                <SelectItem value="ongs">ONGs</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('businessSector') && (
              <p className="text-destructive text-sm">{getFieldError('businessSector')}</p>
            )}
          </div>

          {/* Porte da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companySize" className="text-foreground font-medium">
              Número de Funcionários da Empresa
            </Label>
            <Select 
              value={formData.companySize} 
              onValueChange={(value) => handleInputChange('companySize', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o número de funcionários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 funcionário</SelectItem>
                <SelectItem value="2-5">2-5 funcionários</SelectItem>
                <SelectItem value="6-10">6-10 funcionários</SelectItem>
                <SelectItem value="11-25">11-25 funcionários</SelectItem>
                <SelectItem value="26-50">26-50 funcionários</SelectItem>
                <SelectItem value="51-100">51-100 funcionários</SelectItem>
                <SelectItem value="101-250">101-250 funcionários</SelectItem>
                <SelectItem value="251-500">251-500 funcionários</SelectItem>
                <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                <SelectItem value="1001+">1001+ funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Faturamento Anual */}
          <div className="space-y-2">
            <Label htmlFor="annualRevenue" className="text-foreground font-medium">
              Faturamento Anual da Empresa
            </Label>
            <Select 
              value={formData.annualRevenue} 
              onValueChange={(value) => handleInputChange('annualRevenue', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o faturamento anual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ate-100k">Até R$ 100 mil</SelectItem>
                <SelectItem value="100k-500k">R$ 100 mil - R$ 500 mil</SelectItem>
                <SelectItem value="500k-1m">R$ 500 mil - R$ 1 milhão</SelectItem>
                <SelectItem value="1m-5m">R$ 1 milhão - R$ 5 milhões</SelectItem>
                <SelectItem value="5m-10m">R$ 5 milhões - R$ 10 milhões</SelectItem>
                <SelectItem value="10m-25m">R$ 10 milhões - R$ 25 milhões</SelectItem>
                <SelectItem value="25m-50m">R$ 25 milhões - R$ 50 milhões</SelectItem>
                <SelectItem value="50m-100m">R$ 50 milhões - R$ 100 milhões</SelectItem>
                <SelectItem value="100m-500m">R$ 100 milhões - R$ 500 milhões</SelectItem>
                <SelectItem value="500m+">Acima de R$ 500 milhões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Website da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companyWebsite" className="text-foreground font-medium">
              Website da Empresa
            </Label>
            <Input
              id="companyWebsite"
              value={formData.companyWebsite}
              onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
              placeholder="https://www.empresa.com.br"
              className="bg-background border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}));