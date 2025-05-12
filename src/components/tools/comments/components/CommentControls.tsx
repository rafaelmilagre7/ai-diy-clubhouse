
import React from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentControlsProps {
  imagesCount: number;
  isSubmitting: boolean;
  hasComment: boolean;
  onImageUploadClick: () => void;
}

export const CommentControls = ({ 
  imagesCount, 
  isSubmitting, 
  hasComment,
  onImageUploadClick 
}: CommentControlsProps) => {
  return (
    <div className="mt-3 flex justify-between">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onImageUploadClick}
          disabled={imagesCount >= 3}
          className={cn(
            "text-xs bg-backgroundLight border-white/10 text-textSecondary hover:text-textPrimary hover:bg-backgroundLight/80", 
            imagesCount >= 3 && "opacity-50"
          )}
        >
          <ImagePlus className="h-3.5 w-3.5 mr-1" />
          {imagesCount === 0 ? 'Adicionar imagem' : `${imagesCount}/3 imagens`}
        </Button>
      </div>
      
      <Button 
        type="submit" 
        size="sm"
        disabled={isSubmitting || !hasComment}
        className="text-xs bg-viverblue hover:bg-viverblue/90"
      >
        <Send className="h-3.5 w-3.5 mr-1" />
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  );
};
