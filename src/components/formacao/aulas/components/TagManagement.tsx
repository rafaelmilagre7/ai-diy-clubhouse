import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAllLessonTags, useDeleteTag, useUpdateTag } from "@/hooks/useLessonTags";
import { LessonTag } from "@/lib/supabase/types/learning";
import { TagFormModal } from "./TagFormModal";

export const TagManagement: React.FC = () => {
  const { data: tags = [], isLoading } = useAllLessonTags();
  const deleteTagMutation = useDeleteTag();
  const updateTagMutation = useUpdateTag();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<LessonTag | null>(null);
  const [deletingTag, setDeletingTag] = useState<LessonTag | null>(null);

  // Agrupar tags por categoria
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, LessonTag[]>);

  const handleCreateTag = () => {
    setEditingTag(null);
    setIsFormModalOpen(true);
  };

  const handleEditTag = (tag: LessonTag) => {
    setEditingTag(tag);
    setIsFormModalOpen(true);
  };

  const handleDeleteTag = (tag: LessonTag) => {
    setDeletingTag(tag);
  };

  const confirmDeleteTag = () => {
    if (deletingTag) {
      deleteTagMutation.mutate(deletingTag.id);
      setDeletingTag(null);
    }
  };

  const handleToggleTagStatus = (tag: LessonTag) => {
    updateTagMutation.mutate({
      id: tag.id,
      tagData: { is_active: !tag.is_active }
    });
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingTag(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando tags...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestão de Tags das Aulas</CardTitle>
          <Button onClick={handleCreateTag}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tag
          </Button>
        </CardHeader>
        <CardContent>
          {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                {category}
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">
                          <Badge 
                            style={{ backgroundColor: tag.color }}
                            className="text-white"
                          >
                            {tag.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={tag.description || ""}>
                            {tag.description || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {tag.color}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{tag.order_index}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={tag.is_active ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleToggleTagStatus(tag)}
                          >
                            {tag.is_active ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Ativa
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inativa
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTag(tag)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTag(tag)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          {Object.keys(tagsByCategory).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma tag encontrada. Clique em "Nova Tag" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      <TagFormModal 
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        editingTag={editingTag}
      />

      <AlertDialog 
        open={!!deletingTag}
        onOpenChange={(open) => !open && setDeletingTag(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja deletar a tag "{deletingTag?.name}"? 
              Esta ação também removerá a tag de todas as aulas associadas e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTag}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};