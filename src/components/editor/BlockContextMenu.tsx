import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import Icon from '@/components/ui/icon';

interface BlockContextMenuProps {
  children: React.ReactNode;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canPaste?: boolean;
  canGroup?: boolean;
  canUngroup?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const BlockContextMenu = ({
  children,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup,
  onMoveUp,
  onMoveDown,
  canPaste = false,
  canGroup = false,
  canUngroup = false,
  canMoveUp = false,
  canMoveDown = false
}: BlockContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onCopy}>
          <Icon name="Copy" size={16} className="mr-2" />
          Копировать (Ctrl+C)
        </ContextMenuItem>
        {canPaste && (
          <ContextMenuItem onClick={onPaste}>
            <Icon name="Clipboard" size={16} className="mr-2" />
            Вставить (Ctrl+V)
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={onDuplicate}>
          <Icon name="CopyPlus" size={16} className="mr-2" />
          Дублировать (Ctrl+D)
        </ContextMenuItem>
        <ContextMenuSeparator />
        {canMoveUp && onMoveUp && (
          <ContextMenuItem onClick={onMoveUp}>
            <Icon name="ArrowUp" size={16} className="mr-2" />
            Переместить вверх
          </ContextMenuItem>
        )}
        {canMoveDown && onMoveDown && (
          <ContextMenuItem onClick={onMoveDown}>
            <Icon name="ArrowDown" size={16} className="mr-2" />
            Переместить вниз
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        {canGroup && onGroup && (
          <ContextMenuItem onClick={onGroup}>
            <Icon name="Layers" size={16} className="mr-2" />
            Группировать
          </ContextMenuItem>
        )}
        {canUngroup && onUngroup && (
          <ContextMenuItem onClick={onUngroup}>
            <Icon name="Layers" size={16} className="mr-2" />
            Разгруппировать
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Icon name="Trash2" size={16} className="mr-2" />
          Удалить (Delete)
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

