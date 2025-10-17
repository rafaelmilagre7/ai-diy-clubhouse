
import React from 'react';
import { Check } from 'lucide-react';

interface FilePreviewProps {
  url: string;
}

export const FilePreview = ({ url }: FilePreviewProps) => {
  return (
    <div className="mt-2 relative">
      <img
        src={url}
        alt="Preview"
        className="h-20 w-20 object-contain border rounded"
      />
      <div className="absolute top-1 right-1 bg-operational text-white rounded-full p-1">
        <Check className="h-4 w-4" />
      </div>
    </div>
  );
};
