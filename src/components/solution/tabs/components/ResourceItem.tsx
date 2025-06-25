
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FileText, FileImage, File } from "lucide-react";
import { SolutionResource } from "@/hooks/useSolutionResources";

interface ResourceItemProps {
  resource: SolutionResource;
  onDownload?: (resource: SolutionResource) => void;
}

export const ResourceItem = ({ resource, onDownload }: ResourceItemProps) => {
  const getResourceIcon = () => {
    switch (resource.type) {
      case "material":
        return <FileText className="h-5 w-5 text-viverblue" />;
      case "image":
        return <FileImage className="h-5 w-5 text-viverblue" />;
      default:
        return <File className="h-5 w-5 text-viverblue" />;
    }
  };

  const getResourceTypeLabel = () => {
    switch (resource.type) {
      case "material":
        return "Material";
      case "external_link":
        return "Link Externo";
      case "image":
        return "Imagem";
      default:
        return "Recurso";
    }
  };

  const handleAction = () => {
    if (resource.type === "external_link") {
      window.open(resource.url, "_blank");
    } else if (onDownload) {
      onDownload(resource);
    } else {
      window.open(resource.url, "_blank");
    }
  };

  return (
    <Card className="bg-[#151823] border border-white/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="bg-viverblue/20 p-2 rounded-lg">
            {getResourceIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-neutral-100 line-clamp-1">
                {resource.name}
              </h4>
              <Badge variant="outline" className="bg-neutral-800 text-neutral-300 border-neutral-700 text-xs">
                {getResourceTypeLabel()}
              </Badge>
            </div>
            
            {resource.description && (
              <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
                {resource.description}
              </p>
            )}
            
            {resource.format && (
              <p className="text-xs text-neutral-500 uppercase mb-3">
                {resource.format}
              </p>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAction}
              className="bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10"
            >
              {resource.type === "external_link" ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
