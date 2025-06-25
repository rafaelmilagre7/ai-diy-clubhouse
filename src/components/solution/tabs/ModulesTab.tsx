
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, FileText } from "lucide-react";

interface ModulesTabProps {
  solution: Solution;
}

export const ModulesTab = ({ solution }: ModulesTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <Play className="h-5 w-5 text-viverblue" />
            Módulos da Solução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-300 mb-2">
              Módulos em Desenvolvimento
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              Os módulos desta solução estão sendo estruturados. Em breve você poderá visualizar 
              todo o conteúdo educacional organizado por etapas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview dos módulos futuros */}
      <div className="grid gap-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="bg-[#151823]/50 border border-white/5 opacity-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-viverblue/20 rounded-lg flex items-center justify-center">
                    <span className="text-viverblue font-semibold">{index}</span>
                  </div>
                  <div>
                    <h4 className="text-neutral-300 font-medium">
                      Módulo {index} - Em breve
                    </h4>
                    <p className="text-sm text-neutral-500">
                      Conteúdo sendo preparado
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">--:--</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
