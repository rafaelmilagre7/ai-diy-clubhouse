
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
                <SelectItem value="agronegocio">Agronegócio</SelectItem>
                <SelectItem value="alimenticio">Alimentício</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="construcao">Construção</SelectItem>
                <SelectItem value="contabilidade">Contabilidade</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="e-commerce">E-commerce</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="entretenimento">Entretenimento</SelectItem>
                <SelectItem value="esportes">Esportes</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="imobiliario">Imobiliário</SelectItem>
                <SelectItem value="inteligencia-artificial">Inteligência Artificial</SelectItem>
                <SelectItem value="juridico">Jurídico</SelectItem>
                <SelectItem value="logistica">Logística</SelectItem>
                <SelectItem value="manufatura">Manufatura</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="recursos-humanos">Recursos Humanos</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="turismo">Turismo</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
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
                <SelectValue placeholder="Selecione o número de colaboradores" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="apenas-eu">Apenas eu (1 pessoa)</SelectItem>
                <SelectItem value="2-5">2-5 colaboradores</SelectItem>
                <SelectItem value="6-10">6-10 colaboradores</SelectItem>
                <SelectItem value="11-25">11-25 colaboradores</SelectItem>
                <SelectItem value="26-50">26-50 colaboradores</SelectItem>
                <SelectItem value="51-100">51-100 colaboradores</SelectItem>
                <SelectItem value="101-250">101-250 colaboradores</SelectItem>
                <SelectItem value="251-500">251-500 colaboradores</SelectItem>
                <SelectItem value="mais-500">Mais de 500 colaboradores</SelectItem>
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
                <SelectValue placeholder="Selecione a faixa de faturamento" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="ate-50k">Até R$ 50.000</SelectItem>
                <SelectItem value="50k-150k">R$ 50.001 - R$ 150.000</SelectItem>
                <SelectItem value="150k-300k">R$ 150.001 - R$ 300.000</SelectItem>
                <SelectItem value="300k-500k">R$ 300.001 - R$ 500.000</SelectItem>
                <SelectItem value="500k-1mi">R$ 500.001 - R$ 1.000.000</SelectItem>
                <SelectItem value="1mi-2-5mi">R$ 1.000.001 - R$ 2.500.000</SelectItem>
                <SelectItem value="2-5mi-5mi">R$ 2.500.001 - R$ 5.000.000</SelectItem>
                <SelectItem value="5mi-10mi">R$ 5.000.001 - R$ 10.000.000</SelectItem>
                <SelectItem value="acima-10mi">Acima de R$ 10.000.000</SelectItem>
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
            <Select value={data.position || ''} onValueChange={(value) => onUpdateData({ position: value })}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione seu cargo" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="ceo-presidente">CEO/Presidente</SelectItem>
                <SelectItem value="diretor">Diretor(a)</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="coordenador">Coordenador(a)</SelectItem>
                <SelectItem value="supervisor">Supervisor(a)</SelectItem>
                <SelectItem value="analista">Analista</SelectItem>
                <SelectItem value="assistente">Assistente</SelectItem>
                <SelectItem value="consultor">Consultor(a)</SelectItem>
                <SelectItem value="freelancer">Freelancer/Autônomo</SelectItem>
                <SelectItem value="proprietario">Proprietário/Sócio</SelectItem>
                <SelectItem value="empreendedor">Empreendedor</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
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
