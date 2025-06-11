
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '../types/onboardingTypes';
import { Building2, Globe, Users, DollarSign, Briefcase } from 'lucide-react';

interface OnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => Promise<void>;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  data,
  onUpdateData,
  validationErrors,
  getFieldError
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-viverblue" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">
          Perfil Empresarial
        </h1>
        
        <p className="text-xl text-slate-300">
          Conte-nos sobre sua empresa e posição
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1A1E2E] rounded-xl p-6 border border-white/10 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-white flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Nome da Empresa
            </Label>
            <Input
              id="companyName"
              type="text"
              value={data.companyName || ''}
              onChange={(e) => onUpdateData({ companyName: e.target.value })}
              placeholder="Ex: Minha Empresa LTDA"
              className="bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
            />
            {getFieldError('companyName') && (
              <p className="text-red-400 text-sm">{getFieldError('companyName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite" className="text-white flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website da Empresa
            </Label>
            <Input
              id="companyWebsite"
              type="url"
              value={data.companyWebsite || ''}
              onChange={(e) => onUpdateData({ companyWebsite: e.target.value })}
              placeholder="Ex: https://minhaempresa.com"
              className="bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessSector" className="text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Setor/Segmento *
            </Label>
            <Select value={data.businessSector || ''} onValueChange={(value) => onUpdateData({ businessSector: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="manufatura">Manufatura</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('businessSector') && (
              <p className="text-red-400 text-sm">{getFieldError('businessSector')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize" className="text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tamanho da Empresa
            </Label>
            <Select value={data.companySize || ''} onValueChange={(value) => onUpdateData({ companySize: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Número de funcionários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 funcionários</SelectItem>
                <SelectItem value="11-50">11-50 funcionários</SelectItem>
                <SelectItem value="51-200">51-200 funcionários</SelectItem>
                <SelectItem value="201-1000">201-1000 funcionários</SelectItem>
                <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualRevenue" className="text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Faturamento Anual
            </Label>
            <Select value={data.annualRevenue || ''} onValueChange={(value) => onUpdateData({ annualRevenue: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Faixa de faturamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ate-100k">Até R$ 100.000</SelectItem>
                <SelectItem value="100k-500k">R$ 100.000 - R$ 500.000</SelectItem>
                <SelectItem value="500k-1m">R$ 500.000 - R$ 1.000.000</SelectItem>
                <SelectItem value="1m-5m">R$ 1.000.000 - R$ 5.000.000</SelectItem>
                <SelectItem value="5m+">Acima de R$ 5.000.000</SelectItem>
                <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Seu Cargo/Posição *
            </Label>
            <Select value={data.position || ''} onValueChange={(value) => onUpdateData({ position: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione seu cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ceo">CEO/Presidente</SelectItem>
                <SelectItem value="diretor">Diretor</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="coordenador">Coordenador</SelectItem>
                <SelectItem value="analista">Analista</SelectItem>
                <SelectItem value="especialista">Especialista</SelectItem>
                <SelectItem value="consultor">Consultor</SelectItem>
                <SelectItem value="empreendedor">Empreendedor</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('position') && (
              <p className="text-red-400 text-sm">{getFieldError('position')}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingStep2;
