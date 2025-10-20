
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsHeaderProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
  category?: string;
  setCategory?: (value: string) => void;
  difficulty?: string;
  setDifficulty?: (value: string) => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ 
  timeRange, 
  setTimeRange,
  category = 'all',
  setCategory,
  difficulty = 'all',
  setDifficulty 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-md items-center">
          <div>
            <label className="text-sm font-medium block mb-sm">Período</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-select-lg">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {setCategory && (
            <div>
              <label className="text-sm font-medium block mb-2">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-select-lg">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="revenue">Aumento de Receita</SelectItem>
                  <SelectItem value="operational">Otimização Operacional</SelectItem>
                  <SelectItem value="strategy">Gestão Estratégica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {setDifficulty && (
            <div>
              <label className="text-sm font-medium block mb-2">Dificuldade</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-select-lg">
                  <SelectValue placeholder="Selecionar dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as dificuldades</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Avançada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
