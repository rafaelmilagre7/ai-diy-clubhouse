import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  Upload,
  Palette,
  Code,
  Settings,
  Sparkles
} from "lucide-react";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";
import { toast } from "sonner";

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  htmlTemplate: string;
  cssStyles: string;
  metadata: {
    category: string;
    difficulty: string;
    preview_url?: string;
  };
  created_at: string;
}

const defaultTemplates: CertificateTemplate[] = [
  {
    id: '1',
    name: 'Template Profissional',
    description: 'Design elegante e profissional com gradientes modernos',
    isActive: true,
    isDefault: true,
    htmlTemplate: '',
    cssStyles: '',
    metadata: {
      category: 'Profissional',
      difficulty: 'Fácil'
    },
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Template Minimalista',
    description: 'Design limpo e minimalista focado na tipografia',
    isActive: true,
    isDefault: false,
    htmlTemplate: '',
    cssStyles: '',
    metadata: {
      category: 'Minimalista',
      difficulty: 'Fácil'
    },
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Template Criativo',
    description: 'Design criativo com elementos artísticos e cores vibrantes',
    isActive: false,
    isDefault: false,
    htmlTemplate: '',
    cssStyles: '',
    metadata: {
      category: 'Criativo',
      difficulty: 'Avançado'
    },
    created_at: new Date().toISOString()
  }
];

export default function CertificateTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useDynamicSEO({
    title: 'Gestão de Templates de Certificados',
    description: 'Gerencie templates de certificados, customize designs e configure opções de geração.',
    keywords: 'templates, certificados, design, personalização'
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.metadata.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveTemplate = (templateData: Partial<CertificateTemplate>) => {
    if (selectedTemplate) {
      // Editar template existente
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, ...templateData }
          : t
      ));
      toast.success("Template atualizado com sucesso!");
    } else {
      // Criar novo template
      const newTemplate: CertificateTemplate = {
        id: Date.now().toString(),
        name: templateData.name || "Novo Template",
        description: templateData.description || "",
        isActive: true,
        isDefault: false,
        htmlTemplate: templateData.htmlTemplate || "",
        cssStyles: templateData.cssStyles || "",
        metadata: templateData.metadata || {
          category: "Personalizado",
          difficulty: "Médio"
        },
        created_at: new Date().toISOString()
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast.success("Template criado com sucesso!");
    }
    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast.error("Não é possível excluir o template padrão!");
      return;
    }
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast.success("Template excluído com sucesso!");
  };

  const handleToggleStatus = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, isActive: !t.isActive }
        : t
    ));
  };

  const handleSetDefault = (templateId: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === templateId
    })));
    toast.success("Template padrão alterado!");
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsEditDialogOpen(true);
  };

  const handleEditTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handlePreviewTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Palette className="h-8 w-8 text-primary" />
            Templates de Certificados
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e customize os templates utilizados na geração de certificados
          </p>
        </div>
        <Button onClick={handleNewTemplate} className="hover-scale">
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-muted-foreground">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Sparkles className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{templates.filter(t => t.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Padrão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Code className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{templates.filter(t => t.metadata.category === 'Personalizado').length}</p>
                <p className="text-sm text-muted-foreground">Personalizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="minimal">Minimalista</SelectItem>
                <SelectItem value="creative">Criativo</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover-scale overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  {template.isDefault && (
                    <Badge variant="outline" className="text-primary border-primary">
                      Padrão
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!template.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Categoria:</span>
                <Badge variant="outline">{template.metadata.category}</Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dificuldade:</span>
                <Badge 
                  variant="outline"
                  className={
                    template.metadata.difficulty === 'Fácil' ? 'text-green-600' :
                    template.metadata.difficulty === 'Médio' ? 'text-yellow-600' :
                    'text-red-600'
                  }
                >
                  {template.metadata.difficulty}
                </Badge>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(template.id)}
                  className="flex-1"
                >
                  {template.isActive ? "Desativar" : "Ativar"}
                </Button>
                {!template.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(template.id)}
                    className="flex-1"
                  >
                    Tornar Padrão
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para Edição/Criação */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {selectedTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>
          
          <TemplateEditor 
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Template
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-center text-muted-foreground">
                Preview do template: {selectedTemplate.name}
              </p>
              {/* Aqui seria renderizado o preview real do certificado */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para editar templates
interface TemplateEditorProps {
  template: CertificateTemplate | null;
  onSave: (template: Partial<CertificateTemplate>) => void;
  onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    category: template?.metadata.category || "Personalizado",
    difficulty: template?.metadata.difficulty || "Médio",
    htmlTemplate: template?.htmlTemplate || "",
    cssStyles: template?.cssStyles || "",
    isActive: template?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      htmlTemplate: formData.htmlTemplate,
      cssStyles: formData.cssStyles,
      isActive: formData.isActive,
      metadata: {
        category: formData.category,
        difficulty: formData.difficulty
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Template Profissional"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Profissional">Profissional</SelectItem>
                  <SelectItem value="Minimalista">Minimalista</SelectItem>
                  <SelectItem value="Criativo">Criativo</SelectItem>
                  <SelectItem value="Personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o estilo e características do template..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="active">Template Ativo</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="html">Template HTML</Label>
            <Textarea
              id="html"
              value={formData.htmlTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, htmlTemplate: e.target.value }))}
              placeholder="Cole seu template HTML aqui..."
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="css" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="css">Estilos CSS</Label>
            <Textarea
              id="css"
              value={formData.cssStyles}
              onChange={(e) => setFormData(prev => ({ ...prev, cssStyles: e.target.value }))}
              placeholder="Cole seus estilos CSS aqui..."
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {template ? "Salvar Alterações" : "Criar Template"}
        </Button>
      </div>
    </form>
  );
};