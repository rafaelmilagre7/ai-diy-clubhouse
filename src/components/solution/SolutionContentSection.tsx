
import { CheckCircle, ArrowRight } from "lucide-react";
import { Solution } from "@/lib/supabase";

interface SolutionContentSectionProps {
  solution: Solution;
}

export const SolutionContentSection = ({ solution }: SolutionContentSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Descrição</h2>
        <p className="mt-2 text-muted-foreground">{solution.description}</p>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold">O que você vai aprender</h2>
        <ul className="mt-2 space-y-2">
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>Como configurar o ambiente para sua solução de IA</span>
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>Implementação passo a passo guiada e testada</span>
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>Otimização para máximo desempenho</span>
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>Métricas para acompanhamento de resultados</span>
          </li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold">Esta solução é ideal para você se...</h2>
        <ul className="mt-2 space-y-2">
          <li className="flex items-center">
            <ArrowRight className="h-5 w-5 text-viverblue mr-2" />
            <span>Você quer aumentar a produtividade da sua equipe</span>
          </li>
          <li className="flex items-center">
            <ArrowRight className="h-5 w-5 text-viverblue mr-2" />
            <span>Você busca uma solução pronta para implementar hoje</span>
          </li>
          <li className="flex items-center">
            <ArrowRight className="h-5 w-5 text-viverblue mr-2" />
            <span>Você quer resultados rápidos e mensuráveis</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
