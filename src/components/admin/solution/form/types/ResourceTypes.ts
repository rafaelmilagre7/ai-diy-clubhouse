
export interface ResourceMetadata {
  title: string;
  description: string;
  url: string;
  type: "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other";
  format?: string;
  tags?: string[];
  order?: number;
  downloads?: number;
  size?: number;
  version?: string;
}

export interface Resource {
  id?: string;
  name: string;
  url: string;
  type: "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other";
  format?: string;
  solution_id: string;
  metadata: ResourceMetadata;  // Changed from optional to required
  created_at?: string;
  updated_at?: string;
  module_id?: string;
  size?: number;
}
