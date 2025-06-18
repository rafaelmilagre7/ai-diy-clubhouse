
import React, { useState } from 'react';
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
import { FileUpload } from '@/components/formacao/comum/FileUpload';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Material {
  id?: string;
  name: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size_bytes?: number;
}

interface RecursoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  material?: Material;
  recurso?: any; // Adicionar suporte para a propriedade recurso também
  lessonId?: string; // Adicionar suporte para lessonId
}

export const RecursoFormDialog: React.FC<RecursoFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  material,
  recurso,
  lessonId
}) => {
  // Usar recurso se material não estiver disponível (para compatibilidade)
  const editingItem = material || recurso;
  
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    file_url: editingItem?.file_url || '',
    file_type: editingItem?.file_type || '',
    file_size_bytes: editingItem?.file_size_bytes || 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.file_url) {
      toast.error('Arquivo é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      
      const materialData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        file_url: formData.file_url,
        file_type: formData.file_type || 'document',
        file_size_bytes: formData.file_size_bytes || null,
        created_at: new Date().toISOString(),
        ...(lessonId && { lesson_id: lessonId }) // Adicionar lesson_id se fornecido
      };

      if (editingItem?.id) {
        // Atualizar material existente
        const { error } = await supabase
          .from('learning_resources')
          .update(materialData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Material atualizado com sucesso!');
      } else {
        // Criar novo material
        const { error } = await supabase
          .from('learning_resources')
          .insert([materialData]);

        if (error) throw error;
        toast.success('Material criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        file_url: '',
        file_type: '',
        file_size_bytes: 0
      });
      
    } catch (error: any) {
      console.error('Erro ao salvar material:', error);
      toast.error(error.message || 'Erro ao salvar material');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (url: string, fileType: string, fileSize: number) => {
    setFormData(prev => ({
      ...prev,
      file_url: url,
      file_type: fileType,
      file_size_bytes: fileSize
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar Material' : 'Novo Material'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do material"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do material (opcional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo *</Label>
            <FileUpload
              value={formData.file_url}
              onChange={handleFileUpload}
              bucketName="lesson_materials"
              folder="resources"
              accept="*"
            />
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
              {isLoading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecursoFormDialog;
