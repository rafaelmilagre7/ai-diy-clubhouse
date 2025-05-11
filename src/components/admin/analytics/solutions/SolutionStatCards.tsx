
import React from 'react';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { BookOpen, FileCheck, Clock, Award } from 'lucide-react';

interface SolutionStatCardsProps {
  totalSolutions: number;
  publishedSolutions: number;
  drafts: number;
  avgCompletionRate: number;
  loading: boolean;
}

export const SolutionStatCards: React.FC<SolutionStatCardsProps> = ({
  totalSolutions,
  publishedSolutions,
  drafts,
  avgCompletionRate,
  loading
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Soluções" 
          value="-" 
          icon={<BookOpen className="h-6 w-6" />}
          colorScheme="blue"
        />
        <StatCard 
          title="Soluções Publicadas" 
          value="-" 
          icon={<FileCheck className="h-6 w-6" />}
          colorScheme="green"
        />
        <StatCard 
          title="Rascunhos" 
          value="-" 
          icon={<Clock className="h-6 w-6" />}
          colorScheme="orange"
        />
        <StatCard 
          title="Taxa Média de Conclusão" 
          value="-" 
          icon={<Award className="h-6 w-6" />}
          colorScheme="blue"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total de Soluções" 
        value={totalSolutions} 
        icon={<BookOpen className="h-6 w-6" />}
        colorScheme="blue"
      />
      <StatCard 
        title="Soluções Publicadas" 
        value={publishedSolutions} 
        icon={<FileCheck className="h-6 w-6" />}
        colorScheme="green"
      />
      <StatCard 
        title="Rascunhos" 
        value={drafts} 
        icon={<Clock className="h-6 w-6" />}
        colorScheme="orange"
      />
      <StatCard 
        title="Taxa Média de Conclusão" 
        value={`${avgCompletionRate}%`} 
        icon={<Award className="h-6 w-6" />}
        colorScheme="blue"
      />
    </div>
  );
};
