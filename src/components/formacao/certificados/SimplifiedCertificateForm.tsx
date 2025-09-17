import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CertificateConfig {
  id?: string;
  course_id: string;
  workload_hours: string;
  course_description: string;
  is_active: boolean;
}

interface SimplifiedCertificateFormProps {
  courseId: string;
  courseTitle: string;
  config: CertificateConfig | null;
  onSave: (config: CertificateConfig) => void;
  isSaving: boolean;
  onCancel: () => void;
}

// Template HTML fixo e padrão
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
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

export const SimplifiedCertificateForm = ({
  courseId,
  courseTitle,
  config,
  onSave,
  isSaving,
  onCancel
}: SimplifiedCertificateFormProps) => {
  const [formData, setFormData] = useState<CertificateConfig>({
    course_id: courseId,
    workload_hours: "",
    course_description: "",
    is_active: true,
    ...config
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workload_hours.trim()) {
      alert("Carga horária é obrigatória");
      return;
    }

    // Cria o objeto completo do template para salvar no banco
    const templateData = {
      id: config?.id,
      name: `Certificado - ${courseTitle}`,
      description: `Configuração de certificado para o curso ${courseTitle}`,
      html_template: DEFAULT_TEMPLATE,
      css_styles: null,
      is_active: formData.is_active,
      is_default: false,
      course_id: courseId,
      metadata: {
        workload_hours: formData.workload_hours,
        course_description: formData.course_description || courseTitle
      }
    };

    onSave(templateData as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Certificado - {courseTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure os dados específicos que aparecerão no certificado deste curso.
          O template visual permanece sempre o mesmo.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workload_hours">Carga Horária *</Label>
              <Input
                id="workload_hours"
                value={formData.workload_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, workload_hours: e.target.value }))}
                placeholder="Ex: 40h, 20h30min, 85 horas"
                required
              />
              <p className="text-xs text-muted-foreground">
                Como aparecerá no certificado. Ex: "40h", "20h30min", "85 horas"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_description">Descrição do Curso</Label>
              <Input
                id="course_description"
                value={formData.course_description}
                onChange={(e) => setFormData(prev => ({ ...prev, course_description: e.target.value }))}
                placeholder={`${courseTitle} (padrão)`}
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para usar o título do curso automaticamente
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Certificado ativo para este curso</Label>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Preview dos dados:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Nome no certificado:</strong> {formData.course_description || courseTitle}</p>
              <p><strong>Carga horária:</strong> {formData.workload_hours || "Não definida"}</p>
              <p><strong>Status:</strong> {formData.is_active ? "Ativo" : "Inativo"}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configuração"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};