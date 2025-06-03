
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, ExternalLink } from "lucide-react";

interface SolutionMaterialCardProps {
  material: any;
}

export const SolutionMaterialCard = ({ material }: SolutionMaterialCardProps) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleDownload = () => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  return (
    <Card className="border-white/10 bg-backgroundLight hover:bg-backgroundLight/80 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            {getFileIcon(material.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-textPrimary truncate">
                {material.name || material.title}
              </h4>
              {material.description && (
                <p className="text-sm text-textSecondary mt-1">
                  {material.description}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-300">
                  {material.type?.toUpperCase() || 'FILE'}
                </span>
                {material.format && (
                  <span className="text-xs text-textSecondary">
                    {material.format}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="w-full"
            disabled={!material.url}
          >
            {material.type === 'link' ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Link
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
