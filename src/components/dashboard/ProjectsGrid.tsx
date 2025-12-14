import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Project } from '@/types/project';

interface ProjectsGridProps {
  projects: Project[];
  loading: boolean;
  creatingProject: boolean;
  onCreateProject: (type: 'site' | 'bot') => void;
  onOpenProject: (type: string, id: number) => void;
  onDuplicateProject?: (id: number) => void;
  onArchiveProject?: (id: number) => void;
  onDeleteProject?: (id: number) => void;
  onRenameProject?: (id: number, newName: string) => void;
}

type SortOption = 'name' | 'created' | 'updated';
type FilterOption = 'all' | 'site' | 'bot';

const getProjectIcon = (type: string) => {
  return type === 'site' ? 'Globe' : 'Bot';
};

const getProjectStatusText = (status: string) => {
  switch (status) {
    case 'preview': return 'Предпросмотр';
    case 'published': return 'Опубликован';
    case 'draft': return 'Черновик';
    case 'archived': return 'Архив';
    default: return status;
  }
};

const getProjectStatusColor = (status: string) => {
  switch (status) {
    case 'preview': return 'bg-blue-100 text-blue-800';
    case 'published': return 'bg-green-100 text-green-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'archived': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ProjectsGrid = ({
  projects,
  loading,
  creatingProject,
  onCreateProject,
  onOpenProject,
  onDuplicateProject,
  onArchiveProject,
  onDeleteProject,
  onRenameProject,
}: ProjectsGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{ id: number; name: string } | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ru');
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return sorted;
  }, [projects, filterType, searchQuery, sortBy]);

  const handleDeleteClick = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete && onDeleteProject) {
      onDeleteProject(projectToDelete);
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleRenameClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToRename({ id: project.id, name: project.name });
    setNewProjectName(project.name);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = () => {
    if (projectToRename && newProjectName.trim() && onRenameProject) {
      onRenameProject(projectToRename.id, newProjectName.trim());
    }
    setRenameDialogOpen(false);
    setProjectToRename(null);
    setNewProjectName('');
  };

  const handleDuplicateClick = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (onDuplicateProject) {
      onDuplicateProject(projectId);
    }
  };

  const handleArchiveClick = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (onArchiveProject) {
      onArchiveProject(projectId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Мои проекты</CardTitle>
              <CardDescription>Управляйте своими проектами</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onCreateProject('site')} disabled={creatingProject}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать сайт
              </Button>
              <Button variant="outline" onClick={() => onCreateProject('bot')} disabled={creatingProject}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать бота
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length > 0 && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Поиск по названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterOption)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Тип проекта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все проекты</SelectItem>
                    <SelectItem value="site">Сайты</SelectItem>
                    <SelectItem value="bot">Боты</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">По дате обновления</SelectItem>
                    <SelectItem value="created">По дате создания</SelectItem>
                    <SelectItem value="name">По названию</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filteredAndSortedProjects.length !== projects.length && (
                <div className="text-sm text-muted-foreground">
                  Найдено проектов: {filteredAndSortedProjects.length} из {projects.length}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Loader2" size={32} className="mx-auto mb-2 animate-spin" />
              Загрузка проектов...
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Icon name="FolderOpen" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterType !== 'all' ? 'Проекты не найдены' : 'Нет проектов'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterType !== 'all' 
                  ? 'Попробуйте изменить параметры поиска или фильтрации'
                  : 'Создайте свой первый проект, чтобы начать работу'}
              </p>
              {(!searchQuery && filterType === 'all') && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => onCreateProject('site')} disabled={creatingProject}>
                    <Icon name="Globe" size={16} className="mr-2" />
                    Создать сайт
                  </Button>
                  <Button variant="outline" onClick={() => onCreateProject('bot')} disabled={creatingProject}>
                    <Icon name="Bot" size={16} className="mr-2" />
                    Создать бота
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:border-primary/50 relative"
                  onClick={() => onOpenProject(project.type, project.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        project.type === 'site' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        <Icon name={getProjectIcon(project.type) as string} size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getProjectStatusColor(project.status)}>
                          {getProjectStatusText(project.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Icon name="MoreVertical" size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => onOpenProject(project.type, project.id)}>
                              <Icon name="Edit" size={16} className="mr-2" />
                              Открыть
                            </DropdownMenuItem>
                            {onRenameProject && (
                              <DropdownMenuItem onClick={(e) => handleRenameClick(e, project)}>
                                <Icon name="Pencil" size={16} className="mr-2" />
                                Переименовать
                              </DropdownMenuItem>
                            )}
                            {onDuplicateProject && (
                              <DropdownMenuItem onClick={(e) => handleDuplicateClick(e, project.id)}>
                                <Icon name="Copy" size={16} className="mr-2" />
                                Дублировать
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onArchiveProject && project.status !== 'archived' && (
                              <DropdownMenuItem onClick={(e) => handleArchiveClick(e, project.id)}>
                                <Icon name="Archive" size={16} className="mr-2" />
                                Архивировать
                              </DropdownMenuItem>
                            )}
                            {onDeleteProject && (
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteClick(e, project.id)}
                                className="text-destructive"
                              >
                                <Icon name="Trash2" size={16} className="mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Clock" size={14} />
                      <span>Обновлен {new Date(project.updated_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {project.preview_url && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Eye" size={12} />
                        <span>Предпросмотр доступен</span>
                      </div>
                    )}
                    {project.published_url && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Globe" size={12} />
                        <span>Опубликован</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить проект?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Проект будет удален навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать проект</DialogTitle>
            <DialogDescription>
              Введите новое название для проекта
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Название проекта"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameConfirm();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!newProjectName.trim()}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
