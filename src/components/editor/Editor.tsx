
import React from 'react';
import { FileUpload } from '@/components/ui/file-upload';

interface EditorProps {
  value: any;
  onChange: (value: any) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <FileUpload
        bucketName="learning_images"
        folder="covers"
        onUploadComplete={(url) => onChange(url)}
        accept="image/*"
        maxSize={5}
        buttonText="Fazer upload de imagem de capa"
        fieldLabel="Imagem da capa da aula"
        initialFileUrl={typeof value === 'string' ? value : undefined}
      />
    </div>
  );
};
