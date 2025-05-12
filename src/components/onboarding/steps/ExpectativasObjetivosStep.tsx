import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFormNavigation } from '@/hooks/onboarding/useFormNavigation';
import { useUserStats } from '@/hooks/useUserStats';
import { useOnboarding } from '@/hooks/onboarding/useOnboarding';

// Lista de objetivos para exibir
const businessGoals = [
  { id: 'vendas', title: 'Aumentar vendas', category: 'Receita' },
  { id: 'leads', title: 'Gerar mais leads', category: 'Receita' },
  { id: 'marketing', title: 'Otimizar marketing', category: 'Receita' },
  { id: 'automacao', title: 'Automatizar processos', category: 'Operacional' },
  { id: 'atendimento', title: 'Melhorar atendimento', category: 'Operacional' },
  { id: 'processos', title: 'Aprimorar processos', category: 'Operacional' },
  { id: 'decisoes', title: 'Melhorar decisões', category: 'Estratégia' },
  { id: 'escala', title: 'Escalar operações', category: 'Estratégia' },
  { id: 'inovacao', title: 'Criar novas soluções', category: 'Estratégia' }
];

// Interface para a propriedade de dados
export interface ExpectativasObjetivosProps {
  onUpdateData: (data: Record<string, unknown>) => Promise<void>;
  data?: Record<string, unknown>;
}

// Componente memoizado para melhorar performance
const ExpectativasObjetivosStep = React.memo(({ onUpdateData, data }: ExpectativasObjetivosProps) => {
  const { nextStep } = useFormNavigation();
  const { progress } = useOnboarding();
  const form = useFormContext();
  const { stats } = useUserStats();

  // Utilizamos Record<string, boolean> para definir o tipo correto
  const [selectedGoals, setSelectedGoals] = useState<Record<string, boolean>>({});
  const [isPending, setIsPending] = useState<boolean>(false);

  // Usar useMemo para filtragem por categoria
  const goalsByCategory = useMemo(() => {
    const grouped = {
      Receita: businessGoals.filter((goal) => goal.category === 'Receita'),
      Operacional: businessGoals.filter((goal) => goal.category === 'Operacional'),
      Estratégia: businessGoals.filter((goal) => goal.category === 'Estratégia')
    };
    return grouped;
  }, []);

  // Calcular quantos objetivos estão selecionados com useMemo
  const selectedCount = useMemo(() => {
    return Object.values(selectedGoals).filter(Boolean).length;
  }, [selectedGoals]);

  // Efeito para carregar dados existentes
  useEffect(() => {
    if (data?.business_goals && typeof data.business_goals === 'object') {
      setSelectedGoals(data.business_goals as Record<string, boolean>);
    }
  }, [data?.business_goals]);

  // Função para alternar a seleção de um objetivo
  const toggleGoal = useCallback((goalId: string) => {
    setSelectedGoals((prev) => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  }, []);

  // Função para salvar os dados
  const handleSave = useCallback(async () => {
    try {
      setIsPending(true);
      // Se não há seleções, avisa o usuário
      if (selectedCount === 0) {
        alert('Por favor, selecione pelo menos um objetivo.');
        setIsPending(false);
        return;
      }

      await onUpdateData({
        business_goals: selectedGoals
      });
      nextStep();
    } catch (error) {
      console.error('Erro ao salvar objetivos:', error);
    } finally {
      setIsPending(false);
    }
  }, [selectedGoals, selectedCount, nextStep, onUpdateData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Expectativas e Objetivos</h2>
        <p className="text-muted-foreground">
          Quais são seus principais objetivos de negócio com o uso de IA?
        </p>
      </div>

      {/* Grid de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categoria Receita */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-revenue text-white">Receita</Badge>
              <h3 className="font-medium">Crescimento e Vendas</h3>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3">
              {goalsByCategory.Receita.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={goal.id}
                    checked={!!selectedGoals[goal.id]}
                    onCheckedChange={() => toggleGoal(goal.id)}
                  />
                  <label 
                    htmlFor={goal.id}
                    className={cn(
                      "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                      selectedGoals[goal.id] && "font-medium"
                    )}
                  >
                    {goal.title}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categoria Operacional */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-operational text-white">Operacional</Badge>
              <h3 className="font-medium">Eficiência e Processos</h3>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3">
              {goalsByCategory.Operacional.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={goal.id}
                    checked={!!selectedGoals[goal.id]}
                    onCheckedChange={() => toggleGoal(goal.id)}
                  />
                  <label 
                    htmlFor={goal.id}
                    className={cn(
                      "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                      selectedGoals[goal.id] && "font-medium"
                    )}
                  >
                    {goal.title}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categoria Estratégia */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-strategy text-white">Estratégia</Badge>
              <h3 className="font-medium">Gestão e Inovação</h3>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3">
              {goalsByCategory.Estratégia.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={goal.id}
                    checked={!!selectedGoals[goal.id]}
                    onCheckedChange={() => toggleGoal(goal.id)}
                  />
                  <label 
                    htmlFor={goal.id}
                    className={cn(
                      "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                      selectedGoals[goal.id] && "font-medium"
                    )}
                  >
                    {goal.title}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between mt-4 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => nextStep(-1)} 
          disabled={isPending}
        >
          Voltar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isPending || selectedCount === 0}
        >
          {isPending ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
});

ExpectativasObjetivosStep.displayName = 'ExpectativasObjetivosStep';
export default ExpectativasObjetivosStep;
