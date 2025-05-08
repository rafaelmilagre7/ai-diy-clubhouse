
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "./resourceUtils";

export function parseResourceMetadata(item: any): Resource {
  // Criar objeto de metadata padrão a partir das propriedades do resource
  const defaultMetadata: ResourceMetadata = {
    title: item.name,
    description: `Arquivo ${item.format || getFileFormatName(item.name)}`,
    url: item.url,
    type: detectFileType(item.name),
    format: item.format || getFileFormatName(item.name),
    tags: [],
    order: 0,
    downloads: 0,
    size: item.size,
    version: "1.0"
  };
  
  // Tentar analisar metadata se existir, caso contrário usar o padrão
  let metadata = defaultMetadata;
  
  if (item.metadata) {
    try {
      if (typeof item.metadata === 'string') {
        const parsedMetadata = JSON.parse(item.metadata);
        // Garantir que todos os campos obrigatórios existam
        metadata = {
          title: parsedMetadata.title || defaultMetadata.title,
          description: parsedMetadata.description || defaultMetadata.description,
          url: parsedMetadata.url || defaultMetadata.url,
          type: parsedMetadata.type || defaultMetadata.type,
          format: parsedMetadata.format || defaultMetadata.format,
          tags: parsedMetadata.tags || [],
          order: parsedMetadata.order || 0,
          downloads: parsedMetadata.downloads || 0,
          size: parsedMetadata.size || defaultMetadata.size,
          version: parsedMetadata.version || "1.0"
        };
      } else if (typeof item.metadata === 'object') {
        // Se já for um objeto, garantir que todos os campos obrigatórios existam
        metadata = {
          title: item.metadata.title || defaultMetadata.title,
          description: item.metadata.description || defaultMetadata.description,
          url: item.metadata.url || defaultMetadata.url,
          type: item.metadata.type || defaultMetadata.type,
          format: item.metadata.format || defaultMetadata.format,
          tags: item.metadata.tags || [],
          order: item.metadata.order || 0,
          downloads: item.metadata.downloads || 0,
          size: item.metadata.size || defaultMetadata.size,
          version: item.metadata.version || "1.0"
        };
      }
    } catch (e) {
      console.error("Erro ao analisar metadata:", e);
      // Fallback para metadata padrão em caso de erro
      metadata = defaultMetadata;
    }
  }
  
  return {
    id: item.id,
    name: item.name,
    url: item.url,
    type: metadata.type || detectFileType(item.name),
    format: item.format,
    solution_id: item.solution_id,
    metadata: metadata,
    created_at: item.created_at,
    updated_at: item.updated_at,
    module_id: item.module_id,
    size: item.size
  } as Resource;
}
