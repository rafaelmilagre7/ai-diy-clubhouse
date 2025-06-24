
import React from "react";
import ResourceUploadCard from "./ResourceUploadCard";

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
    <div className="text-neutral-800 dark:text-white">
      <ResourceUploadCard 
        handleUploadComplete={onUploadComplete}
        bucketReady={bucketReady}
      />
    </div>
  );
};

export default MaterialUploadSection;
