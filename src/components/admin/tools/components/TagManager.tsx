
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TagManager = ({ form }: any) => {
  const [newTag, setNewTag] = useState("");
  
  const handleAddTag = () => {
    if (newTag.trim() === "") return;
    
    const currentTags = form.getValues("tags") || [];
    const lowercaseNewTag = newTag.toLowerCase().trim();
    
    if (!currentTags.includes(lowercaseNewTag)) {
      form.setValue("tags", [...currentTags, lowercaseNewTag], { shouldDirty: true });
      form.setValue("formModified", true, { shouldDirty: true });
      console.log("Tag adicionada, formModified =", true);
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t: string) => t !== tag),
      { shouldDirty: true }
    );
    form.setValue("formModified", true, { shouldDirty: true });
    console.log("Tag removida, formModified =", true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium border-b pb-2">Tags</h2>
      
      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel>Tags da Ferramenta</FormLabel>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {form.watch("tags")?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {(!form.watch("tags") || form.watch("tags").length === 0) && (
                <span className="text-sm text-muted-foreground">
                  Nenhuma tag adicionada
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="Nova tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <FormDescription>
              Adicione tags para facilitar a busca e categorização da ferramenta
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};
