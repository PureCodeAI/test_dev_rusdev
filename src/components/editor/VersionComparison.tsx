import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ProjectVersion } from './VersionManager';

interface VersionComparisonProps {
  versions: ProjectVersion[];
  currentVersion?: string;
  onClose?: () => void;
}

interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export const VersionComparison = ({
  versions,
  currentVersion,
  onClose
}: VersionComparisonProps) => {
  const [version1, setVersion1] = useState<ProjectVersion | null>(null);
  const [version2, setVersion2] = useState<ProjectVersion | null>(null);
  const [diff, setDiff] = useState<DiffResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (versions.length > 0) {
      const current = versions.find(v => v.version === currentVersion) || versions[0];
      const previous = versions.length > 1 ? versions[1] : versions[0];
      setVersion1(current);
      setVersion2(previous);
    }
  }, [versions, currentVersion]);

  useEffect(() => {
    if (version1 && version2) {
      compareVersions();
    }
  }, [version1, version2]);

  const compareVersions = () => {
    if (!version1 || !version2) return;

    setIsComparing(true);
    const differences: DiffResult[] = [];

    const data1 = version1.data || {};
    const data2 = version2.data || {};

    const compareObjects = (obj1: Record<string, unknown>, obj2: Record<string, unknown>, path = '') => {
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

      allKeys.forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (!(key in obj1)) {
          differences.push({
            type: 'added',
            path: currentPath,
            newValue: val2
          });
        } else if (!(key in obj2)) {
          differences.push({
            type: 'removed',
            path: currentPath,
            oldValue: val1
          });
        } else if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null && !Array.isArray(val1) && !Array.isArray(val2)) {
          compareObjects(val1 as Record<string, unknown>, val2 as Record<string, unknown>, currentPath);
        } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          differences.push({
            type: 'modified',
            path: currentPath,
            oldValue: val1,
            newValue: val2
          });
        } else {
          differences.push({
            type: 'unchanged',
            path: currentPath,
            oldValue: val1,
            newValue: val2
          });
        }
      });
    };

    compareObjects(data1, data2);
    setDiff(differences);
    setIsComparing(false);
  };

  const getDiffColor = (type: DiffResult['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'removed':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'modified':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDiffIcon = (type: DiffResult['type']) => {
    switch (type) {
      case 'added':
        return 'Plus';
      case 'removed':
        return 'Minus';
      case 'modified':
        return 'Edit';
      default:
        return 'Check';
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const filteredDiff = diff.filter(d => d.type !== 'unchanged');
  const stats = {
    added: diff.filter(d => d.type === 'added').length,
    removed: diff.filter(d => d.type === 'removed').length,
    modified: diff.filter(d => d.type === 'modified').length,
    unchanged: diff.filter(d => d.type === 'unchanged').length
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Сравнение версий</h3>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            <Icon name="X" size={14} className="mr-1" />
            Закрыть
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Версия 1 (Текущая)</Label>
          <Select
            value={version1?.id.toString()}
            onValueChange={(value) => {
              const v = versions.find(v => v.id.toString() === value);
              if (v) setVersion1(v);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {versions.map(v => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.tag || v.version} {v.version === currentVersion && '(Текущая)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Версия 2 (Сравниваемая)</Label>
          <Select
            value={version2?.id.toString()}
            onValueChange={(value) => {
              const v = versions.find(v => v.id.toString() === value);
              if (v) setVersion2(v);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {versions.map(v => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.tag || v.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {version1 && version2 && (
        <div className="grid grid-cols-4 gap-2">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.added}</div>
              <div className="text-xs text-muted-foreground">Добавлено</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
              <div className="text-xs text-muted-foreground">Удалено</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.modified}</div>
              <div className="text-xs text-muted-foreground">Изменено</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.unchanged}</div>
              <div className="text-xs text-muted-foreground">Без изменений</div>
            </div>
          </Card>
        </div>
      )}

      {isComparing ? (
        <Card className="p-4">
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        </Card>
      ) : filteredDiff.length > 0 ? (
        <Card className="p-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredDiff.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${getDiffColor(item.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon name={getDiffIcon(item.type) as any} size={16} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="font-mono text-xs font-semibold mb-1">{item.path}</div>
                      {item.type === 'added' && (
                        <div className="text-xs">
                          <div className="font-semibold mb-1">Новое значение:</div>
                          <pre className="bg-background/50 p-2 rounded text-xs overflow-x-auto">
                            {formatValue(item.newValue)}
                          </pre>
                        </div>
                      )}
                      {item.type === 'removed' && (
                        <div className="text-xs">
                          <div className="font-semibold mb-1">Удаленное значение:</div>
                          <pre className="bg-background/50 p-2 rounded text-xs overflow-x-auto">
                            {formatValue(item.oldValue)}
                          </pre>
                        </div>
                      )}
                      {item.type === 'modified' && (
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="font-semibold mb-1 text-red-600">Старое значение:</div>
                            <pre className="bg-background/50 p-2 rounded text-xs overflow-x-auto">
                              {formatValue(item.oldValue)}
                            </pre>
                          </div>
                          <div>
                            <div className="font-semibold mb-1 text-green-600">Новое значение:</div>
                            <pre className="bg-background/50 p-2 rounded text-xs overflow-x-auto">
                              {formatValue(item.newValue)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="CheckCircle" size={24} className="mx-auto mb-2" />
            <p>Версии идентичны</p>
            <p className="text-xs mt-1">Нет различий между выбранными версиями</p>
          </div>
        </Card>
      )}
    </div>
  );
};


