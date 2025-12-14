export interface BlockBounds {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getBlockBounds = (element: HTMLElement): BlockBounds | null => {
  const rect = element.getBoundingClientRect();
  const parent = element.offsetParent as HTMLElement;
  if (!parent) return null;

  const parentRect = parent.getBoundingClientRect();
  return {
    id: parseInt(element.dataset.blockId || '0'),
    x: rect.left - parentRect.left,
    y: rect.top - parentRect.top,
    width: rect.width,
    height: rect.height
  };
};

export const alignBlocks = (
  blocks: BlockBounds[],
  alignment: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle'
): Record<number, { x?: number; y?: number }> => {
  if (blocks.length < 2) return {};

  const positions: Record<number, { x?: number; y?: number }> = {};

  if (alignment === 'left') {
    const minX = Math.min(...blocks.map(b => b.x));
    blocks.forEach(block => {
      positions[block.id] = { x: minX };
    });
  } else if (alignment === 'right') {
    const maxX = Math.max(...blocks.map(b => b.x + b.width));
    blocks.forEach(block => {
      positions[block.id] = { x: maxX - block.width };
    });
  } else if (alignment === 'center') {
    const minX = Math.min(...blocks.map(b => b.x));
    const maxX = Math.max(...blocks.map(b => b.x + b.width));
    const centerX = (minX + maxX) / 2;
    blocks.forEach(block => {
      positions[block.id] = { x: centerX - block.width / 2 };
    });
  } else if (alignment === 'top') {
    const minY = Math.min(...blocks.map(b => b.y));
    blocks.forEach(block => {
      positions[block.id] = { y: minY };
    });
  } else if (alignment === 'bottom') {
    const maxY = Math.max(...blocks.map(b => b.y + b.height));
    blocks.forEach(block => {
      positions[block.id] = { y: maxY - block.height };
    });
  } else if (alignment === 'middle') {
    const minY = Math.min(...blocks.map(b => b.y));
    const maxY = Math.max(...blocks.map(b => b.y + b.height));
    const centerY = (minY + maxY) / 2;
    blocks.forEach(block => {
      positions[block.id] = { y: centerY - block.height / 2 };
    });
  }

  return positions;
};

export const distributeBlocks = (
  blocks: BlockBounds[],
  direction: 'horizontal' | 'vertical' | 'spacing'
): Record<number, { x?: number; y?: number }> => {
  if (blocks.length < 3) return {};

  const sortedBlocks = [...blocks].sort((a, b) => {
    if (direction === 'horizontal' || direction === 'spacing') {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  const positions: Record<number, { x?: number; y?: number }> = {};

  if (direction === 'horizontal') {
    const minX = Math.min(...sortedBlocks.map(b => b.x));
    const maxX = Math.max(...sortedBlocks.map(b => b.x + b.width));
    const totalWidth = maxX - minX;
    const blockWidths = sortedBlocks.map(b => b.width);
    const totalBlockWidth = blockWidths.reduce((sum, w) => sum + w, 0);
    const spacing = (totalWidth - totalBlockWidth) / (sortedBlocks.length - 1);

    let currentX = minX;
    sortedBlocks.forEach((block, index) => {
      positions[block.id] = { x: currentX };
      currentX += block.width + spacing;
    });
  } else if (direction === 'vertical') {
    const minY = Math.min(...sortedBlocks.map(b => b.y));
    const maxY = Math.max(...sortedBlocks.map(b => b.y + b.height));
    const totalHeight = maxY - minY;
    const blockHeights = sortedBlocks.map(b => b.height);
    const totalBlockHeight = blockHeights.reduce((sum, h) => sum + h, 0);
    const spacing = (totalHeight - totalBlockHeight) / (sortedBlocks.length - 1);

    let currentY = minY;
    sortedBlocks.forEach((block, index) => {
      positions[block.id] = { y: currentY };
      currentY += block.height + spacing;
    });
  } else if (direction === 'spacing') {
    const minX = Math.min(...sortedBlocks.map(b => b.x));
    const maxX = Math.max(...sortedBlocks.map(b => b.x + b.width));
    const totalWidth = maxX - minX;
    const blockWidths = sortedBlocks.map(b => b.width);
    const totalBlockWidth = blockWidths.reduce((sum, w) => sum + w, 0);
    const spacing = (totalWidth - totalBlockWidth) / (sortedBlocks.length - 1);

    let currentX = minX;
    sortedBlocks.forEach((block) => {
      positions[block.id] = { x: currentX };
      currentX += block.width + spacing;
    });
  }

  return positions;
};

export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const snapToObject = (
  value: number,
  otherValues: number[],
  threshold: number = 5
): number => {
  for (const otherValue of otherValues) {
    if (Math.abs(value - otherValue) < threshold) {
      return otherValue;
    }
  }
  return value;
};

