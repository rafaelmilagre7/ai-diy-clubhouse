
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Briefcase, Target } from 'lucide-react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { generateAIMessage } from '../utils/aiMessageGenerator';

const businessSectors = [
  'Inteligência Artificial',
  'Tecnologia da Informação',
  'E-commerce',
  'Marketing Digital',
  'Consultoria Empresarial',
  'Educação',
  'Saúde e Medicina',
  'Varejo',
  'Serviços Financeiros',
  'Manufatura',
  'Agronegócio',
  'Construção Civil',
  'Alimentação',
  'Turismo e Hospitalidade',
  'Logística e Transporte',
  'Imobiliário',
  'Jurídico',
  'Recursos Humanos',
  'Contabilidade',
  'Design e Criatividade',
  'Outro'
];

const positions = [
  'CEO/Fundador',
  'Diretor',
  'Gerente',
  'Coordenador',
  'Analista',
  'Consultor',
  'Especialista',
  'Desenvolvedor',
  'Designer',
  'Profissional Liberal',
  'Estudante',
  'Empreendedor',
  'Freelancer',
  'Outro'
];

const areasToImpact = [
  'Marketing e Vendas',
  'Atendimento ao Cliente',
  'Recursos Humanos',
  'Finanças',
  'Operações',
  'Produção',
  'Logística',
  'Desenvolvimento de Produtos',
  'Pesquisa e Desenvolvimento',
  'Educação e Treinamento',
  'Análise de Dados',
  'Automação de Processos',
  'Outro'
];

export const OnboardingStep2 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  onPrev, 
  memberType,
  getFieldError 
}: OnboardingStepProps) => {
  const [formData, setFormData] = useState({
    businessSector: data.businessSector || '',
    position: data.position || '',
    areaToImpact: data.areaToImpact || ''
  });

  const [showAIMessage, setShowAIMessage] = useState(false);

  useEffect(() => {
    // Mostrar mensagem da IA após preenchimento
    const hasBasicInfo = formData.businessSector && formData.position;
    if (hasBasicInfo && !showAIMessage) {
      const timer = setTimeout(() => {
        setShowAIMessage(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formData.businessSector, formData.position, showAIMessage]);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdateData(newData);
  };

  const getTitle = () => {
    if (memberType === 'formacao') {
      return (
        <>
          Seu{' '}
          <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
            Perfil de Mercado 💼
          </span>
        </>
      );
    }
    return (
      <>
        Seu{' '}
        <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
          Perfil Empresarial 💼
        </span>
      </>
    );
  };

  const getSubtitle = () => {
    if (memberType === 'formacao') {
      return "Vamos entender sua área de atuação para personalizar sua formação em IA!";
    }
    return "Vamos entender sua empresa para criar soluções de IA personalizadas!";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-heading font-bold text-white">
          {getTitle()}
        </h1>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          {getSubtitle()}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-[#151823] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-viverblue/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-viverblue" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white">
                {memberType === 'formacao' ? 'Perfil de Mercado' : 'Perfil Empresarial'}
              </h3>
            </div>

            {/* Setor/Segmento */}
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Setor/segmento de atuação *
              </Label>
              <Select value={formData.businessSector} onValueChange={(value) => handleInputChange('businessSector', value)}>
                <SelectTrigger className="bg-[#0F111A] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu setor de atuação" />
                </SelectTrigger>
                <SelectContent>
                  {businessSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('businessSector') && (
                <p className="text-red-400 text-sm">{getFieldError('businessSector')}</p>
              )}
            </div>

            {/* Cargo/Posição */}
            <div className="space-y-2">
              <Label className="text-neutral-300">
                Seu cargo/posição *
              </Label>
              <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                <SelectTrigger className="bg-[#0F111A] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu cargo/posição" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('position') && (
                <p className="text-red-400 text-sm">{getFieldError('position')}</p>
              )}
            </div>

            {/* Área para implementar IA */}
            <div className="space-y-2">
              <Label className="text-neutral-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Qual área você gostaria de implementar IA? *
              </Label>
              <Select value={formData.areaToImpact} onValueChange={(value) => handleInputChange('areaToImpact', value)}>
                <SelectTrigger className="bg-[#0F111A] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a área de interesse" />
                </SelectTrigger>
                <SelectContent>
                  {areasToImpact.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('areaToImpact') && (
                <p className="text-red-400 text-sm">{getFieldError('areaToImpact')}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mensagem da IA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {showAIMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <AIMessageDisplay 
                message={generateAIMessage(2, { ...data, ...formData }, memberType)}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-viverblue/10 border border-viverblue/30 rounded-xl p-6"
          >
            <h4 className="font-semibold text-viverblue mb-3">
              {memberType === 'formacao' ? '🎯 Como personalizamos sua formação:' : '🎯 Como personalizamos para você:'}
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              {memberType === 'formacao' ? (
                <>
                  <li>• Conteúdo específico para sua área de atuação</li>
                  <li>• Projetos práticos do seu setor</li>
                  <li>• Casos de sucesso similares ao seu perfil</li>
                  <li>• Mentoria direcionada para seus objetivos</li>
                </>
              ) : (
                <>
                  <li>• Soluções de IA específicas para seu setor</li>
                  <li>• Cases de sucesso da sua área</li>
                  <li>• Estratégias personalizadas para seu cargo</li>
                  <li>• ROI calculado para sua realidade</li>
                </>
              )}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Navegação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex justify-between pt-6"
      >
        <Button 
          onClick={onPrev}
          variant="outline"
          size="lg"
          className="px-8 py-3 text-lg"
        >
          ← Voltar
        </Button>
        
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-viverblue hover:bg-viverblue-dark text-[#0F111A] px-8 py-3 text-lg font-semibold rounded-xl"
        >
          Continuar →
        </Button>
      </motion.div>
    </div>
  );
};
