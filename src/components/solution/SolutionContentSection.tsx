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
        {/* O campo overview não existe - só exibe description */}
        <p className="text-neutral-200">{solution.description}</p>
      </div>
    </div>
  );
};
