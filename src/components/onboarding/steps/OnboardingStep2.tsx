
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, Briefcase, Users, DollarSign, Crown, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';

const businessSectors = [
  'Tecnologia e Software',
  'E-commerce e Marketplace',
  'Educação e Cursos Online',
  'Saúde e Bem-estar',
  'Consultoria Empresarial',
  'Marketing Digital',
  'Serviços Financeiros',
  'Imobiliário',
  'Alimentação e Bebidas',
  'Moda e Beleza',
  'Turismo e Hotelaria',
  'Construção Civil',
  'Agronegócio',
  'Indústria e Manufatura',
  'Logística e Transporte',
  'Energia e Sustentabilidade',
  'Mídia e Entretenimento',
  'Inteligência Artificial',
  'Outros'
];

const companySizes = [
  '1-5 funcionários',
  '6-20 funcionários',
  '21-50 funcionários',
  '51-100 funcionários',
  '101-500 funcionários',
  '500+ funcionários'
];

const annualRevenues = [
  'Até R$ 100 mil',
  'R$ 100 mil - R$ 500 mil',
  'R$ 500 mil - R$ 1 milhão',
  'R$ 1 milhão - R$ 5 milhões',
  'R$ 5 milhões - R$ 20 milhões',
  'R$ 20 milhões - R$ 100 milhões',
  'Acima de R$ 100 milhões'
];

const positions = [
  'CEO/Fundador',
  'Diretor Executivo',
  'Diretor/VP',
  'Gerente',
  'Coordenador',
  'Supervisor',
  'Analista/Especialista',
  'Consultor',
  'Empreendedor Individual',
  'Sócio',
  'Outros'
];

export const OnboardingStep2 = ({ 
  data, 
  onUpdateData, 
  onNext,
  onPrev,
  getFieldError
}: OnboardingStepProps) => {
  const [companyName, setCompanyName] = useState(data.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState(data.companyWebsite || '');
  const [businessSector, setBusinessSector] = useState(data.businessSector || '');
  const [companySize, setCompanySize] = useState(data.companySize || '');
  const [annualRevenue, setAnnualRevenue] = useState(data.annualRevenue || '');
  const [position, setPosition] = useState(data.position || '');

  useEffect(() => {
    onUpdateData({ 
      companyName,
      companyWebsite,
      businessSector,
      companySize,
      annualRevenue,
      position
    });
  }, [companyName, companyWebsite, businessSector, companySize, annualRevenue, position, onUpdateData]);

  const handleNext = () => {
    // Gerar mensagem personalizada da IA baseada nas respostas
    const firstName = data.name?.split(' ')[0] || 'Amigo';
    const revenueComment = annualRevenue.includes('milhão') ? 'Impressionante! ' : '';
    const sectorComment = businessSector === 'Inteligência Artificial' ? 'Que coincidência incrível - você já está no futuro! ' : '';
    
    const aiMessage = `${firstName}, agora entendi melhor seu perfil! ${revenueComment}${sectorComment}Uma empresa de ${businessSector.toLowerCase()} com ${companySize.toLowerCase()} tem um potencial GIGANTE para implementar IA! Como ${position.toLowerCase()}, você está na posição perfeita para liderar essa transformação. Vamos descobrir agora onde você está na jornada da IA! 🤖✨`;

    onUpdateData({ 
      aiMessage2: aiMessage
    });
    onNext();
  };

  const handlePrev = () => {
    onPrev();
  };

  const companyNameError = getFieldError?.('companyName');
  const businessSectorError = getFieldError?.('businessSector');
  const companySizeError = getFieldError?.('companySize');
  const annualRevenueError = getFieldError?.('annualRevenue');
  const positionError = getFieldError?.('position');

  const canProceed = companyName.trim() && businessSector && companySize && annualRevenue && position;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage1 && (
        <AIMessageDisplay message={data.aiMessage1} />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 flex items-center justify-center"
          >
            <Building2 className="w-10 h-10 text-viverblue" />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-heading font-bold text-white"
          >
            Conte-nos sobre seu{' '}
            <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
              negócio! 💼
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Agora vamos entender melhor sua empresa para personalizar as soluções de IA 
            mais adequadas para seu perfil empresarial!
          </motion.p>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[#151823] border border-white/10 rounded-2xl p-8">
          <div className="space-y-8">
            {/* Seção de informações básicas da empresa */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-viverblue" />
                </div>
                Informações da Empresa
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-white">
                    Nome da empresa *
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da sua empresa"
                    className={`h-12 bg-[#181A2A] border-white/10 text-white ${companyNameError ? 'border-red-500' : ''}`}
                  />
                  {companyNameError && (
                    <p className="text-sm text-red-400">{companyNameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite" className="text-sm font-medium text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Site da empresa
                  </Label>
                  <Input
                    id="companyWebsite"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="www.suaempresa.com"
                    className="h-12 bg-[#181A2A] border-white/10 text-white"
                  />
                  <p className="text-xs text-neutral-400">
                    Opcional - nos ajuda a entender melhor seu negócio
                  </p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Setor/Segmento de atuação *
                  </Label>
                  <Select value={businessSector} onValueChange={setBusinessSector}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${businessSectorError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecione o setor da sua empresa" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10 max-h-60">
                      {businessSectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {businessSectorError && (
                    <p className="text-sm text-red-400">{businessSectorError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de tamanho e faturamento */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-viverblue" />
                </div>
                Porte da Empresa
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    Tamanho da empresa *
                  </Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${companySizeError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Número de funcionários" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {companySizeError && (
                    <p className="text-sm text-red-400">{companySizeError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Faturamento anual *
                  </Label>
                  <Select value={annualRevenue} onValueChange={setAnnualRevenue}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${annualRevenueError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecione o faturamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      {annualRevenues.map((revenue) => (
                        <SelectItem key={revenue} value={revenue}>
                          {revenue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {annualRevenueError && (
                    <p className="text-sm text-red-400">{annualRevenueError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de posição */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-viverblue" />
                </div>
                Sua Posição
              </h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Seu cargo/posição na empresa *
                </Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${positionError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {positionError && (
                  <p className="text-sm text-red-400">{positionError}</p>
                )}
                <p className="text-xs text-neutral-400">
                  Isso nos ajuda a personalizar as recomendações de IA para seu nível de decisão
                </p>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex items-center gap-2 h-12 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                size="lg"
                className="h-12 px-8 bg-viverblue hover:bg-viverblue-dark text-[#0F111A] text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Vamos falar sobre IA! 🤖
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-viverblue/5 border border-viverblue/20 rounded-xl p-4 text-center max-w-2xl mx-auto"
      >
        <p className="text-sm text-neutral-300">
          💡 <strong className="text-white">Etapa 2 de 5:</strong> Perfeito! Agora nossa IA já consegue visualizar 
          o potencial da sua empresa! 🚀
        </p>
      </motion.div>
    </div>
  );
};
