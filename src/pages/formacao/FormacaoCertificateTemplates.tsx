
import React, { useState } from "react";
import { useCertificateTemplates } from "@/hooks/learning/useCertificateTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Edit, Plus, Trash } from "lucide-react";
import { CertificateTemplate } from "@/types/learningTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CertificateTemplateForm } from "@/components/formacao/certificados/CertificateTemplateForm";

const FormacaoCertificateTemplates = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  
  const {
    templates,
    isLoading,
    error,
    saveTemplate,
    deleteTemplate,
    isSaving,
    isDeleting
  } = useCertificateTemplates();
  
  const handleEdit = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setOpenDialog(true);
  };
  
  const handleCreate = () => {
    setSelectedTemplate(null);
    setOpenDialog(true);
  };
  
  const handleSave = (template: Partial<CertificateTemplate>) => {
    saveTemplate(template, {
      onSuccess: () => {
        setOpenDialog(false);
      }
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Templates de Certificados</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os templates utilizados para gerar certificados dos cursos.
          </p>
        </div>
        
        <Button onClick={handleCreate} className="flex gap-2">
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-7 w-4/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao carregar os templates de certificados. Por favor, tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      ) : templates.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum template encontrado</AlertTitle>
          <AlertDescription>
            Você ainda não criou nenhum template de certificado. Clique no botão "Novo Template" para começar.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{template.name}</span>
                  {template.is_default && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Padrão</span>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {template.description || "Sem descrição"}
                </div>
                
                <div className="border rounded-md p-3 h-32 overflow-hidden bg-muted/20">
                  <div className="text-xs opacity-70 overflow-hidden text-ellipsis">
                    {template.html_template.substring(0, 200)}...
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>
          
          <CertificateTemplateForm
            template={selectedTemplate}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormacaoCertificateTemplates;
