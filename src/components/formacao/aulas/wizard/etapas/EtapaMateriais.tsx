
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/formacao/comum/FileUpload";
import { Plus, Trash2, FileText, CheckCircle, Clock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { STORAGE_BUCKETS, ACCEPTED_FILE_TYPES } from "@/lib/supabase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

interface Material {
  id: string;
  title: string;
  description: string;
  url: string;
  fileName?: string;
  fileSize?: number;
  type: string;
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving,
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recentUploads, setRecentUploads] = useState<Set<string>>(new Set());

  // Carregar materiais existentes do formulário
  useEffect(() => {
    const existingMaterials = form.getValues('materials') || [];
    if (existingMaterials.length > 0) {
      console.log('📚 Carregando materiais existentes:', existingMaterials);
      setMaterials(existingMaterials);
    }
  }, [form]);

  // Sincronizar materiais com o formulário
  useEffect(() => {
    console.log('🔄 Sincronizando materiais com formulário:', materials);
    form.setValue('materials', materials);
  }, [materials, form]);

  const addMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      title: '',
      description: '',
      url: '',
      type: 'document'
    };

    console.log('➕ Adicionando novo material:', newMaterial.id);
    setMaterials(prev => [...prev, newMaterial]);
  };

  const removeMaterial = (id: string) => {
    console.log('🗑️ Removendo material:', id);
    setMaterials(prev => prev.filter(material => material.id !== id));
    setRecentUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const updateMaterial = (id: string, field: keyof Material, value: any) => {
    console.log('✏️ Atualizando material:', id, field, value);
    
    setMaterials(prev => prev.map(material => {
      if (material.id === id) {
        const updated = { ...material, [field]: value };
        console.log('📝 Material atualizado:', updated);
        return updated;
      }
      return material;
    }));
  };

  const handleFileUpload = (id: string) => (url: string, fileName?: string, fileSize?: number) => {
    console.log('📁 Upload de arquivo concluído para material:', id, { url, fileName, fileSize });
    
    // Marcar como upload recente
    setRecentUploads(prev => new Set(prev).add(id));
    
    // Atualizar material
    setMaterials(prev => prev.map(material => {
      if (material.id === id) {
        const updated = {
          ...material,
          url,
          fileName,
          fileSize,
          // Se título estiver vazio, usar nome do arquivo
          title: material.title || fileName || 'Material de apoio'
        };
        console.log('✅ Material com upload:', updated);
        return updated;
      }
      return material;
    }));

    // Remover indicador de upload recente após alguns segundos
    setTimeout(() => {
      setRecentUploads(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 3000);
  };

  const canProceed = () => {
    // Pode prosseguir se não há materiais ou se todos os materiais têm título e URL
    const incompleteMaterials = materials.filter(m => !m.title || !m.url);
    return incompleteMaterials.length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Materiais de Apoio</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione PDFs, documentos e outros materiais para complementar o aprendizado dos alunos.
        </p>
      </div>

      {/* Validação antes de prosseguir */}
      {materials.length > 0 && !canProceed() && (
        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Complete o título e faça upload dos arquivos para todos os materiais antes de prosseguir.
          </AlertDescription>
        </Alert>
      )}

      {materials.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum material adicionado ainda.
            </p>
            <Button onClick={addMaterial} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {materials.map((material, index) => (
            <Card key={material.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Material {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMaterial(material.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Indicador de upload recente */}
                {recentUploads.has(material.id) && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Upload realizado com sucesso!</strong>
                      {material.fileName && (
                        <span className="block mt-1">Arquivo: {material.fileName}</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`material-title-${material.id}`}>
                      Título *
                    </Label>
                    <Input
                      id={`material-title-${material.id}`}
                      value={material.title}
                      onChange={(e) => updateMaterial(material.id, 'title', e.target.value)}
                      placeholder="Nome do material"
                      className={!material.title ? 'border-amber-300' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`material-description-${material.id}`}>
                      Descrição
                    </Label>
                    <Textarea
                      id={`material-description-${material.id}`}
                      value={material.description}
                      onChange={(e) => updateMaterial(material.id, 'description', e.target.value)}
                      placeholder="Descrição opcional do material"
                      rows={2}
                    />
                  </div>
                </div>

                <div>
                  <FileUpload
                    value={material.url}
                    onChange={handleFileUpload(material.id)}
                    bucketName={STORAGE_BUCKETS.LEARNING_MATERIALS}
                    folder="lesson-materials"
                    accept={ACCEPTED_FILE_TYPES.DOCUMENTS}
                    maxSize={25}
                    label="Arquivo do Material"
                    description="PDF, DOC, DOCX ou outros documentos (máx. 25MB)"
                  />
                </div>

                {/* Status do material */}
                {material.url && material.title && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Material "{material.title}" está pronto!
                      </p>
                      {material.fileSize && material.fileSize > 0 && (
                        <p className="text-xs text-green-600">
                          Tamanho: {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            onClick={addMaterial}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Outro Material
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious} disabled={isSaving}>
          Voltar
        </Button>
        <Button 
          type="button" 
          onClick={onNext} 
          disabled={isSaving || !canProceed()}
        >
          {isSaving ? "Salvando..." : "Finalizar"}
        </Button>
      </div>
    </div>
  );
};

export default EtapaMateriais;
