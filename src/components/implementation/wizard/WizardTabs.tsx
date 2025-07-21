
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  Eye, 
  Wrench, 
  CheckSquare, 
  Trophy,
  FileText,
  Play
} from "lucide-react";
import { Solution } from "@/lib/supabase";
import { motion } from "framer-motion";

interface WizardTabsProps {
  solution: Solution;
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs: Array<{
    id: string;
    title: string;
    icon: React.ReactNode;
    hasContent: boolean;
  }>;
}

export const WizardTabs: React.FC<WizardTabsProps> = ({
  solution,
  activeTab,
  onTabChange,
  availableTabs
}) => {
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* Enhanced Tab Navigation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 via-transparent to-viverblue-dark/5 rounded-2xl"></div>
          <div className="absolute inset-0 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl"></div>
          
          <TabsList className="relative w-full grid grid-cols-2 md:grid-cols-4 p-4 bg-transparent border-0 h-auto gap-3">
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!tab.hasContent}
                className={cn(
                  "relative flex flex-col items-center gap-3 py-6 px-4 transition-all duration-300 rounded-xl border-0 h-auto min-h-[100px]",
                  "data-[state=active]:bg-gradient-to-br data-[state=active]:from-viverblue/20 data-[state=active]:to-viverblue-dark/25",
                  "data-[state=active]:border data-[state=active]:border-viverblue/40",
                  "data-[state=active]:text-white data-[state=active]:font-semibold",
                  "data-[state=active]:shadow-lg data-[state=active]:shadow-viverblue/15",
                  "data-[state=inactive]:text-neutral-400 data-[state=inactive]:hover:text-neutral-200 data-[state=inactive]:hover:bg-white/8",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "group backdrop-blur-sm"
                )}
              >
                {/* Icon with glow effect */}
                <div className={cn(
                  "transition-all duration-300 relative",
                  activeTab === tab.id ? "text-viverblue-light drop-shadow-[0_0_8px_rgba(0,188,212,0.3)]" : "text-neutral-400 group-hover:text-neutral-300"
                )}>
                  {tab.icon}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 text-viverblue-light blur-sm opacity-50">
                      {tab.icon}
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-sm font-medium leading-none transition-all duration-300 text-center",
                  activeTab === tab.id ? "text-white" : "text-neutral-400 group-hover:text-neutral-300"
                )}>
                  {tab.title}
                </span>
                
                {/* Content indicator */}
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  tab.hasContent 
                    ? activeTab === tab.id 
                      ? "bg-viverblue-light shadow-lg shadow-viverblue/30" 
                      : "bg-neutral-500 group-hover:bg-neutral-400"
                    : "bg-neutral-700"
                )} />
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute -bottom-2 left-4 right-4 h-1 bg-gradient-to-r from-viverblue via-viverblue-light to-viverblue-dark rounded-full shadow-lg shadow-viverblue/30"
                    layoutId="activeTabIndicator" 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content Areas */}
        {availableTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 overflow-hidden"
            >
              <WizardTabContent 
                solution={solution} 
                tabId={tab.id} 
                hasContent={tab.hasContent}
              />
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Individual tab content component
interface WizardTabContentProps {
  solution: Solution;
  tabId: string;
  hasContent: boolean;
}

const WizardTabContent: React.FC<WizardTabContentProps> = ({ 
  solution, 
  tabId, 
  hasContent 
}) => {
  if (!hasContent) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-600 mb-2">
          Conteúdo em Desenvolvimento
        </h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          Esta seção será preenchida quando o administrador adicionar mais detalhes à solução.
        </p>
      </div>
    );
  }

  switch (tabId) {
    case 'overview':
      return (
        <div className="p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-viverblue" />
              Visão Geral da Solução
            </h2>
            <div 
              className="text-neutral-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: solution.overview || "Visão geral não disponível." 
              }}
            />
          </div>
        </div>
      );

    case 'implementation':
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <Wrench className="w-6 h-6 text-viverblue" />
            Passos de Implementação
          </h2>
          {solution.implementation_steps ? (
            <div className="space-y-6">
              {JSON.parse(solution.implementation_steps).map((step: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-viverblue/5 to-transparent p-6 rounded-xl border-l-4 border-viverblue"
                >
                  <h3 className="font-semibold text-lg text-neutral-800 mb-3">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">
                Passos de implementação serão detalhados aqui quando disponíveis.
              </p>
            </div>
          )}
        </div>
      );

    case 'checklist':
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-viverblue" />
            Lista de Verificação
          </h2>
          {solution.checklist_items ? (
            <div className="space-y-4">
              {JSON.parse(solution.checklist_items).map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow"
                >
                  <div className="w-6 h-6 border-2 border-viverblue rounded bg-white flex-shrink-0 mt-0.5"></div>
                  <div>
                    <h4 className="font-medium text-neutral-800">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">
                Itens de verificação serão listados aqui quando disponíveis.
              </p>
            </div>
          )}
        </div>
      );

    case 'completion':
      return (
        <div className="p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-viverblue to-viverblue-dark rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              Parabéns pela Implementação!
            </h2>
            <p className="text-neutral-600 mb-8 leading-relaxed">
              Você completou a implementação da solução <strong>{solution.title}</strong>. 
              Agora é hora de colocar em prática e ver os resultados!
            </p>
            <div className="bg-gradient-to-r from-viverblue/10 to-viverblue-dark/10 p-6 rounded-xl">
              <h3 className="font-semibold text-neutral-800 mb-2">Próximos Passos</h3>
              <p className="text-sm text-neutral-600">
                Continue acompanhando os resultados e ajustes necessários. 
                Lembre-se de documentar suas experiências para futuras implementações.
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-8 text-center">
          <p className="text-neutral-500">Conteúdo da aba não encontrado.</p>
        </div>
      );
  }
};
