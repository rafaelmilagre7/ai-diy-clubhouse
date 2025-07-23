import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, Zap, CheckSquare } from 'lucide-react';
import { useOnboardingTools } from '@/hooks/useOnboardingTools';
import { Card, CardContent } from '@/components/ui/card';

const aiExperienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  implementation_status: z.string().min(1, 'Selecione o status da implementação'),
  implementation_approach: z.string().min(1, 'Selecione como pretende implementar'),
  current_tools: z.array(z.string()).optional(),
});

type AIExperienceFormData = z.infer<typeof aiExperienceSchema>;

interface Step3AIExperienceProps {
  initialData?: Partial<AIExperienceFormData>;
  onDataChange: (data: Partial<AIExperienceFormData>) => void;
  onNext: () => void;
}

export const Step3AIExperience: React.FC<Step3AIExperienceProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.current_tools || []);
  const { tools, isLoading } = useOnboardingTools();
  const lastDataRef = useRef<string>('');
  const onDataChangeRef = useRef(onDataChange);

  const form = useForm<AIExperienceFormData>({
    resolver: zodResolver(aiExperienceSchema),
    defaultValues: {
      experience_level: initialData?.experience_level || '',
      implementation_status: initialData?.implementation_status || '',
      implementation_approach: initialData?.implementation_approach || '',
      current_tools: initialData?.current_tools || [],
    },
    mode: 'onChange',
  });

  // Atualizar ref sempre que onDataChange mudar
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Função para notificar mudanças SEM useEffect automático
  const notifyChange = useCallback((newData: Partial<AIExperienceFormData>) => {
    const dataString = JSON.stringify(newData);
    if (lastDataRef.current !== dataString) {
      lastDataRef.current = dataString;
      // Usar setTimeout para quebrar qualquer cadeia síncrona
      setTimeout(() => {
        onDataChangeRef.current(newData);
      }, 0);
    }
  }, []);

  const handleSelectChange = useCallback((field: keyof AIExperienceFormData, value: string) => {
    form.setValue(field, value);
    // Notificar mudança imediatamente quando campos do form mudam
    const formData = form.getValues();
    notifyChange({ ...formData, current_tools: selectedTools });
  }, [form, selectedTools, notifyChange]);

  const handleToolClick = useCallback((toolName: string) => {
    setSelectedTools(prevSelectedTools => {
      let newSelectedTools: string[];
      
      if (toolName === 'Nenhuma ainda') {
        newSelectedTools = prevSelectedTools.includes('Nenhuma ainda') 
          ? prevSelectedTools.filter(t => t !== 'Nenhuma ainda')
          : ['Nenhuma ainda'];
      } else {
        if (prevSelectedTools.includes('Nenhuma ainda')) {
          newSelectedTools = [toolName];
        } else if (prevSelectedTools.includes(toolName)) {
          newSelectedTools = prevSelectedTools.filter(t => t !== toolName);
        } else {
          newSelectedTools = [...prevSelectedTools, toolName];
        }
      }
      
      // Notificar mudança APÓS atualizar o estado
      setTimeout(() => {
        const formData = form.getValues();
        notifyChange({ ...formData, current_tools: newSelectedTools });
      }, 0);
      
      return newSelectedTools;
    });
  }, [form, notifyChange]);

  // REMOVIDO: useEffect que causava loops

  const handleSubmit = (data: AIExperienceFormData) => {
    console.log('[Step3] Enviando dados:', data);
    
    if (!data.experience_level || !data.implementation_status || !data.implementation_approach) {
      console.error('[Step3] Campos obrigatórios não preenchidos');
      return;
    }
    
    onNext();
  };

  // Organizar ferramentas por categoria - memoizado para evitar recálculos
  const organizedTools = useMemo(() => {
    const categories = [
      'Modelos de IA e Interfaces',
      'Geração de Conteúdo Visual', 
      'Geração e Processamento de Áudio',
      'Automação e Integrações',
      'Comunicação e Atendimento',
      'Captura e Análise de Dados',
      'Pesquisa e Síntese de Informações',
      'Gestão de Documentos e Conteúdo',
      'Marketing e CRM',
      'Produtividade e Organização',
      'Desenvolvimento e Código',
      'Plataformas de Mídia',
      'Outros'
    ];

    return categories.reduce((acc, category) => {
      const toolsInCategory = tools
        .filter(tool => tool.status && tool.category === category)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      if (toolsInCategory.length > 0) {
        acc[category] = toolsInCategory;
      }
      
      return acc;
    }, {} as Record<string, typeof tools>);
  }, [tools]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Bot className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Vamos entender sua experiência atual com IA para criar o melhor plano de aprendizado
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Qual é seu nível de experiência com IA?
          </Label>
          <Select onValueChange={(value) => handleSelectChange('experience_level', value)} defaultValue={form.getValues('experience_level') || ''}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante - Nunca usei ferramentas de IA</SelectItem>
              <SelectItem value="basic">Básico - Uso algumas ferramentas ocasionalmente</SelectItem>
              <SelectItem value="intermediate">Intermediário - Uso IA regularmente no trabalho</SelectItem>
              <SelectItem value="advanced">Avançado - Implemento soluções de IA na empresa</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.experience_level && (
            <p className="text-sm text-destructive">
              {form.formState.errors.experience_level.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Qual é o status da implementação de IA na sua empresa?
          </Label>
          <Select onValueChange={(value) => handleSelectChange('implementation_status', value)} defaultValue={form.getValues('implementation_status') || ''}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o status atual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Ainda não começamos</SelectItem>
              <SelectItem value="exploring">Estamos explorando possibilidades</SelectItem>
              <SelectItem value="testing">Testando algumas ferramentas</SelectItem>
              <SelectItem value="implementing">Implementando soluções</SelectItem>
              <SelectItem value="advanced">Já temos IA integrada aos processos</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.implementation_status && (
            <p className="text-sm text-destructive">
              {form.formState.errors.implementation_status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Como pretende implementar IA na sua empresa?
          </Label>
          <Select onValueChange={(value) => handleSelectChange('implementation_approach', value)} defaultValue={form.getValues('implementation_approach') || ''}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione sua abordagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">Eu mesmo vou fazer</SelectItem>
              <SelectItem value="team">Meu time</SelectItem>
              <SelectItem value="hire">Quero contratar</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.implementation_approach && (
            <p className="text-sm text-destructive">
              {form.formState.errors.implementation_approach.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Quais ferramentas de IA você já usa? (selecione todas que se aplicam)
          </Label>
          
          {/* Debug Info */}
          <div className="p-2 bg-muted rounded text-xs">
            <strong>Debug:</strong> {selectedTools.length} ferramentas selecionadas: {selectedTools.join(', ') || 'Nenhuma'}
            <br />
            <strong>Total ferramentas:</strong> {tools.length} | <strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}
            <br />
            <strong>Categorias disponíveis:</strong> {Object.keys(organizedTools).length}
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando ferramentas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(organizedTools).map(([category, categoryTools]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryTools.map((tool) => (
                      <Card 
                        key={tool.id} 
                        className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                          selectedTools.includes(tool.name) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-accent/50'
                        }`}
                        onClick={() => handleToolClick(tool.name)}
                      >
                        <CardContent className="p-3 flex flex-col items-center space-y-2">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {tool.logo_url ? (
                              <img 
                                src={tool.logo_url} 
                                alt={tool.name} 
                                className="h-full w-full object-contain" 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<div class="text-xs font-bold text-primary">${tool.name.substring(0, 2).toUpperCase()}</div>`;
                                  }
                                }}
                              />
                            ) : (
                              <div className="text-xs font-bold text-primary">
                                {tool.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-center line-clamp-2">
                            {tool.name}
                          </span>
                          <Checkbox
                            checked={selectedTools.includes(tool.name)}
                            className="pointer-events-none"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Opção "Nenhuma ainda" no final */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Opções especiais</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                      selectedTools.includes('Nenhuma ainda') 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-accent/50'
                    }`}
                    onClick={() => handleToolClick('Nenhuma ainda')}
                  >
                    <CardContent className="p-3 flex flex-col items-center space-y-2">
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                        <span className="text-xs">❌</span>
                      </div>
                      <span className="text-xs font-medium text-center">
                        Nenhuma ainda
                      </span>
                      <Checkbox
                        checked={selectedTools.includes('Nenhuma ainda')}
                        className="pointer-events-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90"
            disabled={!form.formState.isValid || !form.getValues('experience_level') || !form.getValues('implementation_status') || !form.getValues('implementation_approach')}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};