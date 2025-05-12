
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { MilagrinhoMessage } from '@/components/onboarding/MilagrinhoMessage';
import { EtapasProgresso } from '@/components/onboarding/EtapasProgresso';
import { useStepDefinitions } from '@/hooks/onboarding/useStepDefinitions';
import MemberLayout from '@/components/layout/MemberLayout';

const learningGoalsOptions = [
  { id: 'career', label: 'Desenvolver uma carreira em IA' },
  { id: 'tools', label: 'Aprender a usar ferramentas de IA' },
  { id: 'business', label: 'Aplicar IA em negócios' },
  { id: 'chatbots', label: 'Criar chatbots e assistentes' },
  { id: 'content', label: 'Produção de conteúdo com IA' },
  { id: 'prompts', label: 'Dominar a engenharia de prompts' },
  { id: 'market', label: 'Entender o mercado de IA' },
  { id: 'trends', label: 'Acompanhar tendências e novidades' }
];

const FormacaoGoals = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { progress, updateProgress } = useProgress();
  const { steps } = useStepDefinitions('formacao');
  
  const currentStepIndex = steps.findIndex(step => step.id === 'formation_goals');
  const initialSelectedGoals = progress?.formation_data?.learning_goals || [];
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialSelectedGoals);
  const [expectations, setExpectations] = useState<string>(progress?.formation_data?.expectations || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(current => 
      current.includes(goalId) 
        ? current.filter(id => id !== goalId)
        : [...current, goalId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGoals.length === 0) {
      toast({
        title: "Selecione pelo menos um objetivo",
        description: "Por favor, escolha pelo menos um objetivo de aprendizado",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formationData = {
        ...(progress?.formation_data || {}),
        learning_goals: selectedGoals,
        expectations
      };
      
      await updateProgress({
        formation_data: formationData,
        onboarding_type: 'formacao',
        current_step: 'learning_preferences',
        completed_steps: [...(progress?.completed_steps || []), 'formation_goals']
      });
      
      toast({
        title: "Objetivos salvos",
        description: "Seus objetivos de aprendizado foram salvos com sucesso"
      });
      
      navigate("/onboarding/formacao/preferences");
    } catch (error) {
      console.error("Erro ao salvar objetivos:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao salvar seus objetivos",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MemberLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Objetivos de Aprendizado</h1>
          <p className="text-muted-foreground">
            Diga-nos o que você deseja alcançar com a Formação Viver de IA
          </p>
        </div>
        
        <EtapasProgresso 
          currentStep={currentStepIndex + 1} 
          totalSteps={steps.length} 
        />
        
        <div className="mt-8">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardContent className="p-6">
                <MilagrinhoMessage 
                  message="Quais são seus principais objetivos com a Formação Viver de IA? Isso me ajudará a personalizar sua experiência de aprendizado." 
                />
                
                <div className="mt-6">
                  <Label className="text-base font-medium mb-3 block">
                    Selecione seus objetivos de aprendizado:
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {learningGoalsOptions.map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={goal.id}
                          checked={selectedGoals.includes(goal.id)}
                          onCheckedChange={() => handleGoalToggle(goal.id)}
                        />
                        <Label htmlFor={goal.id} className="cursor-pointer">
                          {goal.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="expectations" className="text-base font-medium mb-2 block">
                    O que você espera conquistar ao final da formação?
                  </Label>
                  <Textarea
                    id="expectations"
                    placeholder="Descreva suas expectativas e objetivos..."
                    className="h-32"
                    value={expectations}
                    onChange={(e) => setExpectations(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/onboarding/formacao/ai-experience")}
                disabled={isSubmitting}
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Continuar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MemberLayout>
  );
};

export default FormacaoGoals;
