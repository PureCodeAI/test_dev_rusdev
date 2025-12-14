import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BlockControlsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const BlockControls = ({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp = false,
  canMoveDown = false
}: BlockControlsProps) => {
  return (
    <div className="absolute top-2 right-2 flex gap-1 bg-background border border-border rounded-md p-1 shadow-lg">
      {canMoveUp && onMoveUp && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          title="Переместить вверх"
        >
          <Icon name="ArrowUp" size={14} />
        </Button>
      )}
      {canMoveDown && onMoveDown && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          title="Переместить вниз"
        >
          <Icon name="ArrowDown" size={14} />
        </Button>
      )}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        title="Дублировать (Ctrl+D)"
      >
        <Icon name="Copy" size={14} />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-destructive hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Удалить (Delete)"
      >
        <Icon name="Trash2" size={14} />
      </Button>
    </div>
  );
};

