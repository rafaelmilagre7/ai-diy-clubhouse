import React, { useState } from "react";
import { createSafeHTML } from '@/utils/htmlSanitizer';
import { CertificateTemplate } from "@/types/learningTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CertificateTemplateFormProps {
  template: CertificateTemplate | null;
  onSave: (template: Partial<CertificateTemplate>) => void;
  isSaving: boolean;
}

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
      metadata: {}
    }
  );
  
  const { courses, isLoading: isLoadingCourses } = useLearningCourses();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_default: checked }));
  };
  
  const handleCourseChange = (value: string) => {
    setFormData(prev => ({ ...prev, course_id: value === "null" ? null : value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course_id">Curso (opcional)</Label>
            <Select
              value={formData.course_id?.toString() || "null"}
              onValueChange={handleCourseChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Template global (todos os cursos)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Template global (todos os cursos)</SelectItem>
                {courses?.map((course) => (
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
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Descreva brevemente para que serve este template"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_default"
            checked={formData.is_default || false}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="is_default">
            Definir como template padrão {formData.course_id ? "para este curso" : "global"}
          </Label>
        </div>
      </div>
      
      <Tabs defaultValue="html" className="w-full">
        <TabsList>
          <TabsTrigger value="html">Código HTML</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>
        <TabsContent value="html">
          <div className="space-y-2">
            <Label htmlFor="html_template">Template HTML</Label>
            <Textarea
              id="html_template"
              name="html_template"
              value={formData.html_template || ""}
              onChange={handleChange}
              className="font-mono h-80"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis como {`{{nome}}`}, {`{{curso}}`}, {`{{data}}`} que serão substituídas ao gerar o certificado.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <div className="border rounded-lg p-4 h-80 overflow-auto">
            <div
              className="certificate-preview"
              dangerouslySetInnerHTML={createSafeHTML((formData.html_template || "")
                .replace(/\{\{nome\}\}/g, "Nome do Aluno")
                .replace(/\{\{curso\}\}/g, "Nome do Curso")
                .replace(/\{\{data\}\}/g, new Date().toLocaleDateString("pt-BR"))
                .replace(/\{\{codigo\}\}/g, "ABC-123-XYZ")
              )}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSaving}>
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

// Função para gerar um template padrão
function getDefaultTemplate(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      text-align: center;
      padding: 40px;
      color: #333;
    }
    .certificate {
      max-width: 800px;
      margin: 0 auto;
      border: 10px solid #8a2be2;
      padding: 20px;
      position: relative;
    }
    .certificate:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid #e1e1e1;
      margin: 10px;
      pointer-events: none;
    }
    h1 {
      font-size: 36px;
      color: #8a2be2;
      margin-bottom: 20px;
    }
    .student-name {
      font-size: 28px;
      font-weight: bold;
      margin: 20px 0;
    }
    .course-name {
      font-size: 22px;
      margin: 10px 0 30px;
    }
    .date {
      margin-top: 30px;
      font-style: italic;
    }
    .validation {
      margin-top: 40px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <h1>CERTIFICADO DE CONCLUSÃO</h1>
    <p>Este certifica que</p>
    <p class="student-name">{{nome}}</p>
    <p>concluiu com sucesso o curso</p>
    <p class="course-name">{{curso}}</p>
    <p class="date">Emitido em: {{data}}</p>
    <div class="validation">
      <p>Código de validação: {{codigo}}</p>
      <p>Verifique a autenticidade em: viverdeia.ai/certificado/validar</p>
    </div>
  </div>
</body>
</html>
`.trim();
}
