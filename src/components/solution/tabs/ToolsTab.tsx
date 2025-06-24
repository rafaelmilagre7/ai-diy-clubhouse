
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, ExternalLink, Star } from "lucide-react";

interface ToolsTabProps {
  solution: Solution;
}

export const ToolsTab = ({ solution }: ToolsTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-viverblue" />
            Ferramentas Necessárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-300 mb-2">
              Ferramentas Recomendadas
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              As ferramentas necessárias para implementar esta solução serão listadas aqui, 
              incluindo links diretos e instruções de uso.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview de ferramentas futuras */}
      <div className="grid gap-4">
        {['Ferramenta Principal', 'Ferramenta Opcional', 'Ferramenta Avançada'].map((tool, index) => (
          <Card key={index} className="bg-[#151823]/50 border border-white/5 opacity-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-viverblue/20 rounded-lg flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-viverblue" />
                  </div>
                  <div>
                    <h4 className="text-neutral-300 font-medium flex items-center gap-2">
                      {tool}
                      {index === 0 && <Star className="h-4 w-4 text-amber-400" />}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      {index === 0 ? 'Obrigatória' : 'Opcional'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-neutral-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
