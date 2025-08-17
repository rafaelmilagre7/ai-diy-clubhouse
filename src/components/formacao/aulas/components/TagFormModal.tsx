import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTag, useUpdateTag } from "@/hooks/useLessonTags";
import { LessonTag } from "@/lib/supabase/types/learning";
import { Palette } from "lucide-react";

const tagSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  order_index: z.number().min(0, "Ordem deve ser um número positivo"),
  is_active: z.boolean(),
});

type TagFormData = z.infer<typeof tagSchema>;

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTag?: LessonTag | null;
}

const predefinedColors = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#6b7280", // gray
];

const categories = [
  "Marketing & Conteúdo",
  "Gestão & Operações", 
  "Análise de Dados",
  "Casos & Atendimento",
  "Tecnologia & Programação",
  "formato"
];

export const TagFormModal: React.FC<TagFormModalProps> = ({
  isOpen,
  onClose,
  editingTag,
}) => {
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const [customColor, setCustomColor] = useState("");

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      description: "",
      color: predefinedColors[0],
      category: "",
      order_index: 1,
      is_active: true,
    },
  });

  useEffect(() => {
    if (editingTag) {
      form.reset({
        name: editingTag.name,
        description: editingTag.description || "",
        color: editingTag.color,
        category: editingTag.category,
        order_index: editingTag.order_index,
        is_active: editingTag.is_active,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        color: predefinedColors[0],
        category: "",
        order_index: 1,
        is_active: true,
      });
    }
  }, [editingTag, form]);

  const onSubmit = (data: TagFormData) => {
    if (editingTag) {
      updateTagMutation.mutate(
        { id: editingTag.id, tagData: data },
        {
          onSuccess: () => {
            onClose();
            form.reset();
          },
        }
      );
    } else {
      createTagMutation.mutate(data, {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      });
    }
  };

  const handleColorChange = (color: string) => {
    form.setValue("color", color);
    setCustomColor("");
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    form.setValue("color", color);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingTag ? "Editar Tag" : "Nova Tag"}
          </DialogTitle>
          <DialogDescription>
            {editingTag 
              ? "Edite as informações da tag existente." 
              : "Crie uma nova tag para categorizar as aulas."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Tag</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da tag" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o propósito desta tag"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Cor da Tag</FormLabel>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      form.watch("color") === color 
                        ? "border-primary shadow-lg" 
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <input
                  type="color"
                  value={customColor || form.watch("color")}
                  onChange={handleCustomColorChange}
                  className="w-8 h-8 border rounded cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Cor personalizada
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="order_index"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de Exibição</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Tag Ativa</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2 h-10">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createTagMutation.isPending || updateTagMutation.isPending}
              >
                {createTagMutation.isPending || updateTagMutation.isPending
                  ? "Salvando..."
                  : editingTag 
                  ? "Salvar Alterações" 
                  : "Criar Tag"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};