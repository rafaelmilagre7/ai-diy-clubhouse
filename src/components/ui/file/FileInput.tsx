
import React from "react";
import { Input } from "@/components/ui/input";
import { FileIcon, X } from "lucide-react";

interface FileInputProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  accept: string;
  uploading: boolean;
  fieldLabel?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  file,
  onFileChange,
  onClearFile,
  accept,
  uploading,
  fieldLabel
}) => {
  return (
    <div className="space-y-4">
      {fieldLabel && (
        <label className="block text-sm font-medium text-gray-700">
          {fieldLabel}
        </label>
      )}
      
      <div className="relative flex-1">
        <Input
          type="file"
          accept={accept}
          onChange={onFileChange}
          className={`cursor-pointer ${file ? 'file:hidden' : ''}`}
          disabled={uploading}
        />
        {file && (
          <div className="absolute inset-0 flex items-center">
            <div className="bg-muted rounded px-3 py-2 w-full flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileIcon className="h-4 w-4 text-primary" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <button 
                type="button"
                onClick={onClearFile} 
                className="p-1 hover:bg-muted rounded-full"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
