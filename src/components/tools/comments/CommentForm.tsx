
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types/commentTypes';
import { X, ImagePlus, Send } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  comment: string;
  setComment: (text: string) => void;
  replyTo: Comment | null;
  cancelReply: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const CommentForm = ({
  comment,
  setComment,
  replyTo,
  cancelReply,
  onSubmit,
  isSubmitting
}: CommentFormProps) => {
  const { user, profile } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        // Verificar tipo e tamanho
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB
        
        if (!isValidType) {
          alert('Somente imagens são permitidas.');
        }
        
        if (!isValidSize) {
          alert('O tamanho máximo permitido é 2MB.');
        }
        
        return isValidType && isValidSize;
      });
      
      if (images.length + validFiles.length > 3) {
        alert('Máximo de 3 imagens permitido.');
        const allowedCount = 3 - images.length;
        setImages(prev => [...prev, ...validFiles.slice(0, allowedCount)]);
      } else {
        setImages(prev => [...prev, ...validFiles]);
      }
    }
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="text-center p-4 border rounded-lg bg-gray-50">
        <p className="text-muted-foreground">
          Faça login para adicionar um comentário.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border rounded-lg p-4 bg-white">
      {replyTo && (
        <div className="mb-3 flex items-center justify-between bg-gray-50 p-2 rounded">
          <div className="text-sm">
            Respondendo a <span className="font-medium">{replyTo.profile?.name}</span>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={cancelReply}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.name || 'Usuário'} />
          ) : (
            <AvatarFallback className="bg-[#0ABAB5]/10 text-[#0ABAB5]">
              {getInitials(profile?.name)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            id="comment-input"
            placeholder={replyTo ? "Escreva sua resposta..." : "Compartilhe sua experiência ou dica..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-24 resize-none"
          />
          
          {/* Lista de imagens selecionadas */}
          {images.length > 0 && (
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
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl hidden group-hover:block"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3 flex justify-between">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={images.length >= 3}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 3}
                className={cn("text-xs", images.length >= 3 && "opacity-50")}
              >
                <ImagePlus className="h-3.5 w-3.5 mr-1" />
                {images.length === 0 ? 'Adicionar imagem' : `${images.length}/3 imagens`}
              </Button>
            </div>
            
            <Button 
              type="submit" 
              size="sm"
              disabled={isSubmitting || !comment.trim()}
              className="text-xs"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
