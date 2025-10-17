
import { Solution } from "@/lib/supabase";
import { createSafeHTML } from '@/utils/htmlSanitizer';

interface SolutionContentSectionProps {
  solution: Solution;
}

export const SolutionContentSection = ({ solution }: SolutionContentSectionProps) => {
  return (
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl group hover:bg-white/8 transition-all duration-500">
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
        <div className="absolute inset-0 rounded-xl" style={{
          backgroundImage: 'var(--pattern-dots-light)',
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-viverblue/15 to-viverblue-dark/15 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative prose max-w-none prose-invert">
        <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent">
          Sobre esta solução
        </h2>
        
        {/* Apenas overview no content - conteúdo detalhado */}
        {solution.overview ? (
          <div 
            className="text-neutral-200 prose-headings:text-neutral-100 prose-p:text-neutral-200 prose-strong:text-neutral-100 prose-em:text-neutral-200 prose-li:text-neutral-200" 
            dangerouslySetInnerHTML={createSafeHTML(solution.overview || '')} 
          />
        ) : (
          <div className="text-neutral-300">
            <p className="mb-4">Esta solução ainda não possui um conteúdo detalhado.</p>
            <p className="text-sm text-neutral-400">
              Para começar a implementação, clique no botão "Começar Implementação" na barra lateral.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
