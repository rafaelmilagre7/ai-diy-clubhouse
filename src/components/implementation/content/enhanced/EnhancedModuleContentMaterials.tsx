
import React, { useState } from "react";
import { Module } from "@/lib/supabase";
import { useMaterialsData } from "@/hooks/implementation/useMaterialsData";
import { useFileDownload } from "@/hooks/implementation/useFileDownload";
import { Download, FileText, Image, File, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EnhancedModuleContentMaterialsProps {
  module: Module;
}

export const EnhancedModuleContentMaterials = ({ module }: EnhancedModuleContentMaterialsProps) => {
  const { materials, loading } = useMaterialsData(module);
  const { handleDownload } = useFileDownload();
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set());
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const handleMaterialDownload = async (material: any) => {
    if (downloadingFiles.has(material.id)) return;
    
    setDownloadingFiles(prev => new Set([...prev, material.id]));
    
    try {
      await handleDownload(material.file_url, material.title);
      setDownloadedFiles(prev => new Set([...prev, material.id]));
    } catch (error) {
      console.error("Erro ao fazer download:", error);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(material.id);
        return newSet;
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) return Image;
    if (fileType?.includes('pdf') || fileType?.includes('document')) return FileText;
    return File;
  };

  const getFileSize = (size?: number) => {
    if (!size) return 'Tamanho desconhecido';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando materiais...</p>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">📚</div>
        <h3 className="text-2xl font-semibold text-white mb-3">Nenhum material disponível</h3>
        <p className="text-neutral-400 max-w-md mx-auto">
          Esta solução não possui materiais de apoio para download no momento.
        </p>
      </div>
    );
  }

  const downloadProgress = (downloadedFiles.size / materials.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-viverblue/20 rounded-full mb-4">
          <Download className="h-8 w-8 text-viverblue" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent mb-4">
          Materiais de Apoio
        </h2>
        <p className="text-neutral-300 max-w-2xl mx-auto mb-6">
          Baixe todos os materiais necessários para implementar esta solução com sucesso.
          Templates, guias e recursos essenciais para sua jornada.
        </p>
        
        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-400">Progresso de Download</span>
            <span className="text-sm text-viverblue font-medium">
              {downloadedFiles.size} de {materials.length}
            </span>
          </div>
          <Progress value={downloadProgress} className="h-2" />
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => {
          const FileIcon = getFileIcon(material.file_type);
          const isDownloaded = downloadedFiles.has(material.id);
          const isDownloading = downloadingFiles.has(material.id);

          return (
            <div key={material.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-viverblue/20 to-viverblue-dark/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                
                {/* File Preview/Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-viverblue/20 rounded-xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <FileIcon className="h-8 w-8 text-viverblue" />
                </div>

                {/* File Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-viverblue-light transition-colors">
                    {material.title}
                  </h3>
                  {material.description && (
                    <p className="text-neutral-400 text-sm mb-3 leading-relaxed">
                      {material.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-center space-x-4 text-xs text-neutral-500">
                    <span>{getFileSize(material.file_size)}</span>
                    {material.file_type && (
                      <Badge variant="outline" className="border-neutral-600 text-neutral-400 text-xs">
                        {material.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Download Status */}
                {isDownloaded && (
                  <div className="flex items-center justify-center space-x-2 mb-4 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Baixado com sucesso</span>
                  </div>
                )}

                {/* Download Button */}
                <Button
                  onClick={() => handleMaterialDownload(material)}
                  disabled={isDownloading}
                  className={`w-full transition-all duration-200 ${
                    isDownloaded 
                      ? 'bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30' 
                      : 'bg-viverblue/20 border-viverblue/30 text-viverblue hover:bg-viverblue/30'
                  }`}
                  variant="outline"
                >
                  {isDownloading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Baixando...
                    </>
                  ) : isDownloaded ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Baixar novamente
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar arquivo
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download All Button */}
      {materials.length > 1 && (
        <div className="text-center pt-8 border-t border-white/10">
          <Button
            onClick={() => {
              materials.forEach(material => {
                if (!downloadedFiles.has(material.id)) {
                  handleMaterialDownload(material);
                }
              });
            }}
            size="lg"
            className="bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-dark hover:to-viverblue text-white px-8 py-3"
            disabled={downloadedFiles.size === materials.length}
          >
            <Download className="h-5 w-5 mr-2" />
            {downloadedFiles.size === materials.length ? 'Todos os arquivos baixados' : 'Baixar todos os materiais'}
          </Button>
        </div>
      )}
    </div>
  );
};
