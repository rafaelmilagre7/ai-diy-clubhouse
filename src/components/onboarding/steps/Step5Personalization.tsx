import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Brain, Calendar, MessageCircle } from 'lucide-react';

const personalizationSchema = z.object({
  learning_style: z.string().min(1, 'Selecione seu estilo de aprendizado'),
  communication_frequency: z.string().optional(),
  preferred_content: z.array(z.string()).optional(),
  support_level: z.string().optional(),
  availability: z.string().optional(),
  special_needs: z.string().optional(),
});

type PersonalizationFormData = z.infer<typeof personalizationSchema>;

interface Step5PersonalizationProps {
  initialData?: Partial<PersonalizationFormData>;
  onDataChange: (data: Partial<PersonalizationFormData>) => void;
  onNext: () => void;
}

export const Step5Personalization: React.FC<Step5PersonalizationProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  const [currentData, setCurrentData] = useState<Partial<PersonalizationFormData>>(initialData || {});

  const form = useForm<PersonalizationFormData>({
    resolver: zodResolver(personalizationSchema),
    defaultValues: {
      preferred_content: [],
      ...initialData,
    },
    mode: 'onChange',
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const newData = { ...currentData, ...watchedFields };
    setCurrentData(newData);
    onDataChange(newData);
  }, [watchedFields]); // Removido onDataChange para evitar loop infinito

  const handleSubmit = (data: PersonalizationFormData) => {
    onNext();
  };

  const contentTypes = [
    'Vídeos explicativos',
    'Tutoriais práticos',
    'Templates prontos',
    'Cases de sucesso',
    'Workshops ao vivo',
    'Material de leitura',
    'Podcasts',
    'Infográficos'
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Settings className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Personalize sua experiência para que a NINA possa te acompanhar da melhor forma
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Como você prefere aprender?
          </Label>
           <Select 
             value={form.getValues('learning_style')}
             onValueChange={(value) => form.setValue('learning_style', value)}
           >
             <SelectTrigger className="h-12">
               <SelectValue placeholder="Selecione seu estilo de aprendizado" />
             </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">Visual - Prefiro vídeos e imagens</SelectItem>
              <SelectItem value="hands_on">Prático - Aprendo fazendo</SelectItem>
              <SelectItem value="reading">Leitura - Gosto de textos e documentos</SelectItem>
              <SelectItem value="interactive">Interativo - Prefiro conversas e workshops</SelectItem>
              <SelectItem value="mixed">Misto - Combinação de diferentes formas</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.learning_style && (
            <p className="text-sm text-destructive">
              {form.formState.errors.learning_style.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Com que frequência gostaria de receber dicas e conteúdos?
          </Label>
           <Select 
             value={form.getValues('communication_frequency')}
             onValueChange={(value) => form.setValue('communication_frequency', value)}
           >
             <SelectTrigger className="h-12">
               <SelectValue placeholder="Selecione a frequência" />
             </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diariamente</SelectItem>
              <SelectItem value="weekly">Semanalmente</SelectItem>
              <SelectItem value="biweekly">Quinzenalmente</SelectItem>
              <SelectItem value="monthly">Mensalmente</SelectItem>
              <SelectItem value="on_demand">Apenas quando eu solicitar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>
            Que tipos de conteúdo mais te interessam? (marque todas que se aplicam)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contentTypes.map((content) => (
              <div key={content} className="flex items-center space-x-2">
                 <Checkbox
                   id={content}
                   checked={(form.getValues('preferred_content') || []).includes(content)}
                   onCheckedChange={(checked) => {
                     const currentContent = form.getValues('preferred_content') || [];
                     if (checked) {
                       form.setValue('preferred_content', [...currentContent, content]);
                     } else {
                       form.setValue('preferred_content', currentContent.filter(c => c !== content));
                     }
                   }}
                 />
                <Label htmlFor={content} className="text-sm font-normal cursor-pointer">
                  {content}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Qual nível de suporte você gostaria de receber?
          </Label>
           <Select 
             value={form.getValues('support_level')}
             onValueChange={(value) => form.setValue('support_level', value)}
           >
             <SelectTrigger className="h-12">
               <SelectValue placeholder="Selecione o nível de suporte" />
             </SelectTrigger>
            <SelectContent>
              <SelectItem value="autonomous">Autônomo - Prefiro explorar sozinho</SelectItem>
              <SelectItem value="guided">Guiado - Gosto de direcionamento claro</SelectItem>
              <SelectItem value="mentored">Mentorado - Quero acompanhamento próximo</SelectItem>
              <SelectItem value="collaborative">Colaborativo - Prefiro aprender em grupo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Quando você tem mais tempo para se dedicar ao aprendizado?
          </Label>
           <Select 
             value={form.getValues('availability')}
             onValueChange={(value) => form.setValue('availability', value)}
           >
             <SelectTrigger className="h-12">
               <SelectValue placeholder="Selecione sua disponibilidade" />
             </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Manhã (6h às 12h)</SelectItem>
              <SelectItem value="afternoon">Tarde (12h às 18h)</SelectItem>
              <SelectItem value="evening">Noite (18h às 22h)</SelectItem>
              <SelectItem value="weekend">Fins de semana</SelectItem>
              <SelectItem value="flexible">Horário flexível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_needs">
            Há algo específico que devemos considerar no seu aprendizado? (opcional)
          </Label>
          <Textarea
            id="special_needs"
            placeholder="Ex: Tempo limitado, preferências específicas, necessidades especiais..."
            {...form.register('special_needs')}
            className="min-h-[100px]"
          />
        </div>
      </form>
    </div>
  );
};