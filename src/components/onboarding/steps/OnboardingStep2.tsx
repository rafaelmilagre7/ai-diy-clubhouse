
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, Briefcase, Users, DollarSign, Crown } from 'lucide-react';
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
  memberType 
}: OnboardingStepProps) => {
  const [companyName, setCompanyName] = useState(data.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState(data.companyWebsite || '');
  const [businessSector, setBusinessSector] = useState(data.businessSector || '');
  const [companySize, setCompanySize] = useState(data.companySize || '');
  const [annualRevenue, setAnnualRevenue] = useState(data.annualRevenue || '');
  const [position, setPosition] = useState(data.position || '');

  const handleNext = () => {
    // Gerar mensagem personalizada da IA baseada nas respostas
    const firstName = data.name?.split(' ')[0] || 'Amigo';
    const revenueComment = annualRevenue.includes('milhão') ? 'Impressionante! ' : '';
    const sectorComment = businessSector === 'Inteligência Artificial' ? 'Que coincidência incrível - você já está no futuro! ' : '';
    
    const aiMessage = `${firstName}, agora entendi melhor seu perfil! ${revenueComment}${sectorComment}Uma empresa de ${businessSector.toLowerCase()} com ${companySize.toLowerCase()} tem um potencial GIGANTE para implementar IA! Como ${position.toLowerCase()}, você está na posição perfeita para liderar essa transformação. Vamos descobrir agora onde você está na jornada da IA! 🤖✨`;

    onUpdateData({ 
      companyName,
      companyWebsite,
      businessSector,
      companySize,
      annualRevenue,
      position,
      aiMessage2: aiMessage
    });
    onNext();
  };

  const canProceed = companyName.trim() && businessSector && companySize && annualRevenue && position;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage1 && (
        <AIMessageDisplay message={data.aiMessage1} />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Building2 className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Conte-nos sobre seu negócio! 💼
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Agora vamos entender melhor sua empresa para personalizar as soluções de IA 
          mais adequadas para seu perfil empresarial!
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Nome da empresa *
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nome da sua empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Site da empresa (opcional)
            </Label>
            <Input
              id="companyWebsite"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="www.suaempresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Setor/Segmento de atuação *
            </Label>
            <Select value={businessSector} onValueChange={setBusinessSector}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {businessSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tamanho da empresa *
            </Label>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger>
                <SelectValue placeholder="Número de funcionários" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Faturamento anual *
            </Label>
            <Select value={annualRevenue} onValueChange={setAnnualRevenue}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o faturamento" />
              </SelectTrigger>
              <SelectContent>
                {annualRevenues.map((revenue) => (
                  <SelectItem key={revenue} value={revenue}>
                    {revenue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Seu cargo/posição na empresa *
            </Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu cargo" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6 disabled:opacity-50"
          >
            Vamos falar sobre IA! 🤖
          </Button>
        </motion.div>
      </motion.div>

      {/* Dica com progresso */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/20 rounded-lg p-4 text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 <strong>Etapa 2 de 5:</strong> Perfeito! Agora nossa IA já consegue visualizar 
          o potencial da sua empresa! 🚀
        </p>
      </motion.div>
    </div>
  );
};
