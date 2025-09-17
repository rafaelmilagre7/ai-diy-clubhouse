import React, { useState, useEffect } from "react";
import { CertificateTemplate } from "@/types/learningTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CertificateTemplateFormProps {
  template: CertificateTemplate | null;
  onSave: (template: Partial<CertificateTemplate>) => void;
  isSaving: boolean;
}

const getDefaultTemplate = () => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .certificate {
            background: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
        }
        .header { 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .title { 
            font-size: 36px; 
            font-weight: bold; 
            color: #333; 
            margin: 20px 0;
        }
        .subtitle { 
            font-size: 18px; 
            color: #666; 
            margin-bottom: 30px; 
        }
        .content { 
            font-size: 16px; 
            line-height: 1.6; 
            color: #444; 
            margin: 20px 0; 
        }
        .highlight { 
            font-size: 24px; 
            font-weight: bold; 
            color: #667eea; 
            margin: 20px 0; 
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #eee; 
            font-size: 14px; 
            color: #888; 
        }
        .workload {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            color: #495057;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <h1 class="title">CERTIFICADO</h1>
            <p class="subtitle">Certificamos que</p>
        </div>
        
        <div class="content">
            <p class="highlight">{{userName}}</p>
            <p>concluiu com sucesso o curso</p>
            <p class="highlight">{{solutionTitle}}</p>
            <p>{{solutionCategory}}</p>
            
            <div class="workload">
                Carga Horária: {{workloadHours}}
            </div>
            
            <p>Data de conclusão: {{implementationDate}}</p>
        </div>
        
        <div class="footer">
            <p>Certificado ID: {{certificateId}}</p>
            <p>Código de Validação: {{validationCode}}</p>
        </div>
    </div>
</body>
</html>`;

export const CertificateTemplateForm = ({
  template,
  onSave,
  isSaving
}: CertificateTemplateFormProps) => {
  const [formData, setFormData] = useState<Partial<CertificateTemplate>>(
    template || {
      name: "",
      description: "",
      html_template: getDefaultTemplate(),
      is_default: false,
      course_id: null,
      metadata: {
        workload_hours: "",
        course_description: ""
      }
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const { courses = [] } = useLearningCourses();

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        metadata: {
          workload_hours: template.metadata?.workload_hours || "",
          course_description: template.metadata?.course_description || "",
          ...template.metadata
        }
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name?.trim()) {
      alert("Nome do template é obrigatório");
      return;
    }

    if (!formData.html_template?.trim()) {
      alert("Template HTML é obrigatório");
      return;
    }

    if (!formData.metadata?.workload_hours?.trim()) {
      alert("Carga horária é obrigatória");
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (field: keyof CertificateTemplate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const getPreviewData = () => {
    return {
      userName: "João Silva",
      solutionTitle: formData.metadata?.course_description || "Curso de Exemplo",
      solutionCategory: "Capacitação Profissional",
      workloadHours: formData.metadata?.workload_hours || "40h",
      implementationDate: new Date().toLocaleDateString('pt-BR'),
      certificateId: "CERT-2024-001",
      validationCode: "ABC123XYZ"
    };
  };

  const renderPreview = () => {
    if (!formData.html_template) return null;

    let previewHtml = formData.html_template;
    const previewData = getPreviewData();

    // Substituir placeholders
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
    });

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Preview do Certificado</span>
            <Badge variant="outline">Dados de exemplo</Badge>
          </div>
        </div>
        <div 
          className="p-4 bg-white"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
          style={{ transform: 'scale(0.7)', transformOrigin: 'top left', height: '600px', overflow: 'auto' }}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="template">Template HTML</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Template Padrão Cursos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Curso Específico</Label>
                  <Select
                    value={formData.course_id || "global"}
                    onValueChange={(value) => handleInputChange("course_id", value === "global" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um curso ou deixe vazio para global" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Template Global</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descrição do template..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workload_hours">Carga Horária *</Label>
                  <Input
                    id="workload_hours"
                    value={formData.metadata?.workload_hours || ""}
                    onChange={(e) => handleMetadataChange("workload_hours", e.target.value)}
                    placeholder="Ex: 40h, 20h30min, 85h"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato sugerido: 40h, 20h30min, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_description">Descrição para Certificado</Label>
                  <Input
                    id="course_description"
                    value={formData.metadata?.course_description || ""}
                    onChange={(e) => handleMetadataChange("course_description", e.target.value)}
                    placeholder="Ex: Capacitação em Marketing Digital"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active !== false}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Template Ativo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default === true}
                    onCheckedChange={(checked) => handleInputChange("is_default", checked)}
                  />
                  <Label htmlFor="is_default">Template Padrão</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template HTML</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use as variáveis: {"{{userName}}, {{solutionTitle}}, {{solutionCategory}}, {{workloadHours}}, {{implementationDate}}, {{certificateId}}, {{validationCode}}"}
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.html_template || ""}
                onChange={(e) => handleInputChange("html_template", e.target.value)}
                placeholder="Cole seu template HTML aqui..."
                className="font-mono text-sm"
                rows={20}
                required
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          {renderPreview()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Template"
          )}
        </Button>
      </div>
    </form>
  );
};