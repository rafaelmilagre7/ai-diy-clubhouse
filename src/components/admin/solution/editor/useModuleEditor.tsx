
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Module } from "@/lib/supabase";
import { validateModule } from "./utils/moduleValidation";

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

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

export const useModuleEditor = (initialModule: Module) => {
  const [title, setTitle] = useState(initialModule.title);
  const [activeTab, setActiveTab] = useState("editor");
  const [content, setContent] = useState(() => {
    if (initialModule.content && initialModule.content.blocks) {
      return initialModule.content;
    }
    return { blocks: [] };
  });

  const getContentBlocks = (): ContentBlock[] => {
    return content.blocks || [];
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      data: getDefaultDataForType(type),
    };

    setContent((prev) => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));
  };

  // Método modificado para aceitar índice ao invés de ID
  const updateBlock = (index: number, data: Record<string, any>) => {
    setContent((prev) => {
      const updatedBlocks = [...(prev.blocks || [])];
      if (updatedBlocks[index]) {
        updatedBlocks[index] = {
          ...updatedBlocks[index],
          data: { ...updatedBlocks[index].data, ...data }
        };
      }
      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
  };

  // Método modificado para aceitar índice ao invés de ID
  const removeBlock = (index: number) => {
    setContent((prev) => {
      const updatedBlocks = [...(prev.blocks || [])];
      updatedBlocks.splice(index, 1);
      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
  };

  // Método modificado para aceitar índice ao invés de ID
  const moveBlock = (index: number, direction: "up" | "down") => {
    if (index < 0 || index >= getContentBlocks().length) return;
    
    setContent((prev) => {
      const blocks = [...(prev.blocks || [])];
      
      if (direction === "up" && index > 0) {
        // Troca com o elemento anterior
        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      } else if (direction === "down" && index < blocks.length - 1) {
        // Troca com o próximo elemento
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      }
      
      return {
        ...prev,
        blocks,
      };
    });
  };

  const getDefaultDataForType = (type: BlockType): Record<string, any> => {
    switch (type) {
      case "header":
        return { text: "", level: 2 };
      case "paragraph":
        return { text: "" };
      case "quote":
        return { text: "", caption: "" };
      case "list":
        return { items: [""] };
      case "image":
        return { url: "", caption: "", alt: "" };
      case "video":
        return { url: "", caption: "" };
      case "code":
        return { code: "", language: "javascript" };
      case "checklist":
        return { items: [{ text: "", checked: false }] };
      case "steps":
        return { title: "Passo a passo", steps: [{ title: "Passo 1", description: "", imageUrl: "" }] };
      case "warning":
        return { title: "Atenção", text: "" };
      case "benefits":
        return { title: "Benefícios", items: [""] };
      case "metrics":
        return { title: "Métricas", description: "", metrics: [{ label: "", value: "", unit: "" }] };
      case "tips":
        return { title: "Dicas de otimização", items: [""] };
      case "cta":
        return { title: "Próximos passos", text: "", buttonText: "Continuar", buttonLink: "" };
      default:
        return {};
    }
  };

  const handleSave = async (onSave: (module: Module) => void) => {
    try {
      // Validate module content before saving
      const validationResult = validateModule(initialModule.type, content);
      if (!validationResult.valid) {
        throw new Error(validationResult.message);
      }

      const updatedModule: Module = {
        ...initialModule,
        title,
        content,
        updated_at: new Date().toISOString(),
      };

      onSave(updatedModule);
    } catch (error) {
      console.error("Error saving module:", error);
      // Handle error (could be connected to a toast notification system)
    }
  };

  return {
    title,
    setTitle,
    activeTab,
    setActiveTab,
    getContentBlocks,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    handleSave,
  };
};
