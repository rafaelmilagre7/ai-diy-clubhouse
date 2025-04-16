
import React, { useEffect, useState } from "react";
import { Module, supabase } from "@/lib/supabase";
import { Download, FileText, Image, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
            console.error("Error fetching materials:", solutionError);
            return;
          }
          
          setMaterials(solutionData || []);
        } else {
          setMaterials(moduleData);
        }
      } catch (err) {
        console.error("Error in materials fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [module.id, module.solution_id]);

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
    return null;
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
                  onClick={() => window.open(material.url, "_blank")}
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
