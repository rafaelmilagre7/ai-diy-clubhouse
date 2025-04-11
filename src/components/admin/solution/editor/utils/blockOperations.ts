
import { ContentBlock, createEmptyBlock } from "../BlockTypes";

/**
 * Helper to get content blocks or return an empty array
 */
export const getContentBlocks = (content?: { blocks: ContentBlock[] }) => {
  return content?.blocks || [];
};

/**
 * Add a new block to the content
 */
export const addBlock = (
  type: string, 
  currentBlocks: ContentBlock[]
): ContentBlock[] => {
  const newBlock = createEmptyBlock(type);
  return [...currentBlocks, newBlock];
};

/**
 * Update a block at specific index
 */
export const updateBlock = (
  blocks: ContentBlock[],
  index: number, 
  data: any
): ContentBlock[] => {
  const updatedBlocks = [...blocks];
  updatedBlocks[index] = {
    ...updatedBlocks[index],
    data: {
      ...updatedBlocks[index].data,
      ...data
    }
  };
  return updatedBlocks;
};

/**
 * Remove a block at specific index
 */
export const removeBlock = (
  blocks: ContentBlock[],
  index: number
): ContentBlock[] => {
  return blocks.filter((_, i) => i !== index);
};

/**
 * Move a block up or down
 */
export const moveBlock = (
  blocks: ContentBlock[],
  index: number, 
  direction: 'up' | 'down'
): ContentBlock[] => {
  if (
    (direction === 'up' && index === 0) ||
    (direction === 'down' && index === blocks.length - 1)
  ) {
    return blocks;
  }

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  const updatedBlocks = [...blocks];
  const temp = updatedBlocks[index];
  updatedBlocks[index] = updatedBlocks[newIndex];
  updatedBlocks[newIndex] = temp;
  
  return updatedBlocks;
};
