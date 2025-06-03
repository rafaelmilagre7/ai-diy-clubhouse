
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SolutionMaterialCardProps {
  material: any;
}

export const SolutionMaterialCard = ({ material }: SolutionMaterialCardProps) => {
  const handleDownload = () => {
    if (material.url) {
      window.open(material.url, '_blank');
      toast.success(`Baixando ${material.name}...`);
    } else {
      toast.error("Link de download não disponível");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-white/10 bg-backgroundLight hover:bg-backgroundLight/80 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-viverblue/20 rounded-lg flex items-center justify-center">
              {getFileIcon(material.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-textPrimary truncate">
                {material.name}
              </h4>
              <p className="text-sm text-textSecondary mt-1">
                {material.description || "Material de apoio"}
              </p>
              {material.format && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-900/40 text-blue-200 rounded">
                  {material.format.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleDownload}
            className="w-full"
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
