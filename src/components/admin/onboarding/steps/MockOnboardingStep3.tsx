
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MockOnboardingStep3Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep3: React.FC<MockOnboardingStep3Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
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

  const handleRadioChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: keyof OnboardingData, values: string[], value: string, checked: boolean) => {
    let newValues = [...values];
    if (checked) {
      if (!newValues.includes(value)) {
        newValues.push(value);
      }
    } else {
      newValues = newValues.filter(v => v !== value);
    }
    onUpdateData({ [field]: newValues });
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Settings className="h-5 w-5 text-viverblue" />
            Maturidade Tecnológica em IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Status de Implementação */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Sua empresa já implementou soluções de Inteligência Artificial? *
            </Label>
            <RadioGroup
              value={data.hasImplementedAI || ''}
              onValueChange={(value) => handleRadioChange('hasImplementedAI', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="sim" id="implemented-yes" className="border-slate-400" />
                <Label htmlFor="implemented-yes" className="text-white font-normal cursor-pointer flex-1">
                  Sim, já implementamos soluções de IA
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="nao" id="implemented-no" className="border-slate-400" />
                <Label htmlFor="implemented-no" className="text-white font-normal cursor-pointer flex-1">
                  Não, ainda não implementamos
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="parcial" id="implemented-partial" className="border-slate-400" />
                <Label htmlFor="implemented-partial" className="text-white font-normal cursor-pointer flex-1">
                  Parcialmente, estamos em fase de testes
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('hasImplementedAI') && (
              <p className="text-red-400 text-sm">{getFieldError('hasImplementedAI')}</p>
            )}
          </div>

          {/* Ferramentas Utilizadas */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Quais ferramentas de IA são utilizadas pela sua equipe?
            </Label>
            <p className="text-slate-400 text-sm">Selecione todas as opções que se aplicam</p>
            
            {loading ? (
              <div className="text-slate-400 text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-viverblue border-t-transparent rounded-full mx-auto mb-2"></div>
                Carregando ferramentas...
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-slate-300 font-medium text-sm uppercase tracking-wider border-b border-slate-700 pb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryTools.map((tool) => (
                        <div 
                          key={tool.id} 
                          className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                            (data.aiToolsUsed || []).includes(tool.name)
                              ? 'bg-viverblue/20 border-viverblue shadow-lg shadow-viverblue/20'
                              : 'bg-slate-800/40 border-slate-600 hover:border-slate-500'
                          }`}
                          onClick={() => {
                            const isChecked = (data.aiToolsUsed || []).includes(tool.name);
                            handleCheckboxChange('aiToolsUsed', data.aiToolsUsed || [], tool.name, !isChecked);
                          }}
                        >
                          <Checkbox
                            id={`tool-${tool.id}`}
                            checked={(data.aiToolsUsed || []).includes(tool.name)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('aiToolsUsed', data.aiToolsUsed || [], tool.name, checked as boolean)
                            }
                            className="border-slate-400 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                          />
                          
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {tool.logo_url && (
                              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                                <img 
                                  src={tool.logo_url} 
                                  alt={`${tool.name} logo`}
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    // Se a imagem falhar, esconder o container
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <Label 
                              htmlFor={`tool-${tool.id}`} 
                              className="text-white font-medium cursor-pointer flex-1 truncate text-sm"
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
                <div className="pt-4 border-t border-slate-700">
                  <div 
                    className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                      (data.aiToolsUsed || []).includes('Outras ferramentas')
                        ? 'bg-viverblue/20 border-viverblue shadow-lg shadow-viverblue/20'
                        : 'bg-slate-800/40 border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => {
                      const isChecked = (data.aiToolsUsed || []).includes('Outras ferramentas');
                      handleCheckboxChange('aiToolsUsed', data.aiToolsUsed || [], 'Outras ferramentas', !isChecked);
                    }}
                  >
                    <Checkbox
                      id="tool-outras"
                      checked={(data.aiToolsUsed || []).includes('Outras ferramentas')}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('aiToolsUsed', data.aiToolsUsed || [], 'Outras ferramentas', checked as boolean)
                      }
                      className="border-slate-400 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Settings className="w-4 h-4 text-slate-400" />
                      </div>
                      <Label htmlFor="tool-outras" className="text-white font-medium cursor-pointer flex-1 text-sm">
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
            <Label className="text-slate-200 font-medium text-base">
              Como avalia o nível de conhecimento em IA da sua equipe? *
            </Label>
            <RadioGroup
              value={data.aiKnowledgeLevel || ''}
              onValueChange={(value) => handleRadioChange('aiKnowledgeLevel', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="iniciante" id="level-beginner" className="border-slate-400" />
                <Label htmlFor="level-beginner" className="text-white font-normal cursor-pointer flex-1">
                  Iniciante - Conhecimento básico ou limitado
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="basico" id="level-basic" className="border-slate-400" />
                <Label htmlFor="level-basic" className="text-white font-normal cursor-pointer flex-1">
                  Básico - Uso ferramentas simples ocasionalmente
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="intermediario" id="level-intermediate" className="border-slate-400" />
                <Label htmlFor="level-intermediate" className="text-white font-normal cursor-pointer flex-1">
                  Intermediário - Uso regular de múltiplas ferramentas
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="avancado" id="level-advanced" className="border-slate-400" />
                <Label htmlFor="level-advanced" className="text-white font-normal cursor-pointer flex-1">
                  Avançado - Domínio técnico das tecnologias
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiKnowledgeLevel') && (
              <p className="text-red-400 text-sm">{getFieldError('aiKnowledgeLevel')}</p>
            )}
          </div>

          {/* Responsável pela Implementação */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Quem será responsável pela implementação de IA na sua empresa? *
            </Label>
            <RadioGroup
              value={data.whoWillImplement || ''}
              onValueChange={(value) => handleRadioChange('whoWillImplement', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="eu-mesmo" id="implement-myself" className="border-slate-400" />
                <Label htmlFor="implement-myself" className="text-white font-normal cursor-pointer flex-1">
                  Eu mesmo vou implementar
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="meu-time" id="implement-team" className="border-slate-400" />
                <Label htmlFor="implement-team" className="text-white font-normal cursor-pointer flex-1">
                  Meu time vai implementar
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="contratar" id="implement-hire" className="border-slate-400" />
                <Label htmlFor="implement-hire" className="text-white font-normal cursor-pointer flex-1">
                  Vou contratar a implementação
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('whoWillImplement') && (
              <p className="text-red-400 text-sm">{getFieldError('whoWillImplement')}</p>
            )}
          </div>

          {/* Objetivo Principal com IA */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Qual o principal objetivo da sua empresa com a IA? *
            </Label>
            <RadioGroup
              value={data.aiImplementationObjective || ''}
              onValueChange={(value) => handleRadioChange('aiImplementationObjective', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="automatizar-processos" id="objective-automate" className="border-slate-400" />
                <Label htmlFor="objective-automate" className="text-white font-normal cursor-pointer flex-1">
                  Automatizar processos repetitivos
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="melhorar-atendimento" id="objective-customer" className="border-slate-400" />
                <Label htmlFor="objective-customer" className="text-white font-normal cursor-pointer flex-1">
                  Melhorar atendimento ao cliente
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="analise-dados" id="objective-analytics" className="border-slate-400" />
                <Label htmlFor="objective-analytics" className="text-white font-normal cursor-pointer flex-1">
                  Análise de dados e insights
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="criar-conteudo" id="objective-content" className="border-slate-400" />
                <Label htmlFor="objective-content" className="text-white font-normal cursor-pointer flex-1">
                  Criar conteúdo (textos, imagens, vídeos)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="otimizar-operacoes" id="objective-operations" className="border-slate-400" />
                <Label htmlFor="objective-operations" className="text-white font-normal cursor-pointer flex-1">
                  Otimizar operações internas
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiImplementationObjective') && (
              <p className="text-red-400 text-sm">{getFieldError('aiImplementationObjective')}</p>
            )}
          </div>

          {/* Urgência de Implementação */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Qual a urgência para implementar IA na sua empresa? *
            </Label>
            <RadioGroup
              value={data.aiImplementationUrgency || ''}
              onValueChange={(value) => handleRadioChange('aiImplementationUrgency', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="imediato" id="urgency-immediate" className="border-slate-400" />
                <Label htmlFor="urgency-immediate" className="text-white font-normal cursor-pointer flex-1">
                  Imediato (próximas semanas)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="curto-prazo" id="urgency-short" className="border-slate-400" />
                <Label htmlFor="urgency-short" className="text-white font-normal cursor-pointer flex-1">
                  Curto prazo (próximos 3 meses)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="medio-prazo" id="urgency-medium" className="border-slate-400" />
                <Label htmlFor="urgency-medium" className="text-white font-normal cursor-pointer flex-1">
                  Médio prazo (próximos 6 meses)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="longo-prazo" id="urgency-long" className="border-slate-400" />
                <Label htmlFor="urgency-long" className="text-white font-normal cursor-pointer flex-1">
                  Longo prazo (mais de 6 meses)
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiImplementationUrgency') && (
              <p className="text-red-400 text-sm">{getFieldError('aiImplementationUrgency')}</p>
            )}
          </div>

          {/* Principal Desafio */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Qual o principal desafio da sua empresa com IA? *
            </Label>
            <RadioGroup
              value={data.aiMainChallenge || ''}
              onValueChange={(value) => handleRadioChange('aiMainChallenge', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="falta-conhecimento" id="challenge-knowledge" className="border-slate-400" />
                <Label htmlFor="challenge-knowledge" className="text-white font-normal cursor-pointer flex-1">
                  Falta de conhecimento técnico
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="custos" id="challenge-costs" className="border-slate-400" />
                <Label htmlFor="challenge-costs" className="text-white font-normal cursor-pointer flex-1">
                  Custos de implementação
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="resistencia-equipe" id="challenge-resistance" className="border-slate-400" />
                <Label htmlFor="challenge-resistance" className="text-white font-normal cursor-pointer flex-1">
                  Resistência da equipe
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="seguranca-dados" id="challenge-security" className="border-slate-400" />
                <Label htmlFor="challenge-security" className="text-white font-normal cursor-pointer flex-1">
                  Segurança e privacidade dos dados
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="escolher-solucoes" id="challenge-choosing" className="border-slate-400" />
                <Label htmlFor="challenge-choosing" className="text-white font-normal cursor-pointer flex-1">
                  Dificuldade em escolher soluções
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiMainChallenge') && (
              <p className="text-red-400 text-sm">{getFieldError('aiMainChallenge')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep3;
