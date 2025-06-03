
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabBasedMaterialsSectionProps {
  solutionId: string;
  materials: any[];
  onSectionComplete?: () => void;
  onValidation?: (downloadCount: number, timeSpent: number) => { isValid: boolean; message?: string; requirement?: string; };
  isCompleted?: boolean;
}

export const TabBasedMaterialsSection = ({ 
  solutionId, 
  materials, 
  onSectionComplete, 
  onValidation, 
  isCompleted 
}: TabBasedMaterialsSectionProps) => {
  const handleDownload = (material: any) => {
    if (material.file_url || material.url) {
      window.open(material.file_url || material.url, '_blank');
    }
  };

  if (materials.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Materiais de Apoio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum material disponível</h3>
              <p className="text-muted-foreground">
                Esta solução não possui materiais de apoio adicionais.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Materiais de Apoio
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Baixe os materiais necessários para implementar esta solução
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {materials.map((material, index) => (
          <Card key={material.id || index} className="border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">
                    {material.name || material.title || "Material"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {material.description || "Material de apoio para implementação."}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {material.type && (
                      <span className="capitalize">{material.type}</span>
                    )}
                    {material.file_size_bytes && (
                      <span>{Math.round(material.file_size_bytes / 1024)} KB</span>
                    )}
                  </div>
                </div>
                
                {(material.file_url || material.url) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(material)}
                    className="ml-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
