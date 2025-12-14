import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { GridSettings } from './GridSettings';
import { BreakpointSelector } from './BreakpointSelector';

interface EditorHeaderProps {
  currentBreakpoint: 'desktop-1920' | 'desktop-1440' | 'desktop-1280' | 'tablet-1024' | 'tablet-768' | 'mobile-480' | 'mobile-375' | 'custom';
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  onBreakpointChange: (breakpoint: 'desktop-1920' | 'desktop-1440' | 'desktop-1280' | 'tablet-1024' | 'tablet-768' | 'mobile-480' | 'mobile-375' | 'custom') => void;
  onResizeViewport: (width: number) => void;
  onGridEnabledChange: (enabled: boolean) => void;
  onGridSizeChange: (size: number) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onSnapToObjectsChange: (snap: boolean) => void;
  onBack?: () => void;
  onImportExport?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  onMonitoring?: () => void;
  onVersions?: () => void;
  onHelp?: () => void;
  autoSaveEnabled?: boolean;
  autoSaveStatus?: 'saving' | 'saved' | 'unsaved';
  lastSaveTime?: Date | null;
  onAutoSaveToggle?: (enabled: boolean) => void;
}

export const EditorHeader = ({
  currentBreakpoint,
  gridEnabled,
  gridSize,
  snapToGrid,
  snapToObjects,
  onBreakpointChange,
  onResizeViewport,
  onGridEnabledChange,
  onGridSizeChange,
  onSnapToGridChange,
  onSnapToObjectsChange,
  onBack,
  onImportExport,
  onPreview,
  onPublish,
  onMonitoring,
  onVersions,
  onHelp,
  autoSaveEnabled = true,
  autoSaveStatus = 'saved',
  lastSaveTime,
  onAutoSaveToggle
}: EditorHeaderProps) => {
  const formatTime = (date: Date | null | undefined) => {
    if (!date) return '';
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getAutoSaveBadge = () => {
    if (!autoSaveEnabled) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <Icon name="SaveOff" size={12} className="mr-1" />
          Автосохранение выключено
        </Badge>
      );
    }
    
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
            Сохранение...
          </Badge>
        );
      case 'unsaved':
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            <Icon name="AlertCircle" size={12} className="mr-1" />
            Не сохранено
          </Badge>
        );
      default:
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 cursor-help">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  Сохранено {lastSaveTime ? formatTime(lastSaveTime) : ''}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Последнее сохранение: {lastSaveTime ? formatTime(lastSaveTime) : 'никогда'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  return (
    <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {getAutoSaveBadge()}
        {onAutoSaveToggle && (
          <Button
            variant="ghost"
            onClick={() => onAutoSaveToggle(!autoSaveEnabled)}
            className="h-7"
          >
            <Icon name={autoSaveEnabled ? "Save" : "SaveOff"} size={14} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <BreakpointSelector
          currentBreakpoint={currentBreakpoint}
          onBreakpointChange={onBreakpointChange}
          onResizeViewport={onResizeViewport}
        />

        <div className="h-8 w-px bg-border" />

        <GridSettings
          enabled={gridEnabled}
          size={gridSize}
          snapToGrid={snapToGrid}
          snapToObjects={snapToObjects}
          onEnabledChange={onGridEnabledChange}
          onSizeChange={onGridSizeChange}
          onSnapToGridChange={onSnapToGridChange}
          onSnapToObjectsChange={onSnapToObjectsChange}
        />
        {onImportExport && (
          <Button variant="outline" size="sm" onClick={onImportExport}>
            <Icon name="Download" size={16} className="mr-2" />
            Импорт/Экспорт
          </Button>
        )}
        {onPreview && (
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Icon name="Eye" size={16} className="mr-2" />
            Предпросмотр
          </Button>
        )}
        {onMonitoring && (
          <Button variant="outline" size="sm" onClick={onMonitoring}>
            <Icon name="Activity" size={16} className="mr-2" />
            Мониторинг
          </Button>
        )}
        {onVersions && (
          <Button variant="outline" size="sm" onClick={onVersions}>
            <Icon name="GitBranch" size={16} className="mr-2" />
            Версии
          </Button>
        )}
        {onPublish && (
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700" onClick={onPublish}>
            <Icon name="Rocket" size={16} className="mr-2" />
            Публиковать
          </Button>
        )}

        {onHelp && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onHelp}>
                  <Icon name="HelpCircle" size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Помощь и обучение</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};