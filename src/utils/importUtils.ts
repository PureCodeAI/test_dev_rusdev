import { Template } from '@/types/template.types';

export interface ImportData {
  projectName?: string;
  pages?: Array<{
    id?: number;
    name: string;
    path: string;
    blocks: Array<Record<string, unknown>>;
  }>;
  blocks?: Array<Record<string, unknown>>;
  settings?: Record<string, unknown>;
  version?: string;
}

export const importFromJSON = (jsonString: string): ImportData | null => {
  try {
    const data = JSON.parse(jsonString) as ImportData;
    
    if (!data.pages && !data.blocks) {
      throw new Error('Invalid import data: missing pages or blocks');
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

export const importTemplate = (jsonString: string): Template | null => {
  try {
    const template = JSON.parse(jsonString) as Template;
    
    if (!template.id || !template.name || !template.blocks) {
      throw new Error('Invalid template data: missing required fields');
    }
    
    return template;
  } catch (error) {
    console.error('Error parsing template:', error);
    return null;
  }
};

export const importBlocks = (jsonString: string): Array<Record<string, unknown>> | null => {
  try {
    const data = JSON.parse(jsonString);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.blocks && Array.isArray(data.blocks)) {
      return data.blocks;
    }
    
    throw new Error('Invalid blocks data: expected array or object with blocks array');
  } catch (error) {
    console.error('Error parsing blocks:', error);
    return null;
  }
};

export const validateImportData = (data: ImportData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (data.pages) {
    data.pages.forEach((page, pageIndex) => {
      if (!page.name) {
        errors.push(`Page ${pageIndex}: missing name`);
      }
      if (!page.path) {
        errors.push(`Page ${pageIndex}: missing path`);
      }
      if (!Array.isArray(page.blocks)) {
        errors.push(`Page ${pageIndex}: blocks must be an array`);
      } else {
        page.blocks.forEach((block, blockIndex) => {
          if (!block.type) {
            errors.push(`Page ${pageIndex}, Block ${blockIndex}: missing type`);
          }
          if (!block.content) {
            errors.push(`Page ${pageIndex}, Block ${blockIndex}: missing content`);
          }
        });
      }
    });
  }
  
  if (data.blocks) {
    if (!Array.isArray(data.blocks)) {
      errors.push('Blocks must be an array');
    } else {
      data.blocks.forEach((block, index) => {
        if (!block.type) {
          errors.push(`Block ${index}: missing type`);
        }
        if (!block.content) {
          errors.push(`Block ${index}: missing content`);
        }
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};

