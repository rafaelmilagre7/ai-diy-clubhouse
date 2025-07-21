
import {
  AlertTriangle,
  Code,
  GitBranch,
  Heading,
  Image,
  List,
  ListChecks,
  MessageSquareQuote,
  Type,
  Video,
  Award,
  BarChart3,
  Lightbulb,
  MousePointerClick,
  ChevronDown,
  ChevronUp,
  LucideIcon
} from "lucide-react";

export type BlockType = 
  | "header"
  | "paragraph"
  | "quote"
  | "list"
  | "image"
  | "video"
  
  | "code"
  | "checklist"
  | "steps"
  | "warning"
  | "benefits"
  | "metrics"
  | "tips"
  | "cta";

export type BlockCategory = "basic" | "advanced";

interface BlockConfig {
  label: string;
  icon: LucideIcon;
  category: BlockCategory;
}

const blockConfigs: Record<BlockType, BlockConfig> = {
  header: { label: "Título", icon: Heading, category: "basic" },
  paragraph: { label: "Parágrafo", icon: Type, category: "basic" },
  quote: { label: "Citação", icon: MessageSquareQuote, category: "basic" },
  list: { label: "Lista", icon: List, category: "basic" },
  image: { label: "Imagem", icon: Image, category: "basic" },
  video: { label: "Vídeo", icon: Video, category: "basic" },
  
  code: { label: "Código", icon: Code, category: "basic" },
  checklist: { label: "Checklist", icon: ListChecks, category: "advanced" },
  steps: { label: "Passos", icon: GitBranch, category: "advanced" },
  warning: { label: "Alerta", icon: AlertTriangle, category: "advanced" },
  benefits: { label: "Benefícios", icon: Award, category: "advanced" },
  metrics: { label: "Métricas", icon: BarChart3, category: "advanced" },
  tips: { label: "Dicas", icon: Lightbulb, category: "advanced" },
  cta: { label: "Chamada para Ação", icon: MousePointerClick, category: "advanced" }
};

export const getBlockIcon = (type: BlockType): LucideIcon => {
  return blockConfigs[type]?.icon || Type;
};

export const getBlockLabel = (type: BlockType): string => {
  return blockConfigs[type]?.label || "Bloco";
};

export const getBlockCategory = (type: BlockType): BlockCategory => {
  return blockConfigs[type]?.category || "basic";
};

// Create a default export that provides the icon based on the type
const BlockIcons = ({ type, className }: { type: BlockType; className?: string }) => {
  const Icon = getBlockIcon(type);
  return <Icon className={className} />;
};

export default BlockIcons;

export { ChevronDown, ChevronUp };
