import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface Page {
  id: number;
  name: string;
  path: string;
  is_home?: boolean;
  parent_id?: number | null;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  settings?: Record<string, unknown>;
  children?: Page[];
}

interface PagesManagerProps {
  projectId: number;
  pages: Page[];
  currentPageId: number | null;
  onPageSelect: (pageId: number) => void;
  onPageCreate: (page: { name: string; path: string; parent_id?: number | null }) => Promise<Page>;
  onPageUpdate: (pageId: number, updates: { name?: string; path?: string; parent_id?: number | null }) => Promise<void>;
  onPageDelete: (pageId: number) => Promise<void>;
  onPageDuplicate: (pageId: number) => Promise<Page>;
}

export const PagesManager = ({
  projectId,
  pages,
  currentPageId,
  onPageSelect,
  onPageCreate,
  onPageUpdate,
  onPageDelete,
  onPageDuplicate
}: PagesManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());

  const buildTree = (pagesList: Page[]): Page[] => {
    const pageMap = new Map<number, Page>();
    const rootPages: Page[] = [];

    pagesList.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    pagesList.forEach(page => {
      const pageWithChildren = pageMap.get(page.id)!;
      if (page.parent_id && pageMap.has(page.parent_id)) {
        const parent = pageMap.get(page.parent_id)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(pageWithChildren);
      } else {
        rootPages.push(pageWithChildren);
      }
    });

    return rootPages;
  };

  const treePages = buildTree(pages);

  const handleCreatePage = async () => {
    if (!newPageName.trim() || !newPagePath.trim()) {
      return;
    }

    try {
      await onPageCreate({
        name: newPageName,
        path: newPagePath,
        parent_id: selectedParentId
      });
      setIsCreateDialogOpen(false);
      setNewPageName('');
      setNewPagePath('');
      setSelectedParentId(null);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleRenamePage = async () => {
    if (!editingPage || !newPageName.trim()) {
      return;
    }

    try {
      await onPageUpdate(editingPage.id, { name: newPageName });
      setIsRenameDialogOpen(false);
      setEditingPage(null);
      setNewPageName('');
    } catch (error) {
      console.error('Failed to rename page:', error);
    }
  };

  const handleDeletePage = async (pageId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту страницу?')) {
      try {
        await onPageDelete(pageId);
      } catch (error) {
        console.error('Failed to delete page:', error);
      }
    }
  };

  const handleDuplicatePage = async (pageId: number) => {
    try {
      await onPageDuplicate(pageId);
    } catch (error) {
      console.error('Failed to duplicate page:', error);
    }
  };

  const toggleExpand = (pageId: number) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const renderPageItem = (page: Page, level: number = 0) => {
    const hasChildren = page.children && page.children.length > 0;
    const isExpanded = expandedPages.has(page.id);
    const isSelected = currentPageId === page.id;

    return (
      <div key={page.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                isSelected ? 'bg-primary/10 border border-primary' : ''
              }`}
              style={{ paddingLeft: `${level * 20 + 8}px` }}
              onClick={() => onPageSelect(page.id)}
            >
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(page.id);
                  }}
                >
                  <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} size={14} />
                </Button>
              ) : (
                <div className="w-6" />
              )}
              <Icon name="File" size={16} className="text-muted-foreground" />
              <span className="flex-1 text-sm">{page.name}</span>
              {page.is_home && (
                <Badge variant="secondary" className="text-xs">Главная</Badge>
              )}
              <span className="text-xs text-muted-foreground">{page.path}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => {
              setEditingPage(page);
              setNewPageName(page.name);
              setIsRenameDialogOpen(true);
            }}>
              <Icon name="Edit" size={14} className="mr-2" />
              Переименовать
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleDuplicatePage(page.id)}>
              <Icon name="Copy" size={14} className="mr-2" />
              Дублировать
            </ContextMenuItem>
            <ContextMenuItem onClick={() => {
              setSelectedParentId(page.id);
              setIsCreateDialogOpen(true);
            }}>
              <Icon name="Plus" size={14} className="mr-2" />
              Создать подстраницу
            </ContextMenuItem>
            {!page.is_home && (
              <ContextMenuItem
                onClick={() => handleDeletePage(page.id)}
                className="text-destructive"
              >
                <Icon name="Trash" size={14} className="mr-2" />
                Удалить
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
        {hasChildren && isExpanded && (
          <div>
            {page.children!.map(child => renderPageItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getAllPagesFlat = (pagesList: Page[]): Page[] => {
    const result: Page[] = [];
    pagesList.forEach(page => {
      result.push(page);
      if (page.children) {
        result.push(...getAllPagesFlat(page.children));
      }
    });
    return result;
  };

  const allPagesFlat = getAllPagesFlat(treePages);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Страницы</h3>
          <Button
            size="sm"
            onClick={() => {
              setSelectedParentId(null);
              setIsCreateDialogOpen(true);
            }}
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Создать страницу
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-1">
            {treePages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Нет страниц</p>
                <p className="text-xs mt-2">Создайте первую страницу</p>
              </div>
            ) : (
              treePages.map(page => renderPageItem(page))
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать страницу</DialogTitle>
            <DialogDescription>
              Создайте новую страницу для вашего сайта
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название страницы</Label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="О нас"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Путь (URL)</Label>
              <Input
                value={newPagePath}
                onChange={(e) => setNewPagePath(e.target.value)}
                placeholder="/about"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Путь должен начинаться с / (например: /about, /contacts)
              </p>
            </div>
            {allPagesFlat.length > 0 && (
              <div>
                <Label>Родительская страница (опционально)</Label>
                <select
                  value={selectedParentId || ''}
                  onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full mt-2 p-2 border rounded"
                >
                  <option value="">Нет (корневая страница)</option>
                  {allPagesFlat.map(page => (
                    <option key={page.id} value={page.id}>
                      {page.name} ({page.path})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreatePage} disabled={!newPageName.trim() || !newPagePath.trim()}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать страницу</DialogTitle>
            <DialogDescription>
              Введите новое название для страницы
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название страницы</Label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Новое название"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleRenamePage} disabled={!newPageName.trim()}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

