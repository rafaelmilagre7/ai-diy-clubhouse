
export type ToolCategory = 'IA' | 'Automação' | 'No-Code' | 'Integração' | 'Produtividade' | 'Outro';

export interface VideoTutorial {
  title: string;
  url: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  official_url: string;
  logo_url: string | null;
  category: ToolCategory;
  video_tutorials: VideoTutorial[];
  tags: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
}
