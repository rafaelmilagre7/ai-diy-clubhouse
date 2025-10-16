import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Award } from "lucide-react";
import { useCertificateTemplate } from "@/hooks/learning/useCertificateTemplate";
import { useCertificateTemplates } from "@/hooks/learning/useCertificateTemplates";

interface CertificateTemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateChange: (templateId: string) => void;
  courseId?: string;
  type?: 'course' | 'solution';
  className?: string;
}

export const CertificateTemplateSelector = ({
  selectedTemplateId,
  onTemplateChange,
  courseId,
  type = 'solution',
  className = ""
}: CertificateTemplateSelectorProps) => {
  // Para soluções, usar template padrão unificado
  const { data: defaultTemplate } = useCertificateTemplate();
  
  // Para cursos, usar templates específicos
  const { templates: courseTemplates, isLoading: isLoadingCourseTemplates } = useCertificateTemplates(courseId);
  
  const templates = type === 'course' ? courseTemplates : (defaultTemplate ? [defaultTemplate] : []);
  const isLoading = type === 'course' ? isLoadingCourseTemplates : false;

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <FileText className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Carregando templates...</span>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-muted/50 rounded-lg ${className}`}>
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {type === 'course' ? 'Nenhum template de curso disponível' : 'Template padrão será usado'}
        </span>
      </div>
    );
  }

  // Se há apenas um template, mostrar como info
  if (templates.length === 1) {
    const template = templates[0];
    return (
      <div className={`flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg ${className}`}>
        <Award className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">{template.name}</span>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {type === 'course' ? 'Curso' : 'Solução'}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">Template do Certificado</label>
      <Select
        value={selectedTemplateId}
        onValueChange={onTemplateChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map(template => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <div className="flex-1">
                  <span className="font-medium">{template.name}</span>
                  {template.description && (
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  )}
                </div>
                {template.is_default && (
                  <Badge variant="secondary" className="text-xs">Padrão</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};