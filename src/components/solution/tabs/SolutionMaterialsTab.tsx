
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { Button } from "@/components/ui/button";
import { Download, FileArchive, FileText } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface SolutionMaterialsTabProps {
  solution: any;
}

interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  format?: string;
  size?: number;
  metadata?: any;
}

const SolutionMaterialsTab: React.FC<SolutionMaterialsTabProps> = ({ solution }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { log, logError } = useLogging("SolutionMaterialsTab");

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Desconhecido";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Buscar materiais vinculados a esta solução (excluindo vídeos)
        const { data, error } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .neq("type", "video")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setMaterials(data || []);
      } catch (error) {
        logError("Erro ao carregar materiais", { error });
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar os materiais desta solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [solution?.id, toast, log, logError]);

  // Registrar download para métricas
  const handleDownload = async (material: Material) => {
    try {
      // Registrar o download antes de iniciar o download
      log("Material baixado", { 
        material_id: material.id,
        material_name: material.name,
        solution_id: solution.id 
      });
    } catch (error) {
      // Silenciosamente falhar
      logError("Erro ao registrar download", { error });
    }
    
    // Iniciar o download
    window.open(material.url, "_blank");
  };

  // Função para obter ícone baseado no tipo
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <img src="/icons/image.svg" alt="Imagem" className="w-6 h-6" />;
      case "pdf": return <img src="/icons/pdf.svg" alt="PDF" className="w-6 h-6" />;
      case "spreadsheet": return <img src="/icons/spreadsheet.svg" alt="Planilha" className="w-6 h-6" />;
      case "presentation": return <img src="/icons/presentation.svg" alt="Apresentação" className="w-6 h-6" />;
      case "document": return <FileText className="w-6 h-6 text-blue-500" />;
      default: return <FileArchive className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhum material disponível para esta solução.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map((material) => (
        <div 
          key={material.id} 
          className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getFileIcon(material.type)}
            </div>
            <div>
              <div className="font-medium">{material.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {material.type}{material.format ? ` (.${material.format})` : ""} • {formatFileSize(material.size)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(material)}
            className="ml-2"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Baixar</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SolutionMaterialsTab;
