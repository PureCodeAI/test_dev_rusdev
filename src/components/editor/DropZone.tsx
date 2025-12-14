import { useDrop } from 'react-dnd';
import Icon from '@/components/ui/icon';

interface DropZoneProps {
  onDrop: (blockType: string, blockName: string) => void;
  children?: React.ReactNode;
  hasBlocks?: boolean;
}

export const DropZone = ({ onDrop, children, hasBlocks = false }: DropZoneProps) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'BLOCK',
    drop: (item: { blockType: string; blockName: string }) => {
      onDrop(item.blockType, item.blockName);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={`min-h-[600px] transition-all ${
        isActive
          ? 'bg-primary/10 border-2 border-primary border-dashed'
          : hasBlocks
          ? 'bg-background'
          : 'bg-muted/30 border-2 border-dashed border-border'
      }`}
    >
      {!hasBlocks && !children && (
        <div className="flex flex-col items-center justify-center h-[600px] text-center px-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Icon name="MousePointerClick" size={40} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">
            {isActive ? 'Отпустите для добавления' : 'Начните создавать'}
          </h3>
          <p className="text-muted-foreground text-lg max-w-md">
            Перетащите блоки из левой панели сюда, чтобы создать страницу
          </p>
        </div>
      )}
      {children}
    </div>
  );
};
