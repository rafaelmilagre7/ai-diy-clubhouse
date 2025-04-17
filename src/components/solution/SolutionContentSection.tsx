
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
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">Sobre esta solução</h2>
        
        {solution.overview ? (
          <div dangerouslySetInnerHTML={renderContent(solution.overview)} />
        ) : (
          <>
            <p>
              {solution.description}
            </p>
            <h3 className="text-lg font-medium mt-6 mb-3">Benefícios</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="bg-green-100 p-1 rounded-full mr-2 mt-1">✓</span>
                <span>Economia de tempo operacional significativa</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 p-1 rounded-full mr-2 mt-1">✓</span>
                <span>Aumento da satisfação dos clientes</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 p-1 rounded-full mr-2 mt-1">✓</span>
                <span>Redução de custos operacionais</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 p-1 rounded-full mr-2 mt-1">✓</span>
                <span>Escalabilidade do seu negócio</span>
              </li>
            </ul>
            
            <h3 className="text-lg font-medium mt-6 mb-3">Pré-requisitos</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-100 p-1 rounded-full mr-2 mt-1">•</span>
                <span>Conta nas ferramentas necessárias</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 p-1 rounded-full mr-2 mt-1">•</span>
                <span>Conhecimento básico de tecnologia</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 p-1 rounded-full mr-2 mt-1">•</span>
                <span>Acesso às credenciais da sua empresa</span>
              </li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
