
import React from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Edit, AlertCircle } from "lucide-react";
import { OnboardingProgress } from "@/types/onboarding";

interface ReviewStepProps {
  progress: OnboardingProgress;
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
  navigateToStep: (stepId: string) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  progress,
  onComplete,
  isSubmitting,
  navigateToStep,
}) => {
  // Verificar completude de cada seção
  const isSectionComplete = (section: any): boolean => {
    if (!section) return false;
    
    // Verificar se tem pelo menos algumas propriedades não vazias
    const hasValues = Object.values(section).some(
      value => value !== undefined && value !== null && value !== ''
    );
    
    return hasValues;
  };

  return (
    <div className="space-y-6">
      <div className="text-neutral-300 mb-4">
        <p>Revise as informações que você forneceu. Você pode editar qualquer seção clicando no botão "Editar".</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full divide-y divide-neutral-700/30">
        {/* Informações Pessoais */}
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="py-4 px-4 hover:bg-neutral-800/30 rounded-t-lg transition-colors">
            <div className="flex items-center gap-3">
              {isSectionComplete(progress.personal_info) ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <h3 className="text-lg font-medium text-white">Informações Pessoais</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-neutral-800/20 border-t border-neutral-700/30 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Nome</label>
                  <p className="text-white">{progress.personal_info?.name || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Email</label>
                  <p className="text-white">{progress.personal_info?.email || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Telefone</label>
                  <p className="text-white">
                    {progress.personal_info?.phone ? `${progress.personal_info?.ddi || "+55"} ${progress.personal_info?.phone}` : "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Localização</label>
                  <p className="text-white">
                    {progress.personal_info?.city && progress.personal_info?.state ? 
                      `${progress.personal_info.city}, ${progress.personal_info.state}` : 
                      "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateToStep('personal_info')}
                  className="border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Dados Profissionais */}
        <AccordionItem value="item-2" className="border-none">
          <AccordionTrigger className="py-4 px-4 hover:bg-neutral-800/30 transition-colors">
            <div className="flex items-center gap-3">
              {isSectionComplete(progress.professional_info) ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <h3 className="text-lg font-medium text-white">Dados Profissionais</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-neutral-800/20 border-t border-neutral-700/30 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Empresa</label>
                  <p className="text-white">{progress.professional_info?.company_name || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Cargo</label>
                  <p className="text-white">{progress.professional_info?.current_position || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Tamanho da Empresa</label>
                  <p className="text-white">{progress.professional_info?.company_size || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Setor</label>
                  <p className="text-white">{progress.professional_info?.company_sector || "Não informado"}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateToStep('professional_info')}
                  className="border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Adicionar mais seções aqui (seguindo o mesmo padrão) */}
        {/* Contexto de Negócio */}
        <AccordionItem value="item-3" className="border-none">
          <AccordionTrigger className="py-4 px-4 hover:bg-neutral-800/30 transition-colors">
            <div className="flex items-center gap-3">
              {isSectionComplete(progress.business_context) ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <h3 className="text-lg font-medium text-white">Contexto de Negócio</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-neutral-800/20 border-t border-neutral-700/30 rounded-b-lg">
              <div className="grid grid-cols-1 gap-4">
                {/* Conteúdo da seção */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Desafios de Negócio</label>
                  <p className="text-white">{progress.business_context?.business_challenges?.join(", ") || "Não informado"}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateToStep('business_context')}
                  className="border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Experiência com IA */}
        <AccordionItem value="item-4" className="border-none">
          <AccordionTrigger className="py-4 px-4 hover:bg-neutral-800/30 transition-colors">
            <div className="flex items-center gap-3">
              {isSectionComplete(progress.ai_experience) ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <h3 className="text-lg font-medium text-white">Experiência com IA</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {/* ... similar à seção anterior ... */}
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateToStep('ai_experience')}
                className="border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-8 pt-4 border-t border-neutral-700/30 flex flex-col items-center">
        <Button
          onClick={onComplete}
          disabled={isSubmitting}
          size="lg"
          className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90 text-black font-medium px-10 py-6 h-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Concluir Onboarding
            </>
          )}
        </Button>
        
        <p className="mt-3 text-sm text-neutral-400">
          Ao concluir, você será direcionado para sua trilha personalizada
        </p>
      </div>
    </div>
  );
};
