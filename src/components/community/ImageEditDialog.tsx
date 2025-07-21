
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OptimizedImage } from '@/components/common/OptimizedImage';

interface ImageEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  currentAlt: string;
  onSave: (altText: string) => void;
}

export const ImageEditDialog: React.FC<ImageEditDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  currentAlt,
  onSave
}) => {
  const [altText, setAltText] = useState(currentAlt);

  const handleSave = () => {
    onSave(altText);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Imagem</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview da imagem */}
          <div className="border border-border rounded-lg overflow-hidden">
            <OptimizedImage
              src={imageUrl}
              alt={altText || 'Preview da imagem'}
              className="w-full h-64 object-cover"
            />
          </div>
          
          {/* Campo de texto alternativo */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Texto alternativo (Alt Text)</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descreva a imagem para acessibilidade"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              O texto alternativo ajuda pessoas com deficiência visual a entender o conteúdo da imagem.
            </p>
          </div>
          
          {/* URL da imagem (readonly) */}
          <div className="space-y-2">
            <Label>URL da Imagem</Label>
            <Input
              value={imageUrl}
              readOnly
              className="bg-muted text-muted-foreground"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
