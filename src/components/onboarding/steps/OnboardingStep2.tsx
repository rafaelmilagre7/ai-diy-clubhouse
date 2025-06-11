
import React from 'react';
import { motion } from 'framer-motion';
import { Building, Globe, User, DollarSign, Users, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { Step2AIInteraction } from '../components/Step2AIInteraction';

const OnboardingStep2: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Interação de IA no topo */}
      <Step2AIInteraction 
        data={data} 
        memberType={data.memberType || 'club'} 
      />

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Building className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Perfil Empresarial
        </h2>
        <p className="text-slate-400">
          Conte-nos sobre sua empresa e posição no mercado
        </p>
      </div>

      <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome da Empresa */}
          <div>
            <Label htmlFor="companyName" className="text-slate-200">
              Nome da Empresa *
            </Label>
            <div className="relative mt-1">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
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

          {/* Website da Empresa */}
          <div>
            <Label htmlFor="companyWebsite" className="text-slate-200">
              Website da Empresa
            </Label>
            <div className="relative mt-1">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="companyWebsite"
                type="url"
                value={data.companyWebsite || ''}
                onChange={(e) => onUpdateData({ companyWebsite: e.target.value })}
                className="pl-10 bg-[#151823] border-white/20 text-white"
                placeholder="https://suaempresa.com.br"
              />
            </div>
          </div>

          {/* Setor de Atuação */}
          <div>
            <Label htmlFor="businessSector" className="text-slate-200">
              Setor de Atuação *
            </Label>
            <Select value={data.businessSector || ''} onValueChange={(value) => onUpdateData({ businessSector: value })}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="manufatura">Manufatura</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="agronegocio">Agronegócio</SelectItem>
                <SelectItem value="logistica">Logística</SelectItem>
                <SelectItem value="construcao">Construção</SelectItem>
                <SelectItem value="alimenticio">Alimentício</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('businessSector') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
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
                <SelectItem value="mei">MEI (1 pessoa)</SelectItem>
                <SelectItem value="micro">Microempresa (2-9 funcionários)</SelectItem>
                <SelectItem value="pequena">Pequena empresa (10-49 funcionários)</SelectItem>
                <SelectItem value="media">Média empresa (50-249 funcionários)</SelectItem>
                <SelectItem value="grande">Grande empresa (250+ funcionários)</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('companySize') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('companySize')}</p>
            )}
          </div>

          {/* Faturamento Anual */}
          <div>
            <Label htmlFor="annualRevenue" className="text-slate-200">
              Faturamento Anual *
            </Label>
            <Select value={data.annualRevenue || ''} onValueChange={(value) => onUpdateData({ annualRevenue: value })}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="ate-81k">Até R$ 81.000</SelectItem>
                <SelectItem value="81k-360k">R$ 81.001 - R$ 360.000</SelectItem>
                <SelectItem value="360k-4-8mi">R$ 360.001 - R$ 4.800.000</SelectItem>
                <SelectItem value="4-8mi-300mi">R$ 4.800.001 - R$ 300.000.000</SelectItem>
                <SelectItem value="acima-300mi">Acima de R$ 300.000.000</SelectItem>
                <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('annualRevenue') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('annualRevenue')}</p>
            )}
          </div>

          {/* Cargo/Posição */}
          <div>
            <Label htmlFor="position" className="text-slate-200">
              Seu Cargo/Posição *
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="position"
                type="text"
                value={data.position || ''}
                onChange={(e) => onUpdateData({ position: e.target.value })}
                className="pl-10 bg-[#151823] border-white/20 text-white"
                placeholder="CEO, Diretor, Gerente, etc."
              />
            </div>
            {getFieldError?.('position') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default OnboardingStep2;
