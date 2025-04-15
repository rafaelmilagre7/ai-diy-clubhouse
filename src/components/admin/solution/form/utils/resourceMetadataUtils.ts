
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "./resourceUtils";

export function parseResourceMetadata(item: any): Resource {
  // Create default metadata object from the resource properties
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
  
  // Try to parse metadata if it exists, otherwise use default
  let metadata = defaultMetadata;
  
  if (item.metadata) {
    try {
      if (typeof item.metadata === 'string') {
        metadata = JSON.parse(item.metadata);
      } else {
        metadata = item.metadata as ResourceMetadata;
      }
    } catch (e) {
      console.error("Error parsing metadata:", e);
      // Fallback to default metadata on parse error
      metadata = defaultMetadata;
    }
  }
  
  return {
    id: item.id,
    name: item.name,
    url: item.url,
    type: metadata.type,
    format: item.format,
    solution_id: item.solution_id,
    metadata: metadata,
    created_at: item.created_at,
    updated_at: item.updated_at,
    module_id: item.module_id,
    size: item.size
  } as Resource;
}
