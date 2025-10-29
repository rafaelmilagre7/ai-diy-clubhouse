
import React from "react";
import ResourceUploadCard from "./ResourceUploadCard";
// Toast não usado diretamente neste componente - gerenciado pelo pai
import { supabase } from "@/lib/supabase";
import { ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";

interface MaterialUploadSectionProps {
  solutionId: string | null;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
  bucketReady?: boolean;
}

const MaterialUploadSection: React.FC<MaterialUploadSectionProps> = ({
  solutionId,
  onUploadComplete,
  bucketReady = true
}) => {
  return (
    <div className="text-foreground">
      <ResourceUploadCard 
        handleUploadComplete={onUploadComplete}
        bucketReady={bucketReady}
      />
    </div>
  );
};

export default MaterialUploadSection;
