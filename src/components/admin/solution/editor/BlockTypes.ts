
export interface BlockData {
  [key: string]: any;
}

export interface ContentBlock {
  id: string;
  type: string;
  data: BlockData;
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  content: {
    blocks: ContentBlock[];
  };
  type: 'landing' | 'overview' | 'preparation' | 'implementation' | 'verification' | 'results' | 'optimization' | 'celebration';
  module_order: number;
  created_at: string;
  updated_at: string;
}

export interface HeaderBlockData {
  text: string;
  level: number;
}

export interface ParagraphBlockData {
  text: string;
}

export interface ImageBlockData {
  url: string;
  caption?: string;
  alt?: string;
}

export interface ListBlockData {
  items: string[];
}

export interface VideoBlockData {
  url: string;
  caption?: string;
}

export interface YoutubeBlockData {
  youtubeId: string;
  caption?: string;
}

export interface CodeBlockData {
  code: string;
  language: string;
}

export interface QuoteBlockData {
  text: string;
  caption?: string;
}

export const createEmptyBlock = (type: string): ContentBlock => {
  const baseBlock = {
    id: Date.now().toString(),
    type,
  };

  switch (type) {
    case 'header':
      return {
        ...baseBlock,
        data: { text: 'Título', level: 2 }
      };
    case 'paragraph':
      return {
        ...baseBlock,
        data: { text: 'Digite seu texto aqui...' }
      };
    case 'image':
      return {
        ...baseBlock,
        data: { url: '', caption: '', alt: '' }
      };
    case 'list':
      return {
        ...baseBlock,
        data: { items: ['Item 1', 'Item 2'] }
      };
    case 'video':
      return {
        ...baseBlock,
        data: { url: '', caption: '' }
      };
    case 'code':
      return {
        ...baseBlock,
        data: { code: '', language: 'javascript' }
      };
    case 'quote':
      return {
        ...baseBlock,
        data: { text: 'Citação...', caption: 'Autor' }
      };
    case 'youtube':
      return {
        ...baseBlock,
        data: { youtubeId: '', caption: '' }
      };
    default:
      return {
        ...baseBlock,
        data: { text: '' }
      };
  }
};
