
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiGrid({ completed, inProgress, total }: { completed: number, inProgress: number, total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in mb-6">
      <Card className="glassmorphism border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
        <CardContent className="pt-6 flex items-center gap-4">
          <span className="rounded-full bg-gradient-to-br from-green-500/20 to-green-400/5 p-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </span>
          <div>
            <p className="text-md text-neutral-600 mb-1 font-medium">Implementações Completas</p>
            <p className="text-2xl font-extrabold text-neutral-900 font-heading">{completed} <span className="text-xs text-neutral-400">de {total}</span></p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-viverblue to-viverblue-light"></div>
        <CardContent className="pt-6 flex items-center gap-4">
          <span className="rounded-full bg-gradient-to-br from-viverblue/20 to-viverblue-light/5 p-3">
            <Clock className="h-8 w-8 text-viverblue" />
          </span>
          <div>
            <p className="text-md text-neutral-600 mb-1 font-medium">Em Andamento</p>
            <p className="text-2xl font-extrabold text-neutral-900 font-heading">{inProgress} <span className="text-xs text-neutral-400">soluções</span></p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <CardContent className="pt-6 flex items-center gap-4">
          <span className="rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/5 p-3">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
          </span>
          <div>
            <p className="text-md text-neutral-600 mb-1 font-medium">Seu Progresso</p>
            <p className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 font-heading">{percent}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
