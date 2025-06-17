
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar, Filter, TrendingUp } from 'lucide-react';

interface ModernAnalyticsHeaderProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
  category?: string;
  setCategory?: (value: string) => void;
  difficulty?: string;
  setDifficulty?: (value: string) => void;
}

export const ModernAnalyticsHeader: React.FC<ModernAnalyticsHeaderProps> = ({ 
  timeRange, 
  setTimeRange,
  category = 'all',
  setCategory,
  difficulty = 'all',
  setDifficulty 
}) => {
  return (
    <div className="space-y-6">
      {/* Título Principal */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#00EAD9]/20">
          <TrendingUp className="h-6 w-6 text-[#00EAD9]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">
            Insights e métricas da plataforma VIVER DE IA
          </p>
        </div>
      </div>

      {/* Filtros Principais */}
      <Card className="border-gray-800/50 bg-[#151823] p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] bg-[#0F111A] border-gray-700 text-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-gray-700">
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {setCategory && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] bg-[#0F111A] border-gray-700 text-white">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-gray-700">
                  <SelectItem value="all">Todas categorias</SelectItem>
                  <SelectItem value="revenue">Aumento de Receita</SelectItem>
                  <SelectItem value="operational">Otimização Operacional</SelectItem>
                  <SelectItem value="strategy">Gestão Estratégica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {setDifficulty && (
            <div className="flex items-center gap-2">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[160px] bg-[#0F111A] border-gray-700 text-white">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-gray-700">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Avançada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
