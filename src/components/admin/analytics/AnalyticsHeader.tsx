
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
    <div className="mb-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Acompanhe as métricas e performance da plataforma VIVER DE IA
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium block mb-2">Período</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
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
                  <SelectTrigger className="w-[180px]">
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
                  <SelectTrigger className="w-[180px]">
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
    </div>
  );
};
