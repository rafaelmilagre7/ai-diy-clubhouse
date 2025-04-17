
import React, { useEffect, useState } from "react";
import { Module, supabase } from "@/lib/supabase";
import { Download, FileText, Image, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

interface ModuleContentMaterialsProps {
  module: Module;
}

interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  format: string | null;
  solution_id: string;
  module_id: string | null;
}

export const ModuleContentMaterials = ({ module }: ModuleContentMaterialsProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        
        // First try to find materials specific to this module
        let { data: moduleData, error: moduleError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("module_id", module.id);
        
        // If no module-specific materials or error, fetch solution-level materials
        if (moduleError || !moduleData || moduleData.length === 0) {
          const { data: solutionData, error: solutionError } = await supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", module.solution_id)
            .is("module_id", null);
          
          if (solutionError) {
            logError("Error fetching materials:", solutionError);
            return;
          }
          
          // Filter out video types - they should be in the Videos tab only
          const filteredData = (solutionData || []).filter(
            item => item.type !== 'video' && item.type !== 'youtube'
          );
          
          setMaterials(filteredData);
        } else {
          // Filter out video types from module data too
          const filteredModuleData = moduleData.filter(
            item => item.type !== 'video' && item.type !== 'youtube'
          );
          
          setMaterials(filteredModuleData);
        }
      } catch (err) {
        logError("Error in materials fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [module.id, module.solution_id, log, logError]);

  // Function to handle download of file
  const handleDownload = async (material: Material) => {
    try {
      log("Downloading material", { material_id: material.id, material_name: material.name });
      
      // Create an anchor element and set properties for download
      const link = document.createElement("a");
      link.href = material.url;
      link.download = material.name; // Set suggested filename
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      // Required for Firefox
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      toast.success("Download iniciado");
    } catch (error) {
      logError("Error downloading file:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Materiais de Apoio</h3>
        {[1, 2].map((i) => (
          <div key={i} className="flex items-start p-4 border rounded-md">
            <div className="bg-green-100 p-2 rounded mr-4">
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum material de apoio disponível para esta solução.</p>
      </div>
    );
  }

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
      default:
        return <FileArchive className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Materiais de Apoio</h3>
      <p className="text-muted-foreground">
        Baixe os materiais necessários para implementar esta solução:
      </p>
      
      <div className="space-y-3 mt-4">
        {materials.map((material) => (
          <div key={material.id} className="flex items-start p-4 border rounded-md">
            <div className="bg-green-100 p-2 rounded mr-4">
              {getFileIcon(material.type, material.format)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{material.name}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material)}
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
        ))}
      </div>
    </div>
  );
};
