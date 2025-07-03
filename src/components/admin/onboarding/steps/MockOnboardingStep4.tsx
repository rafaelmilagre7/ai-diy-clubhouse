
import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep4Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const mainObjectives = [
  'Aumentar produtividade e eficiência operacional',
  'Reduzir custos e otimizar processos',
  'Melhorar experiência e atendimento ao cliente',
  'Automatizar tarefas repetitivas',
  'Gerar insights estratégicos de dados',
  'Desenvolver novos produtos ou serviços',
  'Otimizar estratégias de marketing e vendas',
  'Aprimorar processo de tomada de decisões',
  'Inovar e se diferenciar no mercado',
  'Outros objetivos específicos'
];

const businessAreas = [
  'Atendimento ao Cliente',
  'Vendas e Comercial',
  'Marketing Digital',
  'Recursos Humanos',
  'Operações e Logística',
  'Financeiro e Contabilidade',
  'Tecnologia da Informação',
  'Produção e Manufatura',
  'Jurídico e Compliance',
  'Pesquisa e Desenvolvimento',
  'Administração Geral',
  'Outras áreas'
];

const resultTypes = [
  'Aumento de eficiência operacional',
  'Redução de custos',
  'Melhoria na qualidade do atendimento',
  'Aumento da satisfação do cliente',
  'Crescimento de receita',
  'Otimização de processos',
  'Redução de tempo de execução',
  'Melhoria na tomada de decisões',
  'Aumento da produtividade da equipe',
  'Outros resultados'
];

const metaPercentages = [
  '10% - 20%',
  '20% - 30%',
  '30% - 50%',
  'Acima de 50%',
  'Meta ainda não definida'
];

const implementationTimelines = [
  '1 - 3 meses',
  '3 - 6 meses',
  '6 - 12 meses',
  'Mais de 1 ano',
  'Sem prazo definido'
];

const urgencyLevels = [
  'Muito urgente (implementar imediatamente)',
  'Urgente (implementar em até 3 meses)',
  'Moderada (implementar em até 6 meses)',
  'Baixa (posso aguardar o momento ideal)',
  'Apenas planejando para o futuro'
];

const successMetrics = [
  'ROI (Retorno sobre Investimento)',
  'Redução de tempo em processos',
  'Aumento na satisfação do cliente',
  'Redução de custos operacionais',
  'Aumento da produtividade',
  'Melhoria na qualidade dos resultados',
  'Redução de erros humanos',
  'Velocidade de implementação',
  'Facilidade de uso pela equipe',
  'Outros indicadores'
];

const mainObstacles = [
  'Resistência da equipe à mudança',
  'Falta de conhecimento técnico interno',
  'Orçamento limitado',
  'Falta de tempo para implementação',
  'Dificuldade em escolher a solução certa',
  'Preocupações com segurança de dados',
  'Complexidade de integração com sistemas atuais',
  'Falta de apoio da liderança',
  'Outros obstáculos'
];

const supportTypes = [
  'Suporte completo (consultoria + implementação)',
  'Consultoria estratégica para direcionamento',
  'Treinamento da equipe interna',
  'Suporte técnico durante implementação',
  'Acompanhamento pós-implementação',
  'Prefiro implementar sozinho com materiais',
  'Ainda não sei que tipo de suporte preciso'
];

const budgetRanges = [
  'Até R$ 10.000',
  'R$ 10.000 - R$ 25.000',
  'R$ 25.000 - R$ 50.000',
  'R$ 50.000 - R$ 100.000',
  'R$ 100.000 - R$ 250.000',
  'Acima de R$ 250.000',
  'Orçamento a definir'
];

const MockOnboardingStep4: React.FC<MockOnboardingStep4Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Target className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Objetivos Estratégicos
        </h2>
        <p className="text-slate-400">
          Defina seus objetivos para criar uma estratégia de implementação personalizada
        </p>
      </div>

      <div className="space-y-8">
        {/* Objetivos Principais */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Objetivos Principais</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual o principal objetivo da sua empresa com IA? *
              </Label>
              <Select 
                value={data.mainObjective || ''} 
                onValueChange={(value) => onUpdateData({ mainObjective: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione o objetivo estratégico principal" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {mainObjectives.map((objective) => (
                    <SelectItem key={objective} value={objective} className="text-white hover:bg-slate-700">
                      {objective}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('mainObjective') && (
                <p className="text-red-400 text-sm">{getFieldError('mainObjective')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual área do negócio será impactada prioritariamente? *
              </Label>
              <Select 
                value={data.areaToImpact || ''} 
                onValueChange={(value) => onUpdateData({ areaToImpact: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione a área de negócio prioritária" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {businessAreas.map((area) => (
                    <SelectItem key={area} value={area} className="text-white hover:bg-slate-700">
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
        </Card>

        {/* Expectativas e Resultados */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Expectativas de Resultados</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual tipo de resultado espera alcançar nos primeiros 90 dias? *
              </Label>
              <Select 
                value={data.expectedResult90Days || ''} 
                onValueChange={(value) => onUpdateData({ expectedResult90Days: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione o tipo de resultado esperado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {resultTypes.map((result) => (
                    <SelectItem key={result} value={result} className="text-white hover:bg-slate-700">
                      {result}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('expectedResult90Days') && (
                <p className="text-red-400 text-sm">{getFieldError('expectedResult90Days')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual a meta percentual de melhoria esperada?
              </Label>
              <Select 
                value={data.expectedResultPercentage || ''} 
                onValueChange={(value) => onUpdateData({ expectedResultPercentage: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione a meta de melhoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {metaPercentages.map((percentage) => (
                    <SelectItem key={percentage} value={percentage} className="text-white hover:bg-slate-700">
                      {percentage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Cronograma e Urgência */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Cronograma de Implementação</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual o prazo ideal para implementação? *
              </Label>
              <Select 
                value={data.implementationTimeline || ''} 
                onValueChange={(value) => onUpdateData({ implementationTimeline: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione o prazo desejado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {implementationTimelines.map((timeline) => (
                    <SelectItem key={timeline} value={timeline} className="text-white hover:bg-slate-700">
                      {timeline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('implementationTimeline') && (
                <p className="text-red-400 text-sm">{getFieldError('implementationTimeline')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual o nível de urgência desta implementação? *
              </Label>
              <Select 
                value={data.urgencyLevel || ''} 
                onValueChange={(value) => onUpdateData({ urgencyLevel: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione o nível de urgência" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level} value={level} className="text-white hover:bg-slate-700">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('urgencyLevel') && (
                <p className="text-red-400 text-sm">{getFieldError('urgencyLevel')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Métricas de Sucesso */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Definição de Sucesso</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual métrica é mais importante para medir o sucesso? *
              </Label>
              <Select 
                value={data.successMetric || ''} 
                onValueChange={(value) => onUpdateData({ successMetric: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione a métrica principal de sucesso" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {successMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric} className="text-white hover:bg-slate-700">
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('successMetric') && (
                <p className="text-red-400 text-sm">{getFieldError('successMetric')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Obstáculos e Suporte */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Desafios e Suporte</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual o principal obstáculo que você antecipa? *
              </Label>
              <Select 
                value={data.mainObstacle || ''} 
                onValueChange={(value) => onUpdateData({ mainObstacle: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione o principal desafio" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {mainObstacles.map((obstacle) => (
                    <SelectItem key={obstacle} value={obstacle} className="text-white hover:bg-slate-700">
                      {obstacle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('mainObstacle') && (
                <p className="text-red-400 text-sm">{getFieldError('mainObstacle')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Que tipo de suporte você prefere? *
              </Label>
              <Select 
                value={data.preferredSupport || ''} 
                onValueChange={(value) => onUpdateData({ preferredSupport: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione o tipo de suporte preferido" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {supportTypes.map((support) => (
                    <SelectItem key={support} value={support} className="text-white hover:bg-slate-700">
                      {support}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('preferredSupport') && (
                <p className="text-red-400 text-sm">{getFieldError('preferredSupport')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Investimento */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Investimento Disponível</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual o orçamento disponível para implementação de IA? *
              </Label>
              <Select 
                value={data.aiImplementationBudget || ''} 
                onValueChange={(value) => onUpdateData({ aiImplementationBudget: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione a faixa de investimento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {budgetRanges.map((budget) => (
                    <SelectItem key={budget} value={budget} className="text-white hover:bg-slate-700">
                      {budget}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('aiImplementationBudget') && (
                <p className="text-red-400 text-sm">{getFieldError('aiImplementationBudget')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep4;
