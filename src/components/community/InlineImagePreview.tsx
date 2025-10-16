
import React from 'react';
import { X, Edit3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/common/OptimizedImage';

interface InlineImagePreviewProps {
  src: string;
  alt: string;
  onRemove?: () => void;
  onEdit?: () => void;
  className?: string;
}

export const InlineImagePreview: React.FC<InlineImagePreviewProps> = ({
  src,
  alt,
  onRemove,
  onEdit,
  className = ''
}) => {
  return (
    <div className={`relative group border border-border rounded-lg overflow-hidden bg-card ${className}`}>
      <div className="relative">
        <OptimizedImage
          src={src}
          alt={alt}
          className="w-full h-48 object-cover"
          enableOptimization={true}
        />
        
        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(src, '_blank')}
            className="bg-white/90 hover:bg-white text-black"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="bg-destructive/90 hover:bg-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Remover
            </Button>
          )}
        </div>
      </div>
      
      {/* Alt text */}
      {alt && (
        <div className="p-2 bg-muted/50 text-sm text-muted-foreground border-t">
          <span className="font-medium">Alt:</span> {alt}
        </div>
      )}
    </div>
  );
};
