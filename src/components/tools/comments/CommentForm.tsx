
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { ReplyHeader } from './components/ReplyHeader';
import { ImageGallery } from './components/ImageGallery';
import { CommentControls } from './components/CommentControls';

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
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 2 * 1024 * 1024;
        
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
      <div className="text-center p-4 border border-white/10 rounded-lg bg-backgroundLight">
        <p className="text-textSecondary">
          Faça login para adicionar um comentário.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-border rounded-lg p-4 bg-card">
      <ReplyHeader replyTo={replyTo} onCancelReply={cancelReply} />
      
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.name || 'Usuário'} />
          ) : (
            <AvatarFallback className="bg-aurora-primary/10 text-aurora-primary">
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
            className="min-h-24 resize-none bg-card border-border text-textPrimary focus-visible:ring-aurora-primary"
          />
          
          <ImageGallery 
            images={images} 
            onRemoveImage={removeImage} 
          />
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={images.length >= 3}
          />
          
          <CommentControls 
            imagesCount={images.length}
            isSubmitting={isSubmitting}
            hasComment={comment.trim().length > 0}
            onImageUploadClick={() => fileInputRef.current?.click()}
          />
        </div>
      </div>
    </form>
  );
};
