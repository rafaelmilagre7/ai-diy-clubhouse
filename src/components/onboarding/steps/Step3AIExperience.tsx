import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, Zap, CheckSquare } from 'lucide-react';
import { useTools } from '@/hooks/useTools';
import { Card, CardContent } from '@/components/ui/card';

const aiExperienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  current_tools: z.array(z.string()).optional(),
  main_interest: z.string().optional(),
  implementation_status: z.string().optional(),
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
  const [currentData, setCurrentData] = useState<Partial<AIExperienceFormData>>(initialData || {});
  const { tools, isLoading } = useTools();

  const form = useForm<AIExperienceFormData>({
    resolver: zodResolver(aiExperienceSchema),
    defaultValues: {
      current_tools: [],
      ...initialData,
    },
    mode: 'onChange',
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const newData = { ...currentData, ...watchedFields };
    setCurrentData(newData);
    onDataChange(newData);
  }, [watchedFields, onDataChange]);

  const handleSubmit = (data: AIExperienceFormData) => {
    onNext();
  };

  // Filtrar ferramentas ativas e ordenar por popularidade
  const availableTools = tools
    .filter(tool => tool.status) // Apenas ferramentas ativas
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 12); // Limitar a 12 ferramentas mais populares


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
          <Select onValueChange={(value) => form.setValue('experience_level', value)}>
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

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Quais ferramentas de IA você já usa? (selecione todas que se aplicam)
          </Label>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando ferramentas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                    form.getValues('current_tools')?.includes(tool.name) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent/50'
                  }`}
                  onClick={() => {
                    const currentTools = form.getValues('current_tools') || [];
                    if (currentTools.includes(tool.name)) {
                      form.setValue('current_tools', currentTools.filter(t => t !== tool.name));
                    } else {
                      form.setValue('current_tools', [...currentTools, tool.name]);
                    }
                  }}
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
                      checked={form.getValues('current_tools')?.includes(tool.name) || false}
                      className="pointer-events-none"
                    />
                  </CardContent>
                </Card>
              ))}
              {/* Opção "Nenhuma ainda" */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                  form.getValues('current_tools')?.includes('Nenhuma ainda') 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-accent/50'
                }`}
                onClick={() => {
                  const currentTools = form.getValues('current_tools') || [];
                  if (currentTools.includes('Nenhuma ainda')) {
                    form.setValue('current_tools', currentTools.filter(t => t !== 'Nenhuma ainda'));
                  } else {
                    form.setValue('current_tools', ['Nenhuma ainda']); // Substituir todas as outras
                  }
                }}
              >
                <CardContent className="p-3 flex flex-col items-center space-y-2">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs">❌</span>
                  </div>
                  <span className="text-xs font-medium text-center">
                    Nenhuma ainda
                  </span>
                  <Checkbox
                    checked={form.getValues('current_tools')?.includes('Nenhuma ainda') || false}
                    className="pointer-events-none"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Qual é o status da implementação de IA na sua empresa?
          </Label>
          <Select onValueChange={(value) => form.setValue('implementation_status', value)}>
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
        </div>
      </form>
    </div>
  );
};