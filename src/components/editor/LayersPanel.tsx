import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface LayerItem {
  id: number;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  children?: LayerItem[];
}

interface LayersPanelProps {
  blocks: Array<Record<string, unknown>>;
  selectedBlockId: number | null;
  selectedBlockIds: number[];
  onSelectBlock: (blockId: number, isMultiSelect?: boolean) => void;
  onRenameBlock: (blockId: number, newName: string) => void;
  onToggleVisibility: (blockId: number) => void;
  onToggleLock: (blockId: number) => void;
  onBringToFront: (blockId: number) => void;
  onSendToBack: (blockId: number) => void;
  onBringForward: (blockId: number) => void;
  onSendBackward: (blockId: number) => void;
}

export const LayersPanel = ({
  blocks,
  selectedBlockId,
  selectedBlockIds,
  onSelectBlock,
  onRenameBlock,
  onToggleVisibility,
  onToggleLock,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward
}: LayersPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const layers: LayerItem[] = useMemo(() => {
    return blocks.map((block) => {
      const bid = typeof block.id === 'number' ? block.id : Number(block.id) || 0;
      const blockName = (block.name as string) || (block.type as string) || 'Блок';
      return {
        id: bid,
        name: blockName,
        type: (block.type as string) || 'unknown',
        visible: (block.visible as boolean) ?? true,
        locked: (block.locked as boolean) ?? false,
        children: block.children as LayerItem[] | undefined
      };
    });
  }, [blocks]);

  const filteredLayers = useMemo(() => {
    if (!searchQuery.trim()) return layers;
    const query = searchQuery.toLowerCase();
    return layers.filter(layer => 
      layer.name.toLowerCase().includes(query) ||
      layer.type.toLowerCase().includes(query)
    );
  }, [layers, searchQuery]);

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleRenameStart = (layer: LayerItem) => {
    setRenamingId(layer.id);
    setRenameValue(layer.name);
  };

  const handleRenameSubmit = (id: number) => {
    if (renameValue.trim()) {
      onRenameBlock(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const getBlockIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'hero': 'Heading1',
      'text': 'Type',
      'image': 'Image',
      'button': 'MousePointerClick',
      'form': 'FileText',
      'video': 'Video',
      'container': 'Box',
      'section': 'Square',
      'row': 'Rows',
      'column': 'Columns'
    };
    return iconMap[type] || 'Square';
  };

  const renderLayer = (layer: LayerItem, index: number, depth: number = 0) => {
    const isSelected = selectedBlockId === layer.id || selectedBlockIds.includes(layer.id);
    const isRenaming = renamingId === layer.id;
    const hasChildren = layer.children && layer.children.length > 0;
    const isExpanded = expandedIds.has(layer.id);

    return (
      <div key={layer.id}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded hover:bg-accent cursor-pointer group",
            isSelected && "bg-primary/10"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={(e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return;
            onSelectBlock(layer.id, e.ctrlKey || e.metaKey);
          }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(layer.id);
              }}
            >
              <Icon 
                name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                size={12} 
              />
            </Button>
          )}
          {!hasChildren && <div className="w-5" />}

          <Icon 
            name={getBlockIcon(layer.type)} 
            size={14} 
            className="text-muted-foreground flex-shrink-0"
          />

          {isRenaming ? (
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => handleRenameSubmit(layer.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameSubmit(layer.id);
                } else if (e.key === 'Escape') {
                  handleRenameCancel();
                }
              }}
              className="h-6 text-xs flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className="flex-1 text-sm truncate"
              onDoubleClick={() => handleRenameStart(layer)}
            >
              {layer.name}
            </span>
          )}

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(layer.id);
              }}
              title={layer.visible ? "Скрыть" : "Показать"}
            >
              <Icon 
                name={layer.visible ? "Eye" : "EyeOff"} 
                size={14} 
                className={cn(layer.visible ? "text-foreground" : "text-muted-foreground")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(layer.id);
              }}
              title={layer.locked ? "Разблокировать" : "Заблокировать"}
            >
              <Icon 
                name={layer.locked ? "Lock" : "Unlock"} 
                size={14} 
                className={cn(layer.locked ? "text-foreground" : "text-muted-foreground")}
              />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && layer.children && (
          <div>
            {layer.children.map((child, childIndex) => 
              renderLayer(child, childIndex, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const selectedLayer = layers.find(l => l.id === selectedBlockId);
  const canMoveUp = selectedBlockId !== null && layers.length > 1;
  const canMoveDown = selectedBlockId !== null && layers.length > 1;
  const isFirst = selectedBlockId !== null && layers[0]?.id === selectedBlockId;
  const isLast = selectedBlockId !== null && layers[layers.length - 1]?.id === selectedBlockId;

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shadow-sm">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Слои</h3>
          <span className="text-xs text-muted-foreground">{layers.length}</span>
        </div>
        <div className="relative">
          <Icon 
            name="Search" 
            size={14} 
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            placeholder="Поиск слоев..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1">
          {filteredLayers.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Нет слоев
            </div>
          ) : (
            filteredLayers.map((layer, index) => renderLayer(layer, index))
          )}
        </div>
      </ScrollArea>

      {selectedBlockId && (
        <div className="p-3 border-t border-border space-y-2">
          <div className="text-xs font-semibold mb-2">Порядок слоев</div>
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onBringToFront(selectedBlockId)}
              disabled={isLast}
              title="На передний план"
            >
              <Icon name="ArrowUp" size={12} className="mr-1" />
              Вперед
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onSendToBack(selectedBlockId)}
              disabled={isFirst}
              title="На задний план"
            >
              <Icon name="ArrowDown" size={12} className="mr-1" />
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onBringForward(selectedBlockId)}
              disabled={isLast}
              title="Переместить вперед"
            >
              <Icon name="ChevronUp" size={12} className="mr-1" />
              Вверх
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onSendBackward(selectedBlockId)}
              disabled={isFirst}
              title="Переместить назад"
            >
              <Icon name="ChevronDown" size={12} className="mr-1" />
              Вниз
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};

