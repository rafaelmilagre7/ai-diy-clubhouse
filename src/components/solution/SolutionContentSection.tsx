
import { Solution } from "@/lib/supabase";
import { SafeHtmlRenderer } from "@/components/security/SafeHtmlRenderer";

interface SolutionContentSectionProps {
  solution: Solution;
}

export const SolutionContentSection = ({ solution }: SolutionContentSectionProps) => {
  return (
    <div className="bg-[#151823] border border-white/5 p-6 rounded-lg shadow-sm">
      <div className="prose max-w-none prose-invert">
        <h2 className="text-xl font-semibold mb-4 text-neutral-100">Sobre esta solução</h2>
        
        {solution.overview ? (
          <SafeHtmlRenderer 
            html={solution.overview}
            className="text-neutral-200 prose-headings:text-neutral-100 prose-p:text-neutral-200 prose-strong:text-neutral-100 prose-em:text-neutral-200 prose-li:text-neutral-200"
          />
        ) : (
          <p className="text-neutral-200">{solution.description}</p>
        )}
      </div>
    </div>
  );
};
