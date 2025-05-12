
import { Solution } from "@/lib/supabase";

interface SolutionContentSectionProps {
  solution: Solution;
}

export const SolutionContentSection = ({ solution }: SolutionContentSectionProps) => {
  // Função para renderizar o conteúdo HTML de forma segura
  const renderContent = (content: string) => {
    return { __html: content };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="prose max-w-none text-neutral-800">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900">Sobre esta solução</h2>
        
        {solution.overview ? (
          <div 
            className="text-neutral-800" 
            dangerouslySetInnerHTML={renderContent(solution.overview)} 
          />
        ) : (
          <p className="text-neutral-800">{solution.description}</p>
        )}
      </div>
    </div>
  );
};
