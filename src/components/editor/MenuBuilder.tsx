import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDrag, useDrop } from 'react-dnd';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  target?: '_blank' | '_self';
  type: 'link' | 'page' | 'anchor' | 'external';
  children?: MenuItem[];
  icon?: string;
  description?: string;
}

interface MenuBuilderProps {
  menuItems: MenuItem[];
  availablePages?: Array<{ id: number; name: string; path: string }>;
  onMenuItemsChange: (items: MenuItem[]) => void;
}

const SortableMenuItem = ({ item, onEdit, onDelete, onAddChild, level = 0, availablePages, onMove }: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (dragId: string, hoverId: string) => void;
  level: number;
  availablePages?: Array<{ id: number; name: string; path: string }>;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MENU_ITEM',
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MENU_ITEM',
    drop: (draggedItem: { id: string }) => {
      if (draggedItem.id !== item.id) {
        onMove(draggedItem.id, item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const style = {
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
  };

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div ref={(node) => drag(drop(node))} style={style} className="space-y-1">
      <div
        className={`flex items-center gap-2 p-2 rounded border bg-card hover:bg-muted ${
          level > 0 ? 'ml-4' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        <div className="cursor-grab active:cursor-grabbing">
          <Icon name="GripVertical" size={16} className="text-muted-foreground" />
        </div>
        <Icon name={item.type === 'page' ? 'File' : item.type === 'anchor' ? 'Hash' : 'Link'} size={14} />
        <span className="flex-1 text-sm">{item.label}</span>
        <Badge variant="outline" className="text-xs">{item.href}</Badge>
        {item.target === '_blank' && (
          <Icon name="ExternalLink" size={12} className="text-muted-foreground" />
        )}
        {hasChildren && (
          <Badge variant="secondary" className="text-xs">
            {item.children!.length} подпунктов
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onAddChild(item.id)}
        >
          <Icon name="Plus" size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onEdit(item)}
        >
          <Icon name="Edit" size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Icon name="Trash" size={12} />
        </Button>
      </div>
      {hasChildren && (
        <div className="ml-4 space-y-1">
          {item.children!.map(child => (
            <SortableMenuItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onMove={onMove}
              level={level + 1}
              availablePages={availablePages}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MenuBuilder = ({ menuItems, availablePages = [], onMenuItemsChange }: MenuBuilderProps) => {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    label: '',
    href: '',
    type: 'link',
    target: '_self'
  });

  useEffect(() => {
    setItems(menuItems);
  }, [menuItems]);

  const handleMove = (dragId: string, hoverId: string) => {
    const dragIndex = items.findIndex(item => item.id === dragId);
    const hoverIndex = items.findIndex(item => item.id === hoverId);

    if (dragIndex === -1 || hoverIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, removed);

    setItems(newItems);
    onMenuItemsChange(newItems);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setEditingParentId(null);
    setNewItem({
      label: '',
      href: '',
      type: 'link',
      target: '_self'
    });
    setIsEditDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditingParentId(null);
    setNewItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleAddChild = (parentId: string) => {
    setEditingItem(null);
    setEditingParentId(parentId);
    setNewItem({
      label: '',
      href: '',
      type: 'link',
      target: '_self'
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!newItem.label || !newItem.href) {
      return;
    }

    const itemToSave: MenuItem = {
      id: editingItem?.id || `menu-${Date.now()}`,
      label: newItem.label!,
      href: newItem.href!,
      type: newItem.type || 'link',
      target: newItem.target || '_self',
      icon: newItem.icon,
      description: newItem.description,
      children: editingItem?.children || []
    };

    if (editingItem) {
      const updatedItems = items.map(item => {
        if (item.id === editingItem.id) {
          return itemToSave;
        }
        return updateItemInTree(item, editingItem.id, itemToSave);
      });
      setItems(updatedItems);
      onMenuItemsChange(updatedItems);
    } else if (editingParentId) {
      const updatedItems = items.map(item => {
        return addChildToItem(item, editingParentId, itemToSave);
      });
      setItems(updatedItems);
      onMenuItemsChange(updatedItems);
    } else {
      const updatedItems = [...items, itemToSave];
      setItems(updatedItems);
      onMenuItemsChange(updatedItems);
    }

    setIsEditDialogOpen(false);
    setEditingItem(null);
    setEditingParentId(null);
  };

  const updateItemInTree = (item: MenuItem, id: string, updated: MenuItem): MenuItem => {
    if (item.id === id) {
      return updated;
    }
    if (item.children) {
      return {
        ...item,
        children: item.children.map(child => updateItemInTree(child, id, updated))
      };
    }
    return item;
  };

  const addChildToItem = (item: MenuItem, parentId: string, child: MenuItem): MenuItem => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), child]
      };
    }
    if (item.children) {
      return {
        ...item,
        children: item.children.map(childItem => addChildToItem(childItem, parentId, child))
      };
    }
    return item;
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.map(item => removeItemFromTree(item, id)).filter(Boolean) as MenuItem[];
    setItems(updatedItems);
    onMenuItemsChange(updatedItems);
  };

  const removeItemFromTree = (item: MenuItem, id: string): MenuItem | null => {
    if (item.id === id) {
      return null;
    }
    if (item.children) {
      return {
        ...item,
        children: item.children.map(child => removeItemFromTree(child, id)).filter(Boolean) as MenuItem[]
      };
    }
    return item;
  };

  const handleTypeChange = (type: string) => {
    setNewItem({ ...newItem, type: type as MenuItem['type'] });
    if (type === 'page' && availablePages.length > 0) {
      setNewItem({ ...newItem, type: 'page', href: availablePages[0].path });
    } else if (type === 'anchor') {
      setNewItem({ ...newItem, type: 'anchor', href: '#section' });
    } else if (type === 'external') {
      setNewItem({ ...newItem, type: 'external', href: 'https://' });
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Меню</h3>
          <Button size="sm" onClick={handleAddItem}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить пункт
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Нет пунктов меню</p>
                <p className="text-xs mt-2">Добавьте первый пункт меню</p>
              </div>
            ) : (
              items.map(item => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onAddChild={handleAddChild}
                  onMove={handleMove}
                  level={0}
                  availablePages={availablePages}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Редактировать пункт меню' : editingParentId ? 'Добавить подпункт' : 'Добавить пункт меню'}
            </DialogTitle>
            <DialogDescription>
              Настройте параметры пункта меню
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input
                value={newItem.label || ''}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="Главная"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Тип ссылки</Label>
              <Select
                value={newItem.type || 'link'}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Внутренняя ссылка</SelectItem>
                  <SelectItem value="page">Страница сайта</SelectItem>
                  <SelectItem value="anchor">Якорная ссылка</SelectItem>
                  <SelectItem value="external">Внешняя ссылка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newItem.type === 'page' && availablePages.length > 0 && (
              <div>
                <Label>Страница</Label>
                <Select
                  value={newItem.href || ''}
                  onValueChange={(value) => setNewItem({ ...newItem, href: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePages.map(page => (
                      <SelectItem key={page.id} value={page.path}>
                        {page.name} ({page.path})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(newItem.type === 'link' || newItem.type === 'anchor' || newItem.type === 'external') && (
              <div>
                <Label>URL / Путь</Label>
                <Input
                  value={newItem.href || ''}
                  onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                  placeholder={newItem.type === 'anchor' ? '#section' : newItem.type === 'external' ? 'https://example.com' : '/page'}
                  className="mt-2"
                />
              </div>
            )}
            <div>
              <Label>Открывать в новой вкладке</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={newItem.target === '_blank'}
                  onCheckedChange={(checked) => setNewItem({ ...newItem, target: checked ? '_blank' : '_self' })}
                />
                <span className="text-sm text-muted-foreground">
                  {newItem.target === '_blank' ? 'Да' : 'Нет'}
                </span>
              </div>
            </div>
            <div>
              <Label>Иконка (опционально)</Label>
              <Input
                value={newItem.icon || ''}
                onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                placeholder="Home"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Название иконки из библиотеки Lucide
              </p>
            </div>
            <div>
              <Label>Описание (опционально)</Label>
              <Input
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Краткое описание"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveItem} disabled={!newItem.label || !newItem.href}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

