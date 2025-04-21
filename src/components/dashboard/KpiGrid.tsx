
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiGrid({ completed, inProgress, total }: { completed: number, inProgress: number, total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in mb-6">
      <Card className="glass-effect shadow-xl border-0">
        <CardContent className="pt-6 flex items-center gap-4">
          <span className="rounded-full bg-[#0ABAB5]/15 p-3">
            <CheckCircle className="h-8 w-8 text-[#0ABAB5]" />
          </span>
          <div>
            <p className="text-md text-gray-600 mb-1">Implementações Completas</p>
            <p className="text-2xl font-extrabold text-gray-900">{completed} <span className="text-xs text-gray-400">de {total}</span></p>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-effect shadow-xl border-0">
        <CardContent className="pt-6 flex items-center gap-4">
          <span className="rounded-full bg-[#0ABAB5]/15 p-3">
            <Clock className="h-8 w-8 text-[#0ABAB5]" />
          </span>
          <div>
            <p className="text-md text-gray-600 mb-1">Em Andamento</p>
            <p className="text-2xl font-extrabold text-gray-900">{inProgress} <span className="text-xs text-gray-400">soluções</span></p>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-effect shadow-xl border-0">
        <CardContent className="pt-6 flex items-center gap-4">
          <span className="rounded-full bg-[#0ABAB5]/15 p-3">
            <TrendingUp className="h-8 w-8 text-[#0ABAB5]" />
          </span>
          <div>
            <p className="text-md text-gray-600 mb-1">Seu Progresso</p>
            <p className="text-2xl font-extrabold text-[#0ABAB5]">{percent}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
