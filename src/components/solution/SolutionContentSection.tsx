
import { Solution } from "@/lib/supabase";
import { createSafeHTML } from '@/utils/htmlSanitizer';

interface SolutionContentSectionProps {
  solution: Solution;
}

export const SolutionContentSection = ({ solution }: SolutionContentSectionProps) => {
  // Função para renderizar o conteúdo HTML de forma segura
  const renderContent = (content: string) => {
    return { __html: content };
  };

  return (
    <div className="bg-[#151823] border border-white/5 p-6 rounded-lg shadow-sm">
      <div className="prose max-w-none prose-invert">
        <h2 className="text-xl font-semibold mb-4 text-neutral-100">Sobre esta solução</h2>
        
        {solution.overview ? (
          <div 
            className="text-neutral-200 prose-headings:text-neutral-100 prose-p:text-neutral-200 prose-strong:text-neutral-100 prose-em:text-neutral-200 prose-li:text-neutral-200" 
            dangerouslySetInnerHTML={createSafeHTML(renderContent(solution.overview).__html)} 
          />
        ) : (
          <p className="text-neutral-200">{solution.description}</p>
        )}
      </div>
    </div>
  );
};
