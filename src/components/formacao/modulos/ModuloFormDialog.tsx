
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

interface Modulo {
  id?: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  published?: boolean;
  course_id: string;
  order_index?: number;
}

interface ModuloFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  modulo?: Modulo;
  courseId: string;
}

export const ModuloFormDialog: React.FC<ModuloFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  modulo,
  courseId
}) => {
  const [formData, setFormData] = useState({
    title: modulo?.title || '',
    description: modulo?.description || '',
    cover_image_url: modulo?.cover_image_url || '',
    published: modulo?.published || false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (modulo) {
      setFormData({
        title: modulo.title || '',
        description: modulo.description || '',
        cover_image_url: modulo.cover_image_url || '',
        published: modulo.published || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        cover_image_url: '',
        published: false
      });
    }
  }, [modulo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      
      if (modulo?.id) {
        // Atualizar módulo existente
        const { error } = await supabase
          .from('learning_modules')
          .update({
            title: formData.title.trim(),
            description: formData.description?.trim() || null,
            cover_image_url: formData.cover_image_url || null,
            published: formData.published,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', modulo.id as any);

        if (error) throw error;
        toast.success('Módulo atualizado com sucesso!');
      } else {
        // Buscar o próximo order_index
        const { data: lastModule } = await supabase
          .from('learning_modules')
          .select('order_index')
          .eq('course_id', courseId as any)
          .order('order_index', { ascending: false })
          .limit(1)
          .single();

        const nextOrderIndex = (lastModule as any)?.order_index ? (lastModule as any).order_index + 1 : 0;

        // Criar novo módulo
        const { error } = await supabase
          .from('learning_modules')
          .insert([{
            title: formData.title.trim(),
            description: formData.description?.trim() || null,
            cover_image_url: formData.cover_image_url || null,
            published: formData.published,
            course_id: courseId,
            order_index: nextOrderIndex
          }] as any);

        if (error) throw error;
        toast.success('Módulo criado com sucesso!');
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
      console.error('Erro ao salvar módulo:', error);
      toast.error(error.message || 'Erro ao salvar módulo');
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
            {modulo ? 'Editar Módulo' : 'Novo Módulo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome do módulo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do módulo (opcional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <ImageUpload
              value={formData.cover_image_url}
              onChange={handleImageUpload}
              bucketName="course_images"
              folder="modules"
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
              {isLoading ? 'Salvando...' : modulo ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuloFormDialog;
