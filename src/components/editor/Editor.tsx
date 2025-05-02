
import React from 'react';
import { ImageUpload } from '@/components/formacao/comum/ImageUpload';

interface EditorProps {
  value: any;
  onChange: (value: any) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <ImageUpload
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        bucketName="learning_images"
        folderPath="covers"
      />
    </div>
  );
};
