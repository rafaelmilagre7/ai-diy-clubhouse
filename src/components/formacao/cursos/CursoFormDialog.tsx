
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/formacao/comum/ImageUpload';

interface Curso {
  id?: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  published?: boolean;
}

interface CursoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  curso?: Curso;
}

export const CursoFormDialog: React.FC<CursoFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  curso
}) => {
  const [formData, setFormData] = useState({
    title: curso?.title || '',
    description: curso?.description || '',
    cover_image_url: curso?.cover_image_url || '',
    published: curso?.published || false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (curso) {
      setFormData({
        title: curso.title || '',
        description: curso.description || '',
        cover_image_url: curso.cover_image_url || '',
        published: curso.published || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        cover_image_url: '',
        published: false
      });
    }
  }, [curso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      
      if (curso?.id) {
        // Atualizar curso existente
        const { error } = await supabase
          .from('learning_courses')
          .update({
            title: formData.title.trim(),
            description: formData.description?.trim() || null,
            cover_image_url: formData.cover_image_url || null,
            published: formData.published,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', curso.id as any);

        if (error) throw error;
        toast.success('Curso atualizado com sucesso!');
      } else {
        // Criar novo curso
        const slug = formData.title.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();

        const { error } = await supabase
          .from('learning_courses')
          .insert([{
            title: formData.title.trim(),
            description: formData.description?.trim() || null,
            cover_image_url: formData.cover_image_url || null,
            published: formData.published,
            slug: slug,
            created_by: (await supabase.auth.getUser()).data.user?.id || ''
          }] as any);

        if (error) throw error;
        toast.success('Curso criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        cover_image_url: '',
        published: false
      });
      
    } catch (error: any) {
      console.error('Erro ao salvar curso:', error);
      toast.error(error.message || 'Erro ao salvar curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, cover_image_url: url }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {curso ? 'Editar Curso' : 'Novo Curso'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome do curso"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do curso (opcional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <ImageUpload
              value={formData.cover_image_url}
              onChange={handleImageUpload}
              bucketName="course_images"
              folder="covers"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
            />
            <Label htmlFor="published">Publicado</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : curso ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CursoFormDialog;
