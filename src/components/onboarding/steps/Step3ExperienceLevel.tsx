import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Lightbulb, Rocket, Users, BookOpen, Target } from 'lucide-react';

const experienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  current_knowledge: z.string().optional(),
  specific_challenges: z.string().optional(),
  learning_goals: z.string().optional(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface Step3ExperienceLevelProps {
  initialData?: Partial<ExperienceFormData>;
  onDataChange: (data: Partial<ExperienceFormData>) => void;
  onNext: () => void;
  userType: 'entrepreneur' | 'learner';
}

export const Step3ExperienceLevel: React.FC<Step3ExperienceLevelProps> = ({
  initialData,
  onDataChange,
  onNext,
  userType,
}) => {
  const [currentData, setCurrentData] = useState<Partial<ExperienceFormData>>(initialData || {});

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const newData = { ...currentData, ...watchedFields };
    setCurrentData(newData);
    onDataChange(newData);
  }, [watchedFields]);

  const handleSubmit = (data: ExperienceFormData) => {
    onNext();
  };

  const getExperienceLevels = () => {
    if (userType === 'entrepreneur') {
      return [
        {
          value: 'beginner',
          label: 'Iniciante',
          description: 'Nunca usei IA no meu negócio',
          icon: <Lightbulb className="w-6 h-6 text-primary" />
        },
        {
          value: 'basic',
          label: 'Básico',
          description: 'Já experimentei algumas ferramentas de IA',
          icon: <Brain className="w-6 h-6 text-primary" />
        },
        {
          value: 'intermediate',
          label: 'Intermediário',
          description: 'Uso IA regularmente em algumas áreas',
          icon: <Rocket className="w-6 h-6 text-primary" />
        },
        {
          value: 'advanced',
          label: 'Avançado',
          description: 'IA está integrada em vários processos',
          icon: <Target className="w-6 h-6 text-primary" />
        }
      ];
    } else {
      return [
        {
          value: 'complete_beginner',
          label: 'Iniciante Completo',
          description: 'Nunca estudei ou usei IA',
          icon: <Lightbulb className="w-6 h-6 text-primary" />
        },
        {
          value: 'curious',
          label: 'Curioso',
          description: 'Sei o básico e quero aprender mais',
          icon: <Brain className="w-6 h-6 text-primary" />
        },
        {
          value: 'student',
          label: 'Estudante',
          description: 'Estou estudando IA ou áreas relacionadas',
          icon: <BookOpen className="w-6 h-6 text-primary" />
        },
        {
          value: 'professional',
          label: 'Profissional',
          description: 'Trabalho com tecnologia e quero especialização',
          icon: <Users className="w-6 h-6 text-primary" />
        }
      ];
    }
  };

  const getTitle = () => {
    return userType === 'entrepreneur' 
      ? 'Qual é sua experiência atual com IA?'
      : 'Qual é seu nível de conhecimento em IA?';
  };

  const getSubtitle = () => {
    return userType === 'entrepreneur'
      ? 'Isso nos ajudará a personalizar o conteúdo para suas necessidades empresariais'
      : 'Vamos adaptar o conteúdo para seu nível de conhecimento atual';
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <Brain className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <p className="text-muted-foreground text-lg">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            Selecione a opção que melhor descreve você:
          </Label>
          <RadioGroup
            value={form.getValues('experience_level')}
            onValueChange={(value) => form.setValue('experience_level', value)}
            className="grid md:grid-cols-2 gap-4"
          >
            {getExperienceLevels().map((level) => (
              <Card 
                key={level.value} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  form.getValues('experience_level') === level.value 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : ''
                }`}
                onClick={() => form.setValue('experience_level', level.value)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {level.icon}
                        <Label htmlFor={level.value} className="font-semibold cursor-pointer">
                          {level.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
          {form.formState.errors.experience_level && (
            <p className="text-sm text-destructive">
              {form.formState.errors.experience_level.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_knowledge">
            {userType === 'entrepreneur' 
              ? 'Que ferramentas de IA você já conhece ou usa? (opcional)'
              : 'O que você já sabe sobre IA? (opcional)'
            }
          </Label>
          <Textarea
            id="current_knowledge"
            placeholder={userType === 'entrepreneur' 
              ? "Ex: ChatGPT, Canva AI, automações no WhatsApp..."
              : "Ex: conceitos básicos, machine learning, já usei ChatGPT..."
            }
            {...form.register('current_knowledge')}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specific_challenges">
            {userType === 'entrepreneur'
              ? 'Quais são seus maiores desafios para implementar IA no seu negócio? (opcional)'
              : 'Que dificuldades você tem para aprender sobre IA? (opcional)'
            }
          </Label>
          <Textarea
            id="specific_challenges"
            placeholder={userType === 'entrepreneur'
              ? "Ex: falta de tempo, não sei por onde começar, medo de errar..."
              : "Ex: conceitos muito técnicos, falta de prática, não sei aplicar..."
            }
            {...form.register('specific_challenges')}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="learning_goals">
            {userType === 'entrepreneur'
              ? 'O que você espera alcançar com IA no seu negócio? (opcional)'
              : 'Quais são seus objetivos de aprendizado? (opcional)'
            }
          </Label>
          <Textarea
            id="learning_goals"
            placeholder={userType === 'entrepreneur'
              ? "Ex: aumentar vendas, automatizar processos, melhorar atendimento..."
              : "Ex: entender conceitos, conseguir um emprego, criar projetos..."
            }
            {...form.register('learning_goals')}
            className="min-h-[100px]"
          />
        </div>
      </form>
    </div>
  );
};