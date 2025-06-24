
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, File } from "lucide-react";
import { useSolutionResources } from "@/hooks/useSolutionResources";
import { ResourceItem } from "./components/ResourceItem";
import { Skeleton } from "@/components/ui/skeleton";

interface ResourcesTabProps {
  solution: Solution;
}

export const ResourcesTab = ({ solution }: ResourcesTabProps) => {
  const { resources, loading, error } = useSolutionResources(solution.id);

  const handleDownload = (resource: any) => {
    // TODO: Implementar lógica de download
    window.open(resource.url, "_blank");
  };

  if (loading) {
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-white/5 rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
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
                Erro ao carregar recursos
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Houve um problema ao carregar os materiais de apoio. Tente novamente mais tarde.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resources.length === 0) {
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
                Nenhum material disponível
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Esta solução ainda não possui materiais de apoio adicionais. 
                Fique atento às atualizações!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <p className="text-neutral-400 mb-6">
            Faça download dos materiais complementares para implementar esta solução com mais facilidade.
          </p>
          
          <div className="grid gap-4">
            {resources.map((resource) => (
              <ResourceItem 
                key={resource.id} 
                resource={resource} 
                onDownload={handleDownload}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
