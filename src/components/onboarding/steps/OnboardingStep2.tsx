
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, User, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStepProps } from '../types/onboardingTypes';

const businessSectors = [
  'Tecnologia', 'Saúde', 'Educação', 'Varejo', 'Finanças', 'Marketing', 
  'Consultoria', 'Agricultura', 'Indústria', 'Serviços', 'E-commerce', 'Outro'
];

const companySizes = [
  'Apenas eu (freelancer/autônomo)',
  'Micro (2-9 funcionários)',
  'Pequena (10-49 funcionários)', 
  'Média (50-249 funcionários)',
  'Grande (250+ funcionários)'
];

const positions = [
  'CEO/Fundador', 'CTO/Diretor de Tecnologia', 'Gerente', 'Coordenador',
  'Analista', 'Consultor', 'Freelancer', 'Empresário', 'Outro'
];

const OnboardingStep2: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
  getFieldError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Building2 className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Seu Perfil Empresarial
        </h2>
        <p className="text-slate-400">
          Agora vamos conhecer mais sobre seu negócio e objetivos profissionais
        </p>
      </div>

      <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome da Empresa */}
          <div>
            <Label htmlFor="companyName" className="text-slate-200">
              Nome da Empresa/Negócio *
            </Label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="companyName"
                type="text"
                value={data.companyName || ''}
                onChange={(e) => onUpdateData({ companyName: e.target.value })}
                className="pl-10 bg-[#151823] border-white/20 text-white"
                placeholder="Nome da sua empresa"
              />
            </div>
            {getFieldError?.('companyName') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('companyName')}</p>
            )}
          </div>

          {/* Setor de Atuação */}
          <div>
            <Label htmlFor="businessSector" className="text-slate-200">
              Setor de Atuação *
            </Label>
            <Select value={data.businessSector || ''} onValueChange={(value) => onUpdateData({ businessSector: value })}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione seu setor" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                {businessSectors.map((sector) => (
                  <SelectItem key={sector} value={sector} className="text-white hover:bg-white/10">
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError?.('businessSector') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
            )}
          </div>

          {/* Cargo/Posição */}
          <div>
            <Label htmlFor="position" className="text-slate-200">
              Seu Cargo/Posição *
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Select value={data.position || ''} onValueChange={(value) => onUpdateData({ position: value })}>
                <SelectTrigger className="pl-10 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {positions.map((position) => (
                    <SelectItem key={position} value={position} className="text-white hover:bg-white/10">
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {getFieldError?.('position') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
            )}
          </div>

          {/* Tamanho da Empresa */}
          <div>
            <Label htmlFor="companySize" className="text-slate-200">
              Tamanho da Empresa *
            </Label>
            <Select value={data.companySize || ''} onValueChange={(value) => onUpdateData({ companySize: value })}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                {companySizes.map((size) => (
                  <SelectItem key={size} value={size} className="text-white hover:bg-white/10">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError?.('companySize') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('companySize')}</p>
            )}
          </div>

          {/* Faturamento Anual */}
          <div className="md:col-span-2">
            <Label htmlFor="annualRevenue" className="text-slate-200">
              Faturamento Anual Aproximado
            </Label>
            <div className="relative mt-1">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Select value={data.annualRevenue || ''} onValueChange={(value) => onUpdateData({ annualRevenue: value })}>
                <SelectTrigger className="pl-10 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a faixa de faturamento" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="0-50k" className="text-white hover:bg-white/10">Até R$ 50.000</SelectItem>
                  <SelectItem value="50k-100k" className="text-white hover:bg-white/10">R$ 50.000 - R$ 100.000</SelectItem>
                  <SelectItem value="100k-200k" className="text-white hover:bg-white/10">R$ 100.000 - R$ 200.000</SelectItem>
                  <SelectItem value="200k-500k" className="text-white hover:bg-white/10">R$ 200.000 - R$ 500.000</SelectItem>
                  <SelectItem value="500k-1M" className="text-white hover:bg-white/10">R$ 500.000 - R$ 1.000.000</SelectItem>
                  <SelectItem value="1M-2M" className="text-white hover:bg-white/10">R$ 1.000.000 - R$ 2.000.000</SelectItem>
                  <SelectItem value="2M-5M" className="text-white hover:bg-white/10">R$ 2.000.000 - R$ 5.000.000</SelectItem>
                  <SelectItem value="5M-10M" className="text-white hover:bg-white/10">R$ 5.000.000 - R$ 10.000.000</SelectItem>
                  <SelectItem value="10M-20M" className="text-white hover:bg-white/10">R$ 10.000.000 - R$ 20.000.000</SelectItem>
                  <SelectItem value="20M-50M" className="text-white hover:bg-white/10">R$ 20.000.000 - R$ 50.000.000</SelectItem>
                  <SelectItem value="50M+" className="text-white hover:bg-white/10">Acima de R$ 50.000.000</SelectItem>
                  <SelectItem value="confidential" className="text-white hover:bg-white/10">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default OnboardingStep2;
