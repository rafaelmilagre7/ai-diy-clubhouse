import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimpleOnboardingStep4Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  onDataChange?: (data: any) => void;
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

export const SimpleOnboardingStep4: React.FC<SimpleOnboardingStep4Props> = ({
  data,
  onNext,
  isLoading = false,
  onDataChange
}) => {
  const [formData, setFormData] = useState({
    mainObjective: data.goals_info?.mainObjective || '',
    areaToImpact: data.goals_info?.areaToImpact || '',
    expectedResult90Days: data.goals_info?.expectedResult90Days || '',
    urgencyLevel: data.goals_info?.urgencyLevel || '',
    successMetric: data.goals_info?.successMetric || '',
    mainObstacle: data.goals_info?.mainObstacle || '',
    preferredSupport: data.goals_info?.preferredSupport || '',
    aiImplementationBudget: data.goals_info?.aiImplementationBudget || '',
    ...data.goals_info
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Notificar mudanças para auto-save do componente pai
      if (onDataChange) {
        onDataChange(newFormData);
      }
      
      return newFormData;
    });
  };

  const handleNext = () => {
    // Enviar dados estruturados para o wizard
    onNext({ goals_info: formData });
  };

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
          className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25"
        >
          <Target className="w-10 h-10 text-primary animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Seus Objetivos de Impacto
        </h2>
        <p className="text-muted-foreground text-lg">
          Agora vamos definir exatamente onde você quer chegar com a IA
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Cada objetivo que você compartilha molda suas recomendações personalizadas
        </p>
      </div>

      <div className="space-y-8">
        {/* Objetivos Principais */}
        <Card className="p-8 bg-gradient-to-br from-card/60 to-muted/30 border border-border backdrop-blur-sm shadow-xl">
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Sua Meta Principal</h3>
                <p className="text-muted-foreground text-sm">O que mais te motiva a implementar IA?</p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-foreground text-lg font-medium">
                Qual resultado você mais deseja alcançar com IA? *
              </Label>
              <p className="text-muted-foreground text-sm">Seja específico - isso me ajuda a priorizar suas recomendações</p>
              <Select 
                value={formData.mainObjective} 
                onValueChange={(value) => handleInputChange('mainObjective', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary hover:border-primary/50 transition-all duration-300 h-14">
                  <SelectValue placeholder="Escolha sua meta de transformação..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {mainObjectives.map((objective) => (
                    <SelectItem key={objective} value={objective} className="text-foreground hover:bg-muted">
                      {objective}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-foreground text-lg font-medium">
                Que área do seu negócio vai sentir o maior impacto? *
              </Label>
              <p className="text-muted-foreground text-sm">Vamos focar onde você pode gerar mais resultados</p>
              <Select 
                value={formData.areaToImpact} 
                onValueChange={(value) => handleInputChange('areaToImpact', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary hover:border-primary/50 transition-all duration-300 h-14">
                  <SelectValue placeholder="Selecione a área de maior impacto..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {businessAreas.map((area) => (
                    <SelectItem key={area} value={area} className="text-foreground hover:bg-muted">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Expectativas e Resultados */}
        <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Expectativas de Resultados</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-base font-medium">
                Qual tipo de resultado espera alcançar nos primeiros 90 dias? *
              </Label>
              <Select 
                value={formData.expectedResult90Days} 
                onValueChange={(value) => handleInputChange('expectedResult90Days', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                  <SelectValue placeholder="Selecione o tipo de resultado esperado" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {resultTypes.map((result) => (
                    <SelectItem key={result} value={result} className="text-foreground hover:bg-muted">
                      {result}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Urgência */}
        <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Nível de Urgência</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-base font-medium">
                Qual o nível de urgência desta implementação? *
              </Label>
              <Select 
                value={formData.urgencyLevel} 
                onValueChange={(value) => handleInputChange('urgencyLevel', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                  <SelectValue placeholder="Selecione o nível de urgência" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level} value={level} className="text-foreground hover:bg-muted">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Métricas de Sucesso */}
        <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Definição de Sucesso</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-base font-medium">
                Qual métrica é mais importante para medir o sucesso? *
              </Label>
              <Select 
                value={formData.successMetric} 
                onValueChange={(value) => handleInputChange('successMetric', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                  <SelectValue placeholder="Selecione a métrica principal de sucesso" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {successMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric} className="text-foreground hover:bg-muted">
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Obstáculos e Suporte */}
        <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Desafios e Suporte</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-base font-medium">
                Qual o principal obstáculo que você antecipa? *
              </Label>
              <Select 
                value={formData.mainObstacle} 
                onValueChange={(value) => handleInputChange('mainObstacle', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                  <SelectValue placeholder="Selecione o principal desafio" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {mainObstacles.map((obstacle) => (
                    <SelectItem key={obstacle} value={obstacle} className="text-foreground hover:bg-muted">
                      {obstacle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-base font-medium">
                Que tipo de suporte você prefere? *
              </Label>
              <Select 
                value={formData.preferredSupport} 
                onValueChange={(value) => handleInputChange('preferredSupport', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                  <SelectValue placeholder="Selecione o tipo de suporte preferido" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {supportTypes.map((support) => (
                    <SelectItem key={support} value={support} className="text-foreground hover:bg-muted">
                      {support}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Investimento */}
        <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Investimento Disponível</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-base font-medium">
                Qual o orçamento disponível para implementação de IA? *
              </Label>
              <Select 
                value={formData.aiImplementationBudget} 
                onValueChange={(value) => handleInputChange('aiImplementationBudget', value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                  <SelectValue placeholder="Selecione a faixa de investimento" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {budgetRanges.map((budget) => (
                    <SelectItem key={budget} value={budget} className="text-foreground hover:bg-muted">
                      {budget}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

      </div>

      {/* Botão Continuar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-end pt-6"
      >
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {isLoading ? "Salvando..." : "Continuar →"}
        </Button>
      </motion.div>
    </motion.div>
  );
};