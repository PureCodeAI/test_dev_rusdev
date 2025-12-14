import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VersionComparison } from './VersionComparison';
import { formatVersionDate, generateVersionTag, sortVersionsByDate } from '@/utils/historyUtils';

export interface ProjectVersion {
  id: number;
  version: string;
  description?: string;
  author?: string;
  authorId?: number;
  createdAt: string;
  isPublished: boolean;
  data?: Record<string, unknown>;
  tag?: string;
}

interface VersionManagerProps {
  projectId: number;
  currentVersion?: string;
  onVersionSelect?: (version: ProjectVersion) => void;
  onRollback?: (version: ProjectVersion) => Promise<void>;
  onSaveVersion?: (version: string, description: string, tag?: string) => Promise<void>;
}

export const VersionManager = ({
  projectId,
  currentVersion,
  onVersionSelect,
  onRollback,
  onSaveVersion
}: VersionManagerProps) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);
  const [isSaveVersionDialogOpen, setIsSaveVersionDialogOpen] = useState(false);
  const [newVersionTag, setNewVersionTag] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/versions`);
      if (response.ok) {
        const data = await response.json();
        const sortedVersions = sortVersionsByDate(data.versions || []);
        setVersions(sortedVersions);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRollback = async (version: ProjectVersion) => {
    if (!onRollback) return;
    
    setIsRollbackDialogOpen(true);
    setSelectedVersion(version);
  };

  const confirmRollback = async () => {
    if (!selectedVersion || !onRollback) return;

    try {
      setIsRollingBack(true);
      await onRollback(selectedVersion);
      setIsRollbackDialogOpen(false);
      setSelectedVersion(null);
      await loadVersions();
    } catch (error) {
      console.error('Failed to rollback:', error);
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!onSaveVersion) return;

    try {
      const versionTag = newVersionTag || generateVersionTag(versions);
      await onSaveVersion(versionTag, newVersionDescription, newVersionTag);
      setIsSaveVersionDialogOpen(false);
      setNewVersionTag('');
      setNewVersionDescription('');
      await loadVersions();
    } catch (error) {
      console.error('Failed to save version:', error);
    }
  };

  const getVersionColor = (version: ProjectVersion) => {
    if (version.isPublished) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (version.tag?.startsWith('v')) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Версии проекта</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
          >
            <Icon name={showComparison ? "X" : "GitCompare"} size={14} className="mr-1" />
            {showComparison ? 'Скрыть сравнение' : 'Сравнить версии'}
          </Button>
          {onSaveVersion && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSaveVersionDialogOpen(true)}
            >
              <Icon name="Tag" size={14} className="mr-1" />
              Сохранить версию
            </Button>
          )}
        </div>
      </div>

      {showComparison && (
        <Card className="p-4">
          <VersionComparison
            versions={versions}
            currentVersion={currentVersion}
            onClose={() => setShowComparison(false)}
          />
        </Card>
      )}

      {!showComparison && (
        <>
          {isLoading ? (
            <Card className="p-4">
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
              </div>
            </Card>
          ) : versions.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4">
                {versions.map((version) => (
                  <Card
                    key={version.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      version.version === currentVersion ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onVersionSelect && onVersionSelect(version)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getVersionColor(version)}>
                            {version.tag || version.version}
                          </Badge>
                          {version.isPublished && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              Опубликовано
                            </Badge>
                          )}
                          {version.version === currentVersion && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                              Текущая
                            </Badge>
                          )}
                        </div>
                        {version.description && (
                          <p className="text-sm text-muted-foreground mb-2">{version.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {version.author && (
                            <div className="flex items-center gap-1">
                              <Icon name="User" size={12} />
                              <span>{version.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            <span>{formatVersionDate(version.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {onVersionSelect && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVersion(version);
                              setIsPreviewDialogOpen(true);
                            }}
                          >
                            <Icon name="Eye" size={14} className="mr-1" />
                            Предпросмотр
                          </Button>
                        )}
                        {onRollback && version.version !== currentVersion && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickRollback(version);
                            }}
                          >
                            <Icon name="RotateCcw" size={14} className="mr-1" />
                            Откатить
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card className="p-4">
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="FileText" size={24} className="mx-auto mb-2" />
                <p>Версии не найдены</p>
                <p className="text-xs mt-1">Сохраните первую версию проекта</p>
              </div>
            </Card>
          )}
        </>
      )}

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Предпросмотр версии</DialogTitle>
            <DialogDescription>
              Просмотр данных версии {selectedVersion?.tag || selectedVersion?.version}
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Версия</Label>
                  <p className="font-semibold">{selectedVersion.tag || selectedVersion.version}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Дата создания</Label>
                  <p className="font-semibold">{formatVersionDate(selectedVersion.createdAt)}</p>
                </div>
                {selectedVersion.author && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Автор</Label>
                    <p className="font-semibold">{selectedVersion.author}</p>
                  </div>
                )}
                {selectedVersion.description && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Описание</Label>
                    <p className="font-semibold">{selectedVersion.description}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Данные версии</Label>
                <ScrollArea className="h-[300px] border rounded p-4">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(selectedVersion.data || {}, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Закрыть
            </Button>
            {onRollback && selectedVersion && selectedVersion.version !== currentVersion && (
              <Button onClick={() => {
                setIsPreviewDialogOpen(false);
                handleQuickRollback(selectedVersion);
              }}>
                <Icon name="RotateCcw" size={14} className="mr-1" />
                Откатить к этой версии
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение отката</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите откатить проект к версии {selectedVersion?.tag || selectedVersion?.version}?
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <Alert variant="destructive">
              <Icon name="AlertTriangle" size={16} />
              <AlertTitle>Внимание!</AlertTitle>
              <AlertDescription>
                Все текущие изменения будут потеряны. Эта операция необратима.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRollbackDialogOpen(false);
                setSelectedVersion(null);
              }}
              disabled={isRollingBack}
            >
              Отмена
            </Button>
            <Button
              onClick={confirmRollback}
              disabled={isRollingBack}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRollingBack ? (
                <>
                  <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                  Откат...
                </>
              ) : (
                <>
                  <Icon name="RotateCcw" size={14} className="mr-1" />
                  Подтвердить откат
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveVersionDialogOpen} onOpenChange={setIsSaveVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить версию</DialogTitle>
            <DialogDescription>
              Создать новую версию проекта с тегом и описанием
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Тег версии</Label>
              <Input
                value={newVersionTag}
                onChange={(e) => setNewVersionTag(e.target.value)}
                placeholder="v1.0.0"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Например: v1.0.0, v1.1.0, release-2024-01-01
              </p>
            </div>
            <div>
              <Label>Описание изменений</Label>
              <Textarea
                value={newVersionDescription}
                onChange={(e) => setNewVersionDescription(e.target.value)}
                placeholder="Описание изменений в этой версии..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSaveVersionDialogOpen(false);
                setNewVersionTag('');
                setNewVersionDescription('');
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveVersion}
              disabled={!newVersionDescription.trim()}
            >
              <Icon name="Save" size={14} className="mr-1" />
              Сохранить версию
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

