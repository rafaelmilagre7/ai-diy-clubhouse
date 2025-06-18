
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Trash2, Upload } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { AulaFormValues } from '../schemas/aulaFormSchema';
import { FileUpload } from '@/components/formacao/comum/FileUpload';
import { toast } from 'sonner';

interface Material {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);

  // Sincronizar com o formulário
  useEffect(() => {
    const formResources = form.getValues('resources');
    if (formResources && formResources.length > 0) {
      setMaterials(formResources);
    }
  }, [form]);

  // Atualizar formulário quando materials mudar
  useEffect(() => {
    form.setValue('resources', materials);
  }, [materials, form]);

  const addMaterial = () => {
    const newMaterial: Material = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      url: '',
      type: 'document',
      fileName: '',
      fileSize: 0
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
    toast.success('Material removido com sucesso');
  };

  const updateMaterial = (index: number, field: keyof Material, value: any) => {
    setMaterials(prev => prev.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    ));
  };

  const handleFileUpload = (index: number) => (url: string, fileName?: string, fileSize?: number) => {
    console.log('📁 Arquivo carregado para material:', { index, url, fileName, fileSize });
    
    // Atualizar o material com os dados do arquivo
    setMaterials(prev => prev.map((material, i) => 
      i === index ? { 
        ...material, 
        url,
        fileName: fileName || material.fileName || 'Arquivo carregado',
        title: material.title || fileName || 'Material de Apoio',
        fileSize: fileSize || material.fileSize,
        type: 'document'
      } : material
    ));
    
    toast.success('Arquivo carregado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Materiais de Apoio</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione materiais complementares como PDFs, documentos, planilhas, etc.
        </p>
      </div>

      <div className="space-y-4">
        {materials.map((material, index) => (
          <Card key={material.id || index} className="p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Material {index + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`material-title-${index}`}>Título</Label>
                <input
                  id={`material-title-${index}`}
                  type="text"
                  value={material.title || ''}
                  onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                  placeholder="Nome do material"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <Label htmlFor={`material-description-${index}`}>Descrição (opcional)</Label>
                <textarea
                  id={`material-description-${index}`}
                  value={material.description || ''}
                  onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                  placeholder="Descrição do material"
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <Label>Upload do Arquivo</Label>
                <FileUpload
                  value={material.url || ''}
                  onChange={handleFileUpload(index)}
                  bucketName="lesson_materials"
                  folder="documents"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,image/*"
                  maxSize={25}
                  label="Selecionar arquivo"
                  description="Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, imagens"
                />
              </div>

              {material.url && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <Upload className="h-4 w-4" />
                    <span>Arquivo carregado: {material.fileName || 'Material disponível'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {materials.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <div className="flex flex-col items-center gap-3">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Nenhum material adicionado</h4>
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para adicionar materiais de apoio
                </p>
              </div>
            </div>
          </Card>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addMaterial}
          className="w-full"
          disabled={isSaving}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Material
        </Button>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={isSaving}
        >
          Voltar
        </Button>
        <Button 
          type="button" 
          onClick={onNext}
          disabled={isSaving}
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default EtapaMateriais;
