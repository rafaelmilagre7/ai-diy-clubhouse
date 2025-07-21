
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


export interface CodeBlockData {
  code: string;
  language: string;
}

export interface QuoteBlockData {
  text: string;
  caption?: string;
}

export interface ChecklistItem {
  text: string;
  checked: boolean;
}

export interface ChecklistBlockData {
  items: ChecklistItem[];
}

export interface Step {
  title: string;
  description: string;
  imageUrl: string;
}

export interface StepsBlockData {
  title: string;
  steps: Step[];
}

export interface WarningBlockData {
  title: string;
  text: string;
}

export interface BenefitsBlockData {
  title: string;
  items: string[];
}

export interface Metric {
  label: string;
  value: string;
  unit: string;
}

export interface MetricsBlockData {
  title: string;
  description: string;
  metrics: Metric[];
}

export interface TipsBlockData {
  title: string;
  items: string[];
}

export interface CTABlockData {
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
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
    case 'checklist':
      return {
        ...baseBlock,
        data: { items: [{ text: 'Item 1', checked: false }] }
      };
    case 'steps':
      return {
        ...baseBlock,
        data: { 
          title: 'Passo a passo',
          steps: [{ title: 'Passo 1', description: 'Descrição do passo', imageUrl: '' }] 
        }
      };
    case 'warning':
      return {
        ...baseBlock,
        data: { title: 'Atenção', text: 'Texto de aviso importante' }
      };
    case 'benefits':
      return {
        ...baseBlock,
        data: { title: 'Benefícios', items: ['Benefício 1'] }
      };
    case 'metrics':
      return {
        ...baseBlock,
        data: { 
          title: 'Métricas', 
          description: 'Descrição das métricas',
          metrics: [{ label: 'Métrica', value: '0', unit: '%' }] 
        }
      };
    case 'tips':
      return {
        ...baseBlock,
        data: { title: 'Dicas', items: ['Dica 1'] }
      };
    case 'cta':
      return {
        ...baseBlock,
        data: { 
          title: 'Próximos Passos', 
          text: 'Descreva a próxima ação', 
          buttonText: 'Continuar',
          buttonLink: '#'
        }
      };
    default:
      return {
        ...baseBlock,
        data: { text: '' }
      };
  }
};
