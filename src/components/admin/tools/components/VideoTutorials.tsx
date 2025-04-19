
import { useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { useEffect } from "react";

export const VideoTutorials = ({ form }: any) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "video_tutorials",
  });

  // Garantir que qualquer mudança nos vídeos force uma reavaliação do estado do formulário
  useEffect(() => {
    // Marcar o formulário como modificado explicitamente se houver alterações nos vídeos
    console.log("Video tutorials atualizados:", fields);
    form.setValue("formModified", true, { shouldDirty: true });
  }, [fields.length]);

  const handleAddVideo = () => {
    append({ title: "", url: "", type: "youtube" });
    // Importante: Marcar formulário como modificado após adicionar vídeo
    form.setValue("formModified", true, { shouldDirty: true });
    console.log("Vídeo adicionado, formModified =", true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tutoriais em Vídeo</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddVideo}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="p-8 text-center border rounded-lg bg-muted/20">
            <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum tutorial em vídeo adicionado
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleAddVideo}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Vídeo
            </Button>
          </div>
        ) : (
          fields.map((field, index) => (
            <Card key={field.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name={`video_tutorials.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Vídeo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Como configurar a ferramenta" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              // Marcar que houve mudança
                              form.setValue("formModified", true, { shouldDirty: true });
                              console.log("Título alterado, formModified =", true);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`video_tutorials.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Vídeo</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Marcar que houve mudança
                            form.setValue("formModified", true, { shouldDirty: true });
                            console.log("Tipo alterado, formModified =", true);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="upload">Upload de Vídeo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`video_tutorials.${index}.url`}
                    render={({ field }) => {
                      const fieldValue = field.value || '';
                      const fieldType = form.watch(`video_tutorials.${index}.type`);
                      
                      return (
                        <FormItem>
                          <FormLabel>URL ou Upload do Vídeo</FormLabel>
                          <FormControl>
                            {fieldType === 'upload' ? (
                              <FileUpload
                                bucketName="tool_files"
                                onUploadComplete={(url) => {
                                  field.onChange(url);
                                  // Marcar que houve mudança após upload
                                  form.setValue("formModified", true, { shouldDirty: true });
                                  console.log("URL alterada (upload), formModified =", true);
                                }}
                                accept="video/*"
                                maxSize={100}
                                buttonText="Upload do Vídeo"
                                fieldLabel="Selecione um vídeo"
                              />
                            ) : (
                              <Input 
                                placeholder="https://www.youtube.com/watch?v=..." 
                                value={fieldValue}
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Marcar que houve mudança
                                  form.setValue("formModified", true, { shouldDirty: true });
                                  console.log("URL alterada, formModified =", true);
                                }}
                              />
                            )}
                          </FormControl>
                          <FormDescription>
                            {fieldType === 'upload' 
                              ? 'Faça upload do vídeo (max: 100MB)' 
                              : 'Links do YouTube, Vimeo ou outras plataformas'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    remove(index);
                    // Marcar que houve mudança após remoção
                    form.setValue("formModified", true, { shouldDirty: true });
                    console.log("Vídeo removido, formModified =", true);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
