
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";
import { Material } from "./useMaterialsData";

export const useFileDownload = () => {
  const { log, logError } = useLogging();

  // Function to handle download of file
  const handleDownload = async (material: Material) => {
    try {
      log("Downloading material", { material_id: material.id, material_name: material.name });
      
      // Fetch the file from the URL
      const response = await fetch(material.url);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }
      
      // Get the file content as blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and set properties for download
      const link = document.createElement("a");
      link.href = url;
      link.download = material.name; // Set suggested filename
      link.style.display = "none";
      
      // Add to document, trigger download, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Download iniciado");
    } catch (error) {
      logError("Error downloading file:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  return {
    handleDownload
  };
};
