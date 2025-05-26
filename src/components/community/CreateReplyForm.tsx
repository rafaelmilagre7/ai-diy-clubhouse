
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X } from 'lucide-react';
import { useReplyForm } from '@/hooks/useReplyForm';
import { useAuth } from '@/contexts/auth';
import { getInitials } from '@/utils/user';

interface CreateReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const CreateReplyForm: React.FC<CreateReplyFormProps> = ({
  topicId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Escreva sua resposta..."
}) => {
  const { user } = useAuth();
  
  const {
    content,
    isSubmitting,
    textareaRef,
    handleTextareaInput,
    handleSubmit,
    handleCancel
  } = useReplyForm({
    topicId,
    parentId,
    onSuccess,
    onCancel
  });

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Faça login para participar da discussão.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {getInitials(user.user_metadata?.name || user.email || 'Usuário')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={content}
                onChange={handleTextareaInput}
                className="min-h-[100px] resize-none border-gray-200 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Responder'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
