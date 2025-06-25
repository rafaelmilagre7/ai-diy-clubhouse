
import { Card, CardContent } from "@/components/ui/card";
import { Target, Lightbulb } from "lucide-react";

export const NoSolutionsPlaceholder = () => {
  return (
    <div className="text-center py-12">
      <Card className="bg-[#151823] border border-white/5 max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-viverblue/20 p-3 rounded-full">
              <Lightbulb className="h-8 w-8 text-viverblue" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-neutral-100 mb-2">
            Preparando suas soluções
          </h3>
          
          <p className="text-neutral-400 mb-6">
            Estamos carregando as soluções personalizadas para o seu negócio. 
            Em breve você terá acesso a estratégias que vão acelerar seus resultados.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-viverblue">
            <Target className="h-4 w-4" />
            <span>Aguarde um momento...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
