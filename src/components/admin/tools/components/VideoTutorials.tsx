
import { useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const VideoTutorials = ({ form }: any) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "video_tutorials",
  });

  const handleAddVideo = () => {
    append({ title: "", url: "" });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`video_tutorials.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Vídeo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Como configurar a ferramenta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`video_tutorials.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Vídeo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Links do YouTube, Vimeo ou outras plataformas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
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
