
import { Solution } from "@/types/supabaseTypes";

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
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">Sobre esta solução</h2>
        
        {solution.overview ? (
          <div dangerouslySetInnerHTML={renderContent(solution.overview)} />
        ) : (
          <p>{solution.description}</p>
        )}
      </div>
    </div>
  );
};
