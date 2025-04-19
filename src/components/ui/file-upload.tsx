
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UploadControls } from './file/UploadControls';
import { FilePreview } from './file/FilePreview';

interface FileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  accept?: string;
  maxSize?: number;
  buttonText?: string;
  fieldLabel?: string;
  initialFileUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  folder,
  onUploadComplete,
  accept = '*',
  maxSize = 5,
  buttonText = 'Upload do Arquivo',
  fieldLabel = 'Selecione um arquivo',
  initialFileUrl
}) => {
  const {
    uploading,
    uploadedFileUrl,
    fileName,
    error,
    handleFileUpload,
    setUploadedFileUrl
  } = useFileUpload({
    bucketName,
    folder,
    onUploadComplete,
    maxSize
  });

  useEffect(() => {
    if (initialFileUrl) {
      setUploadedFileUrl(initialFileUrl);
    }
  }, [initialFileUrl, setUploadedFileUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    handleFileUpload(files[0]);
  };

  const handleButtonClick = () => {
    document.getElementById('file-upload')?.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="file-upload">{fieldLabel}</Label>
        
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        <UploadControls
          uploading={uploading}
          buttonText={buttonText}
          onButtonClick={handleButtonClick}
          fileName={fileName}
          error={error}
        />
        
        {uploadedFileUrl && !error && (
          <FilePreview url={uploadedFileUrl} />
        )}
      </div>
    </div>
  );
};
