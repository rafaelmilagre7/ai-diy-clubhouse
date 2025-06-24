
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, File } from "lucide-react";

interface ResourcesTabProps {
  solution: Solution;
}

export const ResourcesTab = ({ solution }: ResourcesTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-viverblue" />
            Materiais de Apoio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <File className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-300 mb-2">
              Recursos Disponíveis
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              Os materiais de apoio desta solução serão carregados automaticamente quando disponíveis. 
              Inclui templates, PDFs, planilhas e outros arquivos úteis.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview de recursos futuros */}
      <div className="grid gap-4">
        {['Template Inicial', 'Guia de Implementação', 'Checklist'].map((resource, index) => (
          <Card key={index} className="bg-[#151823]/50 border border-white/5 opacity-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-viverblue/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-viverblue" />
                  </div>
                  <div>
                    <h4 className="text-neutral-300 font-medium">
                      {resource}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      Recurso em preparação
                    </p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-neutral-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
