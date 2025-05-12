
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: File[];
  onRemoveImage: (index: number) => void;
}

export const ImageGallery = ({ images, onRemoveImage }: ImageGalleryProps) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {images.map((image, index) => (
        <div 
          key={index} 
          className="relative w-16 h-16 group rounded-md overflow-hidden border border-white/10"
        >
          <img
            src={URL.createObjectURL(image)}
            alt={`Anexo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0.5 right-0.5 h-5 w-5 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveImage(index)}
          >
            <X className="h-3 w-3 text-white" />
          </Button>
        </div>
      ))}
    </div>
  );
};
