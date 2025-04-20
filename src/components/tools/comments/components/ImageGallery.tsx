
import React from 'react';
import { X } from 'lucide-react';

interface ImageGalleryProps {
  images: File[];
  onRemoveImage: (index: number) => void;
}

export const ImageGallery = ({ images, onRemoveImage }: ImageGalleryProps) => {
  if (images.length === 0) return null;
  
  return (
    <div className="mt-2 flex gap-2">
      {images.map((image, index) => (
        <div key={index} className="relative w-16 h-16 border rounded overflow-hidden group">
          <img 
            src={URL.createObjectURL(image)} 
            alt={`Imagem ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemoveImage(index)}
            className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl hidden group-hover:block"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};
