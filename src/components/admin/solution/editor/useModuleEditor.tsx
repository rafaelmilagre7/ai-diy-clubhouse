
import { useState, useEffect } from "react";
import { Module } from "./BlockTypes";
import { 
  getContentBlocks, 
  addBlock, 
  updateBlock, 
  removeBlock, 
  moveBlock 
} from "./utils/blockOperations";
import { validateModule, createUpdatedModule } from "./utils/moduleValidation";

export const useModuleEditor = (module: Module) => {
  const [editedModule, setEditedModule] = useState<Module>({ ...module });
  const [activeTab, setActiveTab] = useState("editor");
  const [title, setTitle] = useState(module.title);

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

  // Add a new block to the content
  const handleAddBlock = (type: string) => {
    const blocks = getContentBlocks(editedModule.content);
    const updatedBlocks = addBlock(type, blocks);
    
    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Update a block at specific index
  const handleUpdateBlock = (index: number, data: any) => {
    const blocks = getContentBlocks(editedModule.content);
    const updatedBlocks = updateBlock(blocks, index, data);

    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Remove a block at specific index
  const handleRemoveBlock = (index: number) => {
    const blocks = getContentBlocks(editedModule.content);
    const updatedBlocks = removeBlock(blocks, index);
    
    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Move a block up or down
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = getContentBlocks(editedModule.content);
    const updatedBlocks = moveBlock(blocks, index, direction);

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
    if (!validateModule(title)) {
      return;
    }

    const updatedModule = createUpdatedModule(editedModule, title);
    onSave(updatedModule);
  };

  return {
    title,
    setTitle,
    activeTab,
    setActiveTab,
    editedModule,
    getContentBlocks: () => getContentBlocks(editedModule.content),
    addBlock: handleAddBlock,
    updateBlock: handleUpdateBlock,
    removeBlock: handleRemoveBlock,
    moveBlock: handleMoveBlock,
    handleSave
  };
};
