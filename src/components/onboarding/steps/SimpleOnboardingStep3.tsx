import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleOnboardingStep3Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  getFieldError?: (field: string) => string | undefined;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep3: React.FC<SimpleOnboardingStep3Props> = ({
  data,
  onNext,
  isLoading = false,
  getFieldError,
  onDataChange
}) => {
  const [formData, setFormData] = useState(data || {});
  const [tools, setTools] = useState<Array<{id: string, name: string, category: string, logo_url?: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [toolsByCategory, setToolsByCategory] = useState<Record<string, Array<{id: string, name: string, category: string, logo_url?: string}>>>({});

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data: toolsData, error } = await supabase
          .from('tools')
          .select('id, name, category, logo_url')
          .eq('status', true)
          .order('category')
          .order('name');

        if (error) throw error;
        setTools(toolsData || []);
        
        // Agrupar ferramentas por categoria
        const grouped = (toolsData || []).reduce((acc, tool) => {
          if (!acc[tool.category]) {
            acc[tool.category] = [];
          }
          acc[tool.category].push(tool);
          return acc;
        }, {} as Record<string, typeof toolsData>);
        
        setToolsByCategory(grouped);
      } catch (error) {
        console.error('Erro ao carregar ferramentas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Função para atualizar dados sem navegar automaticamente
  const updateStepData = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRadioChange = (field: string, value: string) => {
    updateStepData(field, value);
  };

  const handleCheckboxChange = (field: string, values: string[], value: string, checked: boolean) => {
    let newValues = [...values];
    if (checked) {
      if (!newValues.includes(value)) {
        newValues.push(value);
      }
    } else {
      newValues = newValues.filter(v => v !== value);
    }
    updateStepData(field, newValues);
  };

  const handleNext = () => {
    // Validar campos obrigatórios antes de avançar
    const requiredFields = ['hasImplementedAI', 'aiKnowledgeLevel', 'whoWillImplement', 'aiImplementationObjective', 'aiImplementationUrgency'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      // Aqui você pode mostrar uma mensagem de erro ou destacar campos obrigatórios
      console.warn('Campos obrigatórios não preenchidos:', missingFields);
      return;
    }
    
    onNext(formData);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground text-xl font-bold flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            Experiência com Inteligência Artificial
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Vamos avaliar seu nível atual e criar um plano personalizado
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Status de Implementação */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium text-base">
              Sua empresa já implementou IA? *
            </Label>
            <p className="text-xs text-muted-foreground mb-4">Seja honesto - isso nos ajuda a calibrar suas recomendações</p>
            <RadioGroup
              value={formData.hasImplementedAI || ''}
              onValueChange={(value) => handleRadioChange('hasImplementedAI', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
                <RadioGroupItem value="sim" id="implemented-yes" />
                <Label htmlFor="implemented-yes" className="text-foreground font-normal cursor-pointer flex-1">
                  Sim, já implementamos IA
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border hover:border-orange-500/50 transition-colors cursor-pointer">
                <RadioGroupItem value="parcial" id="implemented-partial" />
                <Label htmlFor="implemented-partial" className="text-foreground font-normal cursor-pointer flex-1">
                  Estamos testando e experimentando
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border hover:border-blue-500/50 transition-colors cursor-pointer">
                <RadioGroupItem value="nao" id="implemented-no" />
                <Label htmlFor="implemented-no" className="text-foreground font-normal cursor-pointer flex-1">
                  Não ainda, mas estamos prontos para começar
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('hasImplementedAI') && (
              <p className="text-destructive text-sm">{getFieldError('hasImplementedAI')}</p>
            )}
          </div>

          {/* Ferramentas Utilizadas */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium text-base">
              Quais ferramentas de IA são utilizadas pela sua equipe?
            </Label>
            <p className="text-muted-foreground text-sm">Selecione todas as opções que se aplicam</p>
            
            {loading ? (
              <div className="text-muted-foreground text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Carregando ferramentas...
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-muted-foreground font-medium text-sm uppercase tracking-wider border-b border-border pb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryTools.map((tool) => (
                        <div 
                          key={tool.id} 
                           className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                             (formData.aiToolsUsed || []).includes(tool.name)
                               ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                               : 'bg-card border-border hover:border-muted-foreground'
                           }`}
                           onClick={() => {
                             const isChecked = (formData.aiToolsUsed || []).includes(tool.name);
                             handleCheckboxChange('aiToolsUsed', formData.aiToolsUsed || [], tool.name, !isChecked);
                           }}
                        >
                           <Checkbox
                             id={`tool-${tool.id}`}
                             checked={(formData.aiToolsUsed || []).includes(tool.name)}
                             onCheckedChange={(checked) => 
                               handleCheckboxChange('aiToolsUsed', formData.aiToolsUsed || [], tool.name, checked as boolean)
                             }
                           />
                          
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {tool.logo_url && (
                              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                <img 
                                  src={tool.logo_url} 
                                  alt={`${tool.name} logo`}
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <Label 
                              htmlFor={`tool-${tool.id}`} 
                              className="text-foreground font-medium cursor-pointer flex-1 truncate text-sm"
                            >
                              {tool.name}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Opção "Outras" */}
                <div className="pt-4 border-t border-border">
                  <div 
                     className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                       (formData.aiToolsUsed || []).includes('Outras ferramentas')
                         ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                         : 'bg-card border-border hover:border-muted-foreground'
                     }`}
                     onClick={() => {
                       const isChecked = (formData.aiToolsUsed || []).includes('Outras ferramentas');
                       handleCheckboxChange('aiToolsUsed', formData.aiToolsUsed || [], 'Outras ferramentas', !isChecked);
                     }}
                  >
                     <Checkbox
                       id="tool-outras"
                       checked={(formData.aiToolsUsed || []).includes('Outras ferramentas')}
                       onCheckedChange={(checked) => 
                         handleCheckboxChange('aiToolsUsed', formData.aiToolsUsed || [], 'Outras ferramentas', checked as boolean)
                       }
                     />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Label htmlFor="tool-outras" className="text-foreground font-medium cursor-pointer flex-1 text-sm">
                        Outras ferramentas
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nível de Conhecimento */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium text-base">
              Como avalia o nível de conhecimento em IA da sua equipe? *
            </Label>
            <RadioGroup
              value={formData.aiKnowledgeLevel || ''}
              onValueChange={(value) => handleRadioChange('aiKnowledgeLevel', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="iniciante" id="level-beginner" />
                <Label htmlFor="level-beginner" className="text-foreground font-normal cursor-pointer flex-1">
                  Iniciante - Conhecimento básico ou limitado
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="basico" id="level-basic" />
                <Label htmlFor="level-basic" className="text-foreground font-normal cursor-pointer flex-1">
                  Básico - Uso ferramentas simples ocasionalmente
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="intermediario" id="level-intermediate" />
                <Label htmlFor="level-intermediate" className="text-foreground font-normal cursor-pointer flex-1">
                  Intermediário - Uso regular de múltiplas ferramentas
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="avancado" id="level-advanced" />
                <Label htmlFor="level-advanced" className="text-foreground font-normal cursor-pointer flex-1">
                  Avançado - Domínio técnico das tecnologias
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiKnowledgeLevel') && (
              <p className="text-destructive text-sm">{getFieldError('aiKnowledgeLevel')}</p>
            )}
          </div>

          {/* Responsável pela Implementação */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium text-base">
              Quem será responsável pela implementação de IA na sua empresa? *
            </Label>
            <RadioGroup
              value={formData.whoWillImplement || ''}
              onValueChange={(value) => handleRadioChange('whoWillImplement', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="eu-mesmo" id="implement-myself" />
                <Label htmlFor="implement-myself" className="text-foreground font-normal cursor-pointer flex-1">
                  Eu mesmo vou implementar
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="meu-time" id="implement-team" />
                <Label htmlFor="implement-team" className="text-foreground font-normal cursor-pointer flex-1">
                  Meu time vai implementar
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="contratar" id="implement-hire" />
                <Label htmlFor="implement-hire" className="text-foreground font-normal cursor-pointer flex-1">
                  Vou contratar a implementação
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('whoWillImplement') && (
              <p className="text-destructive text-sm">{getFieldError('whoWillImplement')}</p>
            )}
          </div>

          {/* Objetivo Principal com IA */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium text-base">
              Qual o principal objetivo da sua empresa com a IA? *
            </Label>
            <RadioGroup
              value={formData.aiImplementationObjective || ''}
              onValueChange={(value) => handleRadioChange('aiImplementationObjective', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="automatizar-processos" id="objective-automate" />
                <Label htmlFor="objective-automate" className="text-foreground font-normal cursor-pointer flex-1">
                  Automatizar processos repetitivos
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="melhorar-atendimento" id="objective-customer" />
                <Label htmlFor="objective-customer" className="text-foreground font-normal cursor-pointer flex-1">
                  Melhorar atendimento ao cliente
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="analise-dados" id="objective-analytics" />
                <Label htmlFor="objective-analytics" className="text-foreground font-normal cursor-pointer flex-1">
                  Análise de dados e insights
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="criar-conteudo" id="objective-content" />
                <Label htmlFor="objective-content" className="text-foreground font-normal cursor-pointer flex-1">
                  Criar conteúdo (textos, imagens, vídeos)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="otimizar-operacoes" id="objective-operations" />
                <Label htmlFor="objective-operations" className="text-foreground font-normal cursor-pointer flex-1">
                  Otimizar operações internas
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiImplementationObjective') && (
              <p className="text-destructive text-sm">{getFieldError('aiImplementationObjective')}</p>
            )}
          </div>

          {/* Urgência da Implementação */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium text-base">
              Qual a urgência para implementar IA na sua empresa? *
            </Label>
            <RadioGroup
              value={formData.aiImplementationUrgency || ''}
              onValueChange={(value) => handleRadioChange('aiImplementationUrgency', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="imediata" id="urgency-immediate" />
                <Label htmlFor="urgency-immediate" className="text-foreground font-normal cursor-pointer flex-1">
                  Imediata - Preciso começar agora
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="3-meses" id="urgency-3months" />
                <Label htmlFor="urgency-3months" className="text-foreground font-normal cursor-pointer flex-1">
                  Próximos 3 meses
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="6-meses" id="urgency-6months" />
                <Label htmlFor="urgency-6months" className="text-foreground font-normal cursor-pointer flex-1">
                  Próximos 6 meses
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border border-border">
                <RadioGroupItem value="ano" id="urgency-year" />
                <Label htmlFor="urgency-year" className="text-foreground font-normal cursor-pointer flex-1">
                  No próximo ano
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiImplementationUrgency') && (
              <p className="text-destructive text-sm">{getFieldError('aiImplementationUrgency')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botão Continuar */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {isLoading ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};