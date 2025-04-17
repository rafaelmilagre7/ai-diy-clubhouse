
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image, FileArchive, Video } from "lucide-react";
import { Material } from "@/hooks/implementation/useMaterialsData";

interface MaterialItemProps {
  material: Material;
  onDownload: (material: Material) => Promise<void>;
}

export const MaterialItem: React.FC<MaterialItemProps> = ({ material, onDownload }) => {
  // Function to get appropriate icon based on file type
  const getFileIcon = (type: string, format: string | null) => {
    switch(type) {
      case "image":
        return <Image className="h-5 w-5 text-green-600" />;
      case "document":
      case "pdf":
        return <FileText className="h-5 w-5 text-green-600" />;
      case "template":
      case "spreadsheet":
        return <FileText className="h-5 w-5 text-green-600" />;
      case "video":
        return <Video className="h-5 w-5 text-green-600" />;
      default:
        return <FileArchive className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <div className="flex items-start p-4 border rounded-md">
      <div className="bg-green-100 p-2 rounded mr-4">
        {getFileIcon(material.type, material.format)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium">{material.name}</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(material)}
          >
            <Download className="h-4 w-4 mr-1" />
            Baixar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {material.format ? `${material.type.toUpperCase()} - ${material.format}` : material.type}
        </p>
      </div>
    </div>
  );
};
