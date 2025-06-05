
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BenefitStatsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estatísticas de Benefícios</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho das parcerias e benefícios oferecidos aos membros
        </p>
      </div>
      
      <Link to="/admin/tools/new">
        <Button className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Ferramenta com Benefício
        </Button>
      </Link>
    </div>
  );
};
