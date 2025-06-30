
import React from 'react';
import { motion } from 'framer-motion';
import { Building, Globe, Users, Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { validateWebsite, normalizeWebsiteUrl } from '@/utils/professionalDataValidation';

export const OnboardingStep2: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  validationErrors = [],
  getFieldError
}) => {
  const handleInputChange = (field: string, value: string) => {
    if (field === 'companyWebsite') {
      onUpdateData({ [field]: normalizeWebsiteUrl(value) });
    } else {
      onUpdateData({ [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Building className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-3xl font-heading font-bold text-white">
          Conte sobre sua empresa
        </h2>
        <p className="text-neutral-300">
          Essas informações nos ajudam a personalizar sua experiência
        </p>
      </div>

      <div className="grid gap-6">
        {/* Nome da Empresa */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <Building className="w-4 h-4" />
            Nome da empresa *
          </Label>
          <Input
            placeholder="Ex: Viver de IA"
            value={data.companyName || ''}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className="bg-[#151823] border-white/20 text-white placeholder:text-neutral-500"
          />
          {getFieldError && getFieldError('companyName') && (
            <p className="text-sm text-red-400">{getFieldError('companyName')}</p>
          )}
        </div>

        {/* Website da Empresa */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Website da empresa
          </Label>
          <Input
            placeholder="Ex: www.viverdeai.com.br"
            value={data.companyWebsite || ''}
            onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
            className="bg-[#151823] border-white/20 text-white placeholder:text-neutral-500"
          />
          {getFieldError && getFieldError('companyWebsite') && (
            <p className="text-sm text-red-400">{getFieldError('companyWebsite')}</p>
          )}
        </div>

        {/* Setor */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Setor da empresa *
          </Label>
          <Select value={data.businessSector || ''} onValueChange={(value) => handleInputChange('businessSector', value)}>
            <SelectTrigger className="bg-[#151823] border-white/20 text-white">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnologia">Tecnologia</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="consultoria">Consultoria</SelectItem>
              <SelectItem value="manufatura">Manufatura</SelectItem>
              <SelectItem value="alimenticio">Alimentício</SelectItem>
              <SelectItem value="construcao">Construção</SelectItem>
              <SelectItem value="imobiliario">Imobiliário</SelectItem>
              <SelectItem value="juridico">Jurídico</SelectItem>
              <SelectItem value="agronegocio">Agronegócio</SelectItem>
              <SelectItem value="logistica">Logística</SelectItem>
              <SelectItem value="energia">Energia</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError && getFieldError('businessSector') && (
            <p className="text-sm text-red-400">{getFieldError('businessSector')}</p>
          )}
        </div>

        {/* Tamanho da Empresa */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <Users className="w-4 h-4" />
            Número de colaboradores *
          </Label>
          <Select value={data.companySize || ''} onValueChange={(value) => handleInputChange('companySize', value)}>
            <SelectTrigger className="bg-[#151823] border-white/20 text-white">
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-colaborador">Apenas eu (1 colaborador)</SelectItem>
              <SelectItem value="2-5-colaboradores">2 a 5 colaboradores</SelectItem>
              <SelectItem value="6-10-colaboradores">6 a 10 colaboradores</SelectItem>
              <SelectItem value="11-20-colaboradores">11 a 20 colaboradores</SelectItem>
              <SelectItem value="21-50-colaboradores">21 a 50 colaboradores</SelectItem>
              <SelectItem value="51-100-colaboradores">51 a 100 colaboradores</SelectItem>
              <SelectItem value="101-250-colaboradores">101 a 250 colaboradores</SelectItem>
              <SelectItem value="251-500-colaboradores">251 a 500 colaboradores</SelectItem>
              <SelectItem value="501-1000-colaboradores">501 a 1.000 colaboradores</SelectItem>
              <SelectItem value="1001-5000-colaboradores">1.001 a 5.000 colaboradores</SelectItem>
              <SelectItem value="5001-colaboradores">Mais de 5.000 colaboradores</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError && getFieldError('companySize') && (
            <p className="text-sm text-red-400">{getFieldError('companySize')}</p>
          )}
        </div>

        {/* Faturamento Anual */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Faturamento anual *
          </Label>
          <Select value={data.annualRevenue || ''} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
            <SelectTrigger className="bg-[#151823] border-white/20 text-white">
              <SelectValue placeholder="Selecione a faixa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ate-100k">Até R$ 100 mil</SelectItem>
              <SelectItem value="100k-500k">R$ 100 mil a R$ 500 mil</SelectItem>
              <SelectItem value="500k-1mi">R$ 500 mil a R$ 1 milhão</SelectItem>
              <SelectItem value="1mi-5mi">R$ 1 milhão a R$ 5 milhões</SelectItem>
              <SelectItem value="5mi-10mi">R$ 5 milhões a R$ 10 milhões</SelectItem>
              <SelectItem value="10mi-50mi">R$ 10 milhões a R$ 50 milhões</SelectItem>
              <SelectItem value="50mi-100mi">R$ 50 milhões a R$ 100 milhões</SelectItem>
              <SelectItem value="acima-100mi">Acima de R$ 100 milhões</SelectItem>
              <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError && getFieldError('annualRevenue') && (
            <p className="text-sm text-red-400">{getFieldError('annualRevenue')}</p>
          )}
        </div>

        {/* Cargo/Posição */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Seu cargo/posição *
          </Label>
          <Select value={data.position || ''} onValueChange={(value) => handleInputChange('position', value)}>
            <SelectTrigger className="bg-[#151823] border-white/20 text-white">
              <SelectValue placeholder="Selecione sua posição" />
            </SelectTrigger>
            <SelectContent>
              {/* C-Level & Executivos */}
              <SelectItem value="ceo">CEO/Presidente</SelectItem>
              <SelectItem value="cfo">CFO/Diretor Financeiro</SelectItem>
              <SelectItem value="coo">COO/Diretor de Operações</SelectItem>
              <SelectItem value="cto">CTO/Diretor de Tecnologia</SelectItem>
              <SelectItem value="cmo">CMO/Diretor de Marketing</SelectItem>
              <SelectItem value="chro">CHRO/Diretor de RH</SelectItem>
              <SelectItem value="cpo">CPO/Diretor de Produto</SelectItem>
              <SelectItem value="cso">CSO/Diretor de Vendas</SelectItem>
              <SelectItem value="cdo">CDO/Diretor de Dados</SelectItem>
              <SelectItem value="cio">CIO/Diretor de TI</SelectItem>
              
              {/* Diretoria & VP */}
              <SelectItem value="vp">Vice-Presidente</SelectItem>
              <SelectItem value="diretor-executivo">Diretor Executivo</SelectItem>
              <SelectItem value="diretor-regional">Diretor Regional</SelectItem>
              <SelectItem value="diretor-area">Diretor de Área</SelectItem>
              <SelectItem value="diretor-comercial">Diretor Comercial</SelectItem>
              <SelectItem value="diretor-administrativo">Diretor Administrativo</SelectItem>
              
              {/* Gerência */}
              <SelectItem value="gerente-geral">Gerente Geral</SelectItem>
              <SelectItem value="gerente-vendas">Gerente de Vendas</SelectItem>
              <SelectItem value="gerente-marketing">Gerente de Marketing</SelectItem>
              <SelectItem value="gerente-operacoes">Gerente de Operações</SelectItem>
              <SelectItem value="gerente-ti">Gerente de TI</SelectItem>
              <SelectItem value="gerente-produto">Gerente de Produto</SelectItem>
              <SelectItem value="gerente-projeto">Gerente de Projeto</SelectItem>
              <SelectItem value="gerente-financeiro">Gerente Financeiro</SelectItem>
              <SelectItem value="gerente-rh">Gerente de RH</SelectItem>
              
              {/* Coordenação & Supervisão */}
              <SelectItem value="coordenador">Coordenador</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="team-leader">Team Leader</SelectItem>
              <SelectItem value="lider-tecnico">Líder Técnico</SelectItem>
              <SelectItem value="scrum-master">Scrum Master</SelectItem>
              
              {/* Especialistas & Analistas */}
              <SelectItem value="especialista-senior">Especialista Sênior</SelectItem>
              <SelectItem value="consultor-senior">Consultor Sênior</SelectItem>
              <SelectItem value="arquiteto-solucoes">Arquiteto de Soluções</SelectItem>
              <SelectItem value="product-owner">Product Owner</SelectItem>
              <SelectItem value="analista-senior">Analista Sênior</SelectItem>
              <SelectItem value="analista-pleno">Analista Pleno</SelectItem>
              <SelectItem value="analista-junior">Analista Júnior</SelectItem>
              <SelectItem value="desenvolvedor-senior">Desenvolvedor Sênior</SelectItem>
              <SelectItem value="desenvolvedor-pleno">Desenvolvedor Pleno</SelectItem>
              <SelectItem value="desenvolvedor-junior">Desenvolvedor Júnior</SelectItem>
              
              {/* Outros */}
              <SelectItem value="empresario">Empresário/Sócio</SelectItem>
              <SelectItem value="freelancer">Freelancer/Autônomo</SelectItem>
              <SelectItem value="consultor">Consultor</SelectItem>
              <SelectItem value="estagiario">Estagiário</SelectItem>
              <SelectItem value="estudante">Estudante</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError && getFieldError('position') && (
            <p className="text-sm text-red-400">{getFieldError('position')}</p>
          )}
        </div>
      </div>
    </div>
  );
};
