
import { useState, useEffect } from "react";
import { Module, ContentBlock, createEmptyBlock } from "./BlockTypes";
import { useToast } from "@/hooks/use-toast";

export const useModuleEditor = (module: Module) => {
  const [editedModule, setEditedModule] = useState<Module>({ ...module });
  const [activeTab, setActiveTab] = useState("editor");
  const [title, setTitle] = useState(module.title);
  const { toast } = useToast();

  // Update local state when module prop changes
  useEffect(() => {
    setEditedModule({ ...module });
    setTitle(module.title);
  }, [module]);

  // Initialize content if it doesn't exist or has an unexpected format
  useEffect(() => {
    if (!editedModule.content || !Array.isArray(editedModule.content.blocks)) {
      setEditedModule(prev => ({
        ...prev,
        content: {
          blocks: []
        }
      }));
    }
  }, []);

  // Helper to get content blocks or return an empty array
  const getContentBlocks = () => {
    return editedModule.content?.blocks || [];
  };

  // Add a new block to the content
  const addBlock = (type: string) => {
    const newBlock = createEmptyBlock(type);
    const updatedBlocks = [...getContentBlocks(), newBlock];
    
    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Update a block at specific index
  const updateBlock = (index: number, data: any) => {
    const blocks = getContentBlocks();
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      data: {
        ...updatedBlocks[index].data,
        ...data
      }
    };

    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Remove a block at specific index
  const removeBlock = (index: number) => {
    const blocks = getContentBlocks();
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    
    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Move a block up or down
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = getContentBlocks();
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedBlocks = [...blocks];
    const temp = updatedBlocks[index];
    updatedBlocks[index] = updatedBlocks[newIndex];
    updatedBlocks[newIndex] = temp;

    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Save the module
  const handleSave = (onSave: (module: Module) => void) => {
    // Validate fields
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "O módulo precisa ter um título.",
        variant: "destructive",
      });
      return;
    }

    const updatedModule = {
      ...editedModule,
      title,
    };

    onSave(updatedModule);
  };

  return {
    title,
    setTitle,
    activeTab,
    setActiveTab,
    editedModule,
    getContentBlocks,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    handleSave
  };
};
