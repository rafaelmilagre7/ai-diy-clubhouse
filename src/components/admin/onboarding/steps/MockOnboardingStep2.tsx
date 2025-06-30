
import React from 'react';
import { motion } from 'framer-motion';
import { Building, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const businessSectors = [
  'Tecnologia e Software',
  'E-commerce e Varejo',
  'Serviços Financeiros',
  'Saúde e Medicina',
  'Educação',
  'Marketing e Publicidade',
  'Consultoria',
  'Manufatura e Indústria',
  'Imobiliário',
  'Alimentação e Bebidas',
  'Turismo e Hotelaria',
  'Transporte e Logística',
  'Energia e Sustentabilidade',
  'Mídia e Entretenimento',
  'Construção Civil',
  'Agricultura',
  'Farmacêutico',
  'Telecomunicações',
  'Seguros',
  'Recursos Humanos',
  'Jurídico',
  'Contabilidade',
  'Arquitetura e Design',
  'Automotive',
  'Outros'
];

const companySizes = [
  '1-10 colaboradores (Microempresa)',
  '11-50 colaboradores (Pequena)',
  '51-200 colaboradores (Média)',
  '201-500 colaboradores (Média-Grande)',
  '501-1000 colaboradores (Grande)',
  '1001-5000 colaboradores (Grande)',
  '5000+ colaboradores (Multinacional)',
  'Freelancer/Autônomo',
  'Sou estudante'
];

const annualRevenues = [
  'Até R$ 360 mil (MEI)',
  'R$ 360 mil - R$ 4,8 milhões (Microempresa)',
  'R$ 4,8 milhões - R$ 16 milhões (Pequena)',
  'R$ 16 milhões - R$ 90 milhões (Média)',
  'R$ 90 milhões - R$ 300 milhões (Média-Grande)',
  'Acima de R$ 300 milhões (Grande)',
  'Prefiro não informar',
  'Não se aplica'
];

const positions = [
  // C-Level e Diretoria
  'CEO/Fundador(a)',
  'CTO/Diretor(a) de Tecnologia',
  'CMO/Diretor(a) de Marketing',
  'CFO/Diretor(a) Financeiro(a)',
  'COO/Diretor(a) de Operações',
  'CPO/Diretor(a) de Produto',
  'CHRO/Diretor(a) de RH',
  'Diretor(a) Comercial',
  'Diretor(a) Geral',
  
  // Gerência e Coordenação
  'Gerente de Projetos',
  'Gerente de Marketing',
  'Gerente de Vendas',
  'Gerente de TI',
  'Gerente de Operações',
  'Gerente de Produto',
  'Coordenador(a) de Marketing',
  'Coordenador(a) de Vendas',
  'Coordenador(a) de TI',
  
  // Especialistas e Analistas
  'Analista de Marketing',
  'Analista de Dados',
  'Analista de Sistemas',
  'Analista Financeiro',
  'Analista de RH',
  'Especialista em Marketing Digital',
  'Especialista em IA',
  'Especialista em Automação',
  'Product Owner',
  'Scrum Master',
  
  // Desenvolvimento e TI
  'Desenvolvedor(a) Full Stack',
  'Desenvolvedor(a) Frontend',
  'Desenvolvedor(a) Backend',
  'DevOps Engineer',
  'Data Scientist',
  'UX/UI Designer',
  'Arquiteto(a) de Software',
  
  // Vendas e Relacionamento
  'Vendedor(a)',
  'Representante Comercial',
  'Account Manager',
  'Customer Success',
  'SDR/BDR',
  'Consultor(a) de Vendas',
  
  // Criação e Conteúdo
  'Designer Gráfico',
  'Redator(a)/Copywriter',
  'Social Media',
  'Produtor(a) de Conteúdo',
  'Editor(a) de Vídeo',
  
  // Consultoria e Freelance
  'Consultor(a) Independente',
  'Freelancer',
  'Coach/Mentor',
  
  // Outros
  'Estudante',
  'Estagiário(a)',
  'Assistente Administrativo',
  'Outro'
];

const MockOnboardingStep2: React.FC<MockOnboardingStep2Props> = ({
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
          Conte-nos sobre sua empresa e posição
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações da Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-200 text-base font-medium">
                  Nome da empresa *
                </Label>
                <Input
                  type="text"
                  value={data.companyName || ''}
                  onChange={(e) => onUpdateData({ companyName: e.target.value })}
                  className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                  placeholder="Nome da sua empresa"
                />
                {getFieldError?.('companyName') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('companyName')}</p>
                )}
              </div>

              <div>
                <Label className="text-slate-200 text-base font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website (opcional)
                </Label>
                <Input
                  type="url"
                  value={data.companyWebsite || ''}
                  onChange={(e) => onUpdateData({ companyWebsite: e.target.value })}
                  className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                  placeholder="https://suaempresa.com"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Setor de atuação *
              </Label>
              <Select 
                value={data.businessSector || ''} 
                onValueChange={(value) => onUpdateData({ businessSector: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o setor" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-200 text-base font-medium">
                  Tamanho da empresa *
                </Label>
                <Select 
                  value={data.companySize || ''} 
                  onValueChange={(value) => onUpdateData({ companySize: value })}
                >
                  <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
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

              <div>
                <Label className="text-slate-200 text-base font-medium">
                  Faturamento anual *
                </Label>
                <Select 
                  value={data.annualRevenue || ''} 
                  onValueChange={(value) => onUpdateData({ annualRevenue: value })}
                >
                  <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione a faixa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/20">
                    {annualRevenues.map((revenue) => (
                      <SelectItem key={revenue} value={revenue} className="text-white hover:bg-white/10">
                        {revenue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('annualRevenue') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('annualRevenue')}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Seu cargo/posição *
              </Label>
              <Select 
                value={data.position || ''} 
                onValueChange={(value) => onUpdateData({ position: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
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
              {getFieldError?.('position') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep2;
