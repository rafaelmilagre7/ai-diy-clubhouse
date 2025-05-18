
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForumActions } from '@/hooks/forum/useForumActions';
import { useForm } from 'react-hook-form';
import { SendIcon } from 'lucide-react';

interface PostFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  buttonText?: string;
}

interface FormValues {
  content: string;
}

export const PostForm = ({ 
  topicId, 
  parentId,
  onSuccess,
  placeholder = "Escreva seu comentário...",
  buttonText = "Enviar"
}: PostFormProps) => {
  const { createPost } = useForumActions();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      await createPost.mutateAsync({
        content: data.content,
        topicId,
        parentId
      });
      
      reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    }
  };
  
  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-0">
          <Textarea
            {...register('content', { 
              required: 'O conteúdo é obrigatório',
              minLength: { value: 10, message: 'A resposta deve ter pelo menos 10 caracteres' }
            })}
            placeholder={placeholder}
            className="min-h-[100px] resize-y"
          />
          {errors.content && (
            <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end p-0 pt-3">
          <Button type="submit" disabled={isSubmitting}>
            <SendIcon className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
