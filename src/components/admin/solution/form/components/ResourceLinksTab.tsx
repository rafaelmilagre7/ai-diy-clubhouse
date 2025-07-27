
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, LinkIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "../hooks/useResourcesFormData";

interface ResourceLinksTabProps {
  form: UseFormReturn<ResourceFormValues>;
}

interface LinkItem {
  title: string;
  description: string;
  url: string;
}

const ResourceLinksTab: React.FC<ResourceLinksTabProps> = ({ form }) => {
  const [links, setLinks] = useState<LinkItem[]>(() => {
    try {
      const currentLinks = form.getValues().external_links;
      return currentLinks ? JSON.parse(currentLinks) : [];
    } catch {
      return [];
    }
  });

  const updateFormValue = (newLinks: LinkItem[]) => {
    form.setValue('external_links', JSON.stringify(newLinks, null, 2));
  };

  const addLink = () => {
    const newLinks = [...links, { title: "", description: "", url: "" }];
    setLinks(newLinks);
    updateFormValue(newLinks);
  };

  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setLinks(newLinks);
    updateFormValue(newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    updateFormValue(newLinks);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Links Auxiliares</h3>
          <p className="text-sm text-muted-foreground">
            Adicione links para recursos externos úteis para esta solução.
          </p>
        </div>
        <Button 
          onClick={addLink}
          type="button"
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Adicionar Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum link auxiliar adicionado ainda.
              <br />
              Clique em "Adicionar Link" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Link {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                    type="button"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Link</Label>
                  <Input
                    placeholder="https://exemplo.com"
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição do Link</Label>
                  <Textarea
                    placeholder="Descrição do que o usuário encontrará neste link..."
                    value={link.description}
                    onChange={(e) => updateLink(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Título (opcional)</Label>
                  <Input
                    placeholder="Nome do recurso (será preenchido automaticamente se vazio)"
                    value={link.title}
                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se não preenchido, será usado o domínio do link como título.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hidden field for form registration */}
      <input type="hidden" {...form.register('external_links')} />
    </div>
  );
};

export default ResourceLinksTab;
