
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Heading,
  Image,
  List,
  MessageSquareQuote,
  Plus,
  Type,
  Code,
  
  ListChecks,
  GitBranch,
  AlertOctagon,
  Award,
  BarChart3,
  Lightbulb,
  MousePointerClick
} from "lucide-react";
import { BlockType } from "./useModuleEditor";
import { 
  getBlockIcon, 
  getBlockLabel,
  getBlockCategory,
  BlockCategory
} from "./BlockIcons";

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
}

interface BlockButtonProps {
  type: BlockType;
  onAdd: () => void;
}

const BlockButton = ({ type, onAdd }: BlockButtonProps) => {
  const Icon = getBlockIcon(type);
  
  return (
    <Button
      variant="outline"
      className="justify-start"
      onClick={onAdd}
    >
      <Icon className="mr-2 h-4 w-4" />
      {getBlockLabel(type)}
    </Button>
  );
};

const BlockToolbar = ({ onAddBlock }: BlockToolbarProps) => {
  
  const blockTypes: { category: BlockCategory; types: BlockType[] }[] = [
    {
      category: "basic",
      types: ["header", "paragraph", "quote", "list", "image", "video", "code"]
    },
    {
      category: "advanced",
      types: ["checklist", "steps", "warning", "benefits", "metrics", "tips", "cta"]
    }
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {blockTypes.map((category) => (
        <Popover key={category.category}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              {category.category === "basic" ? "Conteúdo Básico" : "Conteúdo Avançado"}
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72">
            <div className="grid grid-cols-1 gap-1">
              {category.types.map((type) => (
                <BlockButton
                  key={type}
                  type={type}
                  onAdd={() => onAddBlock(type)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ))}
      
      <Button variant="default" onClick={() => onAddBlock("paragraph")}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Parágrafo
      </Button>
    </div>
  );
};

export default BlockToolbar;
