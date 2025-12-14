import { useDrop } from 'react-dnd';
import { GridOverlay } from './GridOverlay';
import { BlockRenderer } from './BlockRenderer';
import { DropZone } from './DropZone';

interface EditorCanvasProps {
  pageBlocks: Array<Record<string, unknown>>;
  selectedBlockId: number | null;
  selectedBlockIds: number[];
  currentBreakpoint: 'desktop-1920' | 'desktop-1440' | 'desktop-1280' | 'tablet-1024' | 'tablet-768' | 'mobile-480' | 'mobile-375' | 'custom';
  viewportWidth: number | null;
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  onSelectBlock: (blockId: number, isMultiSelect?: boolean) => void;
  onBlockContentChange: (blockId: number, content: Record<string, unknown>) => void;
  onDuplicateBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onCopyBlocks: () => void;
  onPasteBlocks: () => void;
  canPaste: boolean;
  onDeleteBlock: (blockId: number) => void;
  onBlockDrop?: (blockType: string, blockName: string) => void;
}

export const EditorCanvas = ({
  pageBlocks,
  selectedBlockId,
  selectedBlockIds,
  currentBreakpoint,
  viewportWidth,
  gridEnabled,
  gridSize,
  snapToGrid,
  onSelectBlock,
  onBlockContentChange,
  onDuplicateBlock,
  onMoveBlock,
  onCopyBlocks,
  onPasteBlocks,
  canPaste,
  onDeleteBlock,
  onBlockDrop
}: EditorCanvasProps) => {
  const getViewModeWidth = () => {
    if (viewportWidth !== null) {
      return { maxWidth: `${viewportWidth}px` };
    }
    
    switch (currentBreakpoint) {
      case 'mobile-375': return { maxWidth: '375px' };
      case 'mobile-480': return { maxWidth: '480px' };
      case 'tablet-768': return { maxWidth: '768px' };
      case 'tablet-1024': return { maxWidth: '1024px' };
      case 'desktop-1280': return { maxWidth: '1280px' };
      case 'desktop-1440': return { maxWidth: '1440px' };
      case 'desktop-1920': return { maxWidth: '1920px' };
      default: return { width: '100%' };
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BLOCK_MOVE',
    drop: (item: { blockId: number; blockIndex: number }) => {
      const draggedBlockId = item.blockId;
      const targetIndex = pageBlocks.findIndex(b => {
        const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
        return bid === draggedBlockId;
      });
      
      if (targetIndex !== -1 && targetIndex !== item.blockIndex) {
        const direction = targetIndex > item.blockIndex ? 'down' : 'up';
        onMoveBlock(draggedBlockId, direction);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="flex-1 overflow-auto bg-muted/30">
      <div className="mx-auto transition-all duration-300 relative" style={getViewModeWidth()}>
        {gridEnabled && (
          <GridOverlay
            enabled={gridEnabled}
            size={gridSize}
            snapToGrid={snapToGrid}
          />
        )}
        <div ref={drop}>
          <DropZone 
            onDrop={onBlockDrop ? (blockType: string, blockName: string) => {
              if (onBlockDrop) {
                onBlockDrop(blockType, blockName);
              }
            } : undefined} 
            hasBlocks={pageBlocks.length > 0}
          >
            <div className="space-y-4 relative z-10">
              {pageBlocks.map((block, index) => {
                const blockId = typeof block.id === 'number' ? block.id : Number(block.id) || 0;
                const isSelected = selectedBlockId === blockId;
                const isMultiSelected = selectedBlockIds.includes(blockId);
                const canMoveUp = index > 0;
                const canMoveDown = index < pageBlocks.length - 1;
                
                return (
                  <BlockRenderer
                    key={blockId}
                    block={block as { id: number; type: string; content: Record<string, unknown>; styles: Record<string, unknown>; position: number; visible?: boolean; locked?: boolean }}
                    isSelected={isSelected}
                    isMultiSelected={isMultiSelected && !isSelected}
                    onSelect={(isMultiSelect) => onSelectBlock(blockId, isMultiSelect)}
                    onDelete={() => onDeleteBlock(blockId)}
                    onContentChange={(content) => onBlockContentChange(blockId, content)}
                    onDuplicate={() => onDuplicateBlock(blockId)}
                    onMoveUp={canMoveUp ? () => onMoveBlock(blockId, 'up') : undefined}
                    onMoveDown={canMoveDown ? () => onMoveBlock(blockId, 'down') : undefined}
                    onCopy={onCopyBlocks}
                    onPaste={onPasteBlocks}
                    canMoveUp={canMoveUp}
                    canMoveDown={canMoveDown}
                    canPaste={canPaste}
                    totalBlocks={pageBlocks.length}
                    blockIndex={index}
                  />
                );
              })}
            </div>
          </DropZone>
        </div>
      </div>
    </div>
  );
};