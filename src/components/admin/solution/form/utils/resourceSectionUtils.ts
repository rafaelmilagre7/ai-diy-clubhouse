
export const addResourceSection = (activeTab: string, currentValues: string) => {
  let newItem = '';
  
  switch(activeTab) {
    case 'materials':
      newItem = ',\n  {\n    "title": "Novo Material",\n    "description": "Descrição do novo material",\n    "url": "https://example.com/novo-material",\n    "type": "pdf"\n  }';
      break;
    case 'external_links':
      newItem = ',\n  {\n    "title": "Novo Link",\n    "description": "Descrição do novo link",\n    "url": "https://example.com/novo-link"\n  }';
      break;
    default:
      return currentValues;
  }
  
  try {
    // Add new item to existing JSON array
    let jsonArray = JSON.parse(currentValues);
    if (Array.isArray(jsonArray)) {
      const updatedContent = currentValues.trim();
      return updatedContent.endsWith(']') 
        ? updatedContent.substring(0, updatedContent.length - 1) + newItem + '\n]'
        : updatedContent;
    }
    return currentValues;
  } catch (error) {
    console.error('Error adding resource section:', error);
    return currentValues;
  }
};

export const getBlocksCount = (content: any): number => {
  try {
    // Handle content whether it's a string or already parsed JSON
    let parsedContent: any;
    
    if (typeof content === 'string') {
      parsedContent = JSON.parse(content);
    } else {
      parsedContent = content;
    }
    
    return parsedContent.blocks?.length || 0;
  } catch (e) {
    console.error('Error parsing content:', e);
    return 0;
  }
};
