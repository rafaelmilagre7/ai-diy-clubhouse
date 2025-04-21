
import { Clock, ArrowRight } from "lucide-react";
import { Solution } from "@/lib/supabase";

interface TrailSolutionCardProps {
  solution: Solution & { priority: number; justification: string };
  onClick: (id: string) => void;
}

export function TrailSolutionCard({ solution, onClick }: TrailSolutionCardProps) {
  return (
    <div
      key={solution.id}
      className="border rounded-lg p-4 hover:border-[#0ABAB5] transition-all cursor-pointer"
      onClick={() => onClick(solution.id)}
    >
      <div className="flex items-start gap-3">
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white
          ${solution.priority === 1
            ? 'bg-green-500'
            : solution.priority === 2
              ? 'bg-blue-500'
              : 'bg-purple-500'}
        `}>
          {solution.priority}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{solution.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {solution.justification}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>
              {solution.estimated_time
                ? `${solution.estimated_time} minutos para implementar`
                : 'Implementação rápida'}
            </span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-[#0ABAB5]" />
      </div>
    </div>
  );
}
