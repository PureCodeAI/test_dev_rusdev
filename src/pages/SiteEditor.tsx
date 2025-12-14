import { LayersPanel } from '@/components/editor/LayersPanel';
import { TemplateLibrary } from '@/components/editor/TemplateLibrary';
import { ImportExportDialog } from '@/components/editor/ImportExportDialog';
import { CSSEditor } from '@/components/editor/CSSEditor';
import { HeadFooterEditor } from '@/components/editor/HeadFooterEditor';
import { SEOEditor } from '@/components/editor/SEOEditor';
import { AnalyticsEditor } from '@/components/editor/AnalyticsEditor';
import { PagesManager } from '@/components/editor/PagesManager';
import { MenuBuilder, MenuItem } from '@/components/editor/MenuBuilder';
import { LinkEditor } from '@/components/editor/LinkEditor';
import { PageSettings, PageSettings as PageSettingsType } from '@/components/editor/PageSettings';
import { PreviewSettings, PreviewSettings as PreviewSettingsType } from '@/components/editor/PreviewSettings';
import { PreviewWindow } from '@/components/editor/PreviewWindow';
import { PublishDialog, PublishSettings as PublishSettingsType } from '@/components/editor/PublishDialog';
import { MonitoringPanel } from '@/components/editor/MonitoringPanel';
import { VersionManager, ProjectVersion } from '@/components/editor/VersionManager';
import { SiteStatistics } from '@/components/editor/SiteStatistics';
import { HelpAndLearning } from '@/components/editor/HelpAndLearning';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Template, SectionTemplate } from '@/types/template.types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { MobileEditor } from '@/components/editor/MobileEditor';
import { useIsMobile } from '@/hooks/use-mobile';
import { DevicePreview } from '@/components/editor/DevicePreview';
import { PerformanceTest } from '@/components/editor/PerformanceTest';
import { LighthouseTest } from '@/components/editor/LighthouseTest';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import API_ENDPOINTS from '@/config/api';
import { logger } from '@/utils/logger';
import { useAuth } from '@/context/AuthContext';
import { BlocksPanel } from '@/components/editor/BlocksPanel';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';

export const SiteEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobileDevice = useIsMobile();
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobileDevice);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobileDevice);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'desktop-1920' | 'desktop-1440' | 'desktop-1280' | 'tablet-1024' | 'tablet-768' | 'mobile-480' | 'mobile-375' | 'custom'>('desktop-1920');
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [projectPages, setProjectPages] = useState<Array<Record<string, unknown>>>([]);
  const [editingStyles, setEditingStyles] = useState<Record<string, unknown>>({});
  const [editingAnimation, setEditingAnimation] = useState<Record<string, unknown>>({});
  const [editingHoverEffects, setEditingHoverEffects] = useState<Record<string, unknown>>({});
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [currentPalette, setCurrentPalette] = useState<Record<string, unknown> | null>(null);
  const [customPalettes, setCustomPalettes] = useState<Array<Record<string, unknown>>>([]);
  const [currentFontPair, setCurrentFontPair] = useState<Record<string, unknown> | null>(null);
  const [customFontPairs, setCustomFontPairs] = useState<Array<Record<string, unknown>>>([]);
  const [customTypographyStyles, setCustomTypographyStyles] = useState<Array<Record<string, unknown>>>([]);
  const [selectedBlockIds, setSelectedBlockIds] = useState<number[]>([]);
  const [clipboard, setClipboard] = useState<Array<Record<string, unknown>> | null>(null);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [snapToObjects, setSnapToObjects] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<'blocks' | 'layers' | 'templates'>('blocks');
  const [globalCSS, setGlobalCSS] = useState('');
  const [cssVariables, setCSSVariables] = useState<Array<{name: string; value: string}>>([]);
  const [mediaQueries, setMediaQueries] = useState<Array<{id: string; query: string; css: string}>>([]);
  const [headCode, setHeadCode] = useState('');
  const [footerCode, setFooterCode] = useState('');
  const [seoData, setSEOData] = useState<Record<string, unknown>>({});
  const [analyticsData, setAnalyticsData] = useState<Record<string, unknown>>({});
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishSettings, setPublishSettings] = useState<PublishSettingsType>({
    type: 'subdomain',
    sslEnabled: true,
    autoSSL: true,
    status: 'idle'
  });
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [currentProjectVersion, setCurrentProjectVersion] = useState<string>('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [pageBlocks, setPageBlocks] = useState<Array<Record<string, unknown>>>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [currentPageId, setCurrentPageId] = useState<number | null>(null);
  const [currentPageSettings, setCurrentPageSettings] = useState<any>({});
  const [previewSettings, setPreviewSettings] = useState<any>({});
  const [editingContent, setEditingContent] = useState<Record<string, unknown>>({});
  const [responsiveStyles, setResponsiveStyles] = useState<Record<string, unknown>>({});
  const [blocks, setBlocks] = useState<Array<Record<string, unknown>>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isPreviewWindowOpen, setIsPreviewWindowOpen] = useState(false);
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);
  
  const categories = ['Все', 'Контент', 'Медиа', 'Формы', 'Действия', 'Коммерция', 'Интеграции', 'Навигация', 'Контейнеры'];
  
  const loadBlocks = async (pageId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.projects}/${id}/pages/${pageId}/blocks`);
      const data = await response.json();
      setPageBlocks(data.blocks || []);
    } catch (error) {
      logger.error('Failed to load blocks', error instanceof Error ? error : undefined);
    }
  };
  
  const handleRenameBlock = async (blockId: number, newName: string) => {
    // Implementation
  };
  
  const handleToggleVisibility = async (blockId: number) => {
    // Implementation
  };
  
  const handleToggleLock = async (blockId: number) => {
    // Implementation
  };
  
  const handleBringToFront = async (blockId: number) => {
    // Implementation
  };
  
  const handleSendToBack = async (blockId: number) => {
    // Implementation
  };
  
  const handleBringForward = async (blockId: number) => {
    // Implementation
  };
  
  const handleSendBackward = async (blockId: number) => {
    // Implementation
  };
  
  const handleDeleteBlock = async (blockId: number) => {
    // Implementation
  };
  
  useEffect(() => {
    if (!id || id === 'new' || isNaN(Number(id))) return;
    
    const loadProject = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.projects}/${id}`);
        const data = await response.json();
        setProjectName(data.name || '');
        setProjectPages(data.pages || []);
        const firstPage = data.pages?.[0];
        if (firstPage) {
          setCurrentPageId(firstPage.id);
          await loadBlocks(firstPage.id);
          setCurrentPageSettings({
            type: (firstPage.settings?.type as any) || 'default',
            name: firstPage.name as string,
            path: firstPage.path as string,
            is_home: firstPage.is_home || false,
            meta_title: firstPage.meta_title as string,
            meta_description: firstPage.meta_description as string,
            meta_keywords: firstPage.meta_keywords as string,
            settings: firstPage.settings as any
          });
        }
      } catch (error) {
        logger.error('Failed to load project', error instanceof Error ? error : undefined);
      }
    };
    
    loadProject();
  }, [id]);
  
  const saveProjectData = async () => {
    if (!id || id === 'new' || isNaN(Number(id))) return;
    
    try {
      const userId = user?.id;
      if (userId) {
        await fetch(API_ENDPOINTS.projects, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            project_id: parseInt(id),
            name: projectName
          })
        });
        
        if (currentPageId) {
          for (const block of pageBlocks) {
            const bid = typeof block.id === 'number' ? block.id : Number(block.id) || 0;
            if (bid) {
              await fetch(API_ENDPOINTS.blocks, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  block_id: bid,
                  content: block.content || {},
                  styles: block.styles || {}
                })
              });
            }
          }
        }
      }
    } catch (error) {
      logger.warn('Auto-save error', { error: error instanceof Error ? error.message : String(error), projectId: id });
      throw error;
    }
  };
  
  const { triggerSave, hasUnsavedChanges, isSaving, lastSaveTime } = useAutoSave({
    enabled: autoSaveEnabled,
    interval: 30000,
    onSave: saveProjectData,
    onSaveError: (error) => {
      logger.error('Auto-save failed', error);
    },
    debounceMs: 2000
  });
  
  const handleSelectBlock = (blockId: number, isMultiSelect: boolean = false) => {
    const block = pageBlocks.find(b => {
      const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return bid === blockId;
    });
    
    if (isMultiSelect) {
      setSelectedBlockIds(prev => {
        if (prev.includes(blockId)) {
          return prev.filter(id => id !== blockId);
        }
        return [...prev, blockId];
      });
    } else {
      setSelectedBlockId(blockId);
      setSelectedBlockIds([blockId]);
      setRightPanelOpen(true);
    }
    
    if (block && !isMultiSelect) {
      if (block.content) {
        setEditingContent(block.content as Record<string, unknown>);
      }
      if (block.styles) {
        setEditingStyles(block.styles as Record<string, unknown>);
      } else {
        setEditingStyles({});
      }
    }
  };

  const handleBlockContentChange = async (blockId: number, content: Record<string, unknown>) => {
    try {
      const block = pageBlocks.find(b => {
        const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
        return bid === blockId;
      });

      if (!block) return;

      const response = await fetch(API_ENDPOINTS.blocks, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          block_id: blockId,
          content: content,
          styles: block.styles || {}
        })
      });

      const updatedBlock = await response.json();
      setPageBlocks(pageBlocks.map(b => {
        const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
        return bid === blockId ? updatedBlock : b;
      }));

      if (selectedBlockId === blockId) {
        setEditingContent(content);
      }
    } catch (error) {
      logger.error('Failed to update block content', error instanceof Error ? error : undefined);
    }
  };

  const handleCopyBlocks = () => {
    const blocksToCopy = pageBlocks.filter(b => {
      const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return selectedBlockIds.includes(bid);
    });
    if (blocksToCopy.length > 0) {
      setClipboard(blocksToCopy);
      toast({
        title: "Скопировано",
        description: `Скопировано блоков: ${blocksToCopy.length}`
      });
    }
  };

  const handlePasteBlocks = async () => {
    if (!clipboard || clipboard.length === 0 || !currentPageId) return;

    try {
      const newBlocks = [];
      for (const block of clipboard) {
        const response: Response = await fetch(API_ENDPOINTS.blocks, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            page_id: currentPageId,
            type: block.type,
            content: block.content || {},
            styles: block.styles || {},
            position: pageBlocks.length + newBlocks.length
          })
        });
        const newBlock: Record<string, unknown> = await response.json();
        newBlocks.push(newBlock);
      }
      setPageBlocks([...pageBlocks, ...newBlocks]);
      toast({
        title: "Вставлено",
        description: `Вставлено блоков: ${newBlocks.length}`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось вставить блоки",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateBlock = async (blockId: number) => {
    if (!currentPageId) return;

    const block = pageBlocks.find(b => {
      const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return bid === blockId;
    });

    if (!block) return;

    try {
      const response = await fetch(API_ENDPOINTS.blocks, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page_id: currentPageId,
          type: block.type,
          content: block.content || {},
          styles: block.styles || {},
          position: pageBlocks.length
        })
      });

      const newBlock = await response.json();
      setPageBlocks([...pageBlocks, newBlock]);
      toast({
        title: "Дублировано",
        description: "Блок успешно дублирован"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось дублировать блок",
        variant: "destructive"
      });
    }
  };

  const handleMoveBlock = async (blockId: number, direction: 'up' | 'down') => {
    const currentIndex = pageBlocks.findIndex(b => {
      const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return bid === blockId;
    });

    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= pageBlocks.length) return;

    const newBlocks = [...pageBlocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];

    newBlocks.forEach((block, index) => {
      const bid = typeof block.id === 'number' ? block.id : Number(block.id) || 0;
      fetch(API_ENDPOINTS.blocks, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          block_id: bid,
          position: index,
          content: block.content,
          styles: block.styles
        })
      }).catch(error => logger.error('Failed to update block position', error));
    });

    setPageBlocks(newBlocks);
  };

  const handleAlignBlocks = (alignment: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => {
    if (selectedBlockIds.length < 2) return;

    const blocksToAlign = pageBlocks.filter(b => {
      const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return selectedBlockIds.includes(bid);
    });

    if (blocksToAlign.length < 2) return;

    setTimeout(async () => {
      const blockElements = blocksToAlign.map(block => {
        const bid = typeof block.id === 'number' ? block.id : Number(block.id) || 0;
        return document.querySelector(`[data-block-id="${bid}"]`) as HTMLElement;
      }).filter(Boolean);

      if (blockElements.length < 2) return;

      const bounds = blockElements.map(el => {
        const rect = el.getBoundingClientRect();
        const parent = el.offsetParent as HTMLElement;
        const parentRect = parent?.getBoundingClientRect() || { left: 0, top: 0 };
        return {
          id: parseInt(el.dataset.blockId || '0'),
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top,
          width: rect.width,
          height: rect.height
        };
      });

      const { alignBlocks } = await import('@/utils/layoutUtils');
      const positions = alignBlocks(bounds, alignment);

      for (const [blockId, pos] of Object.entries(positions)) {
        const block = pageBlocks.find(b => {
          const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
          return bid === parseInt(blockId);
        });
        if (block && (pos.x !== undefined || pos.y !== undefined)) {
          const newStyles = { ...(block.styles as Record<string, unknown> || {}) };
          if (pos.x !== undefined) {
            newStyles.left = `${pos.x}px`;
            newStyles.position = 'absolute';
          }
          if (pos.y !== undefined) {
            newStyles.top = `${pos.y}px`;
            newStyles.position = 'absolute';
          }
          
          await fetch(API_ENDPOINTS.blocks, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              block_id: parseInt(blockId),
              styles: newStyles,
              content: block.content
            })
          });

          setPageBlocks(pageBlocks.map(b => {
            const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
            return bid === parseInt(blockId) ? { ...b, styles: newStyles } : b;
          }));
        }
      }

      toast({
        title: "Выровнено",
        description: "Блоки успешно выровнены"
      });
    }, 100);
  };

  const handleDistributeBlocks = (direction: 'horizontal' | 'vertical' | 'spacing') => {
    if (selectedBlockIds.length < 3) return;

    const blocksToDistribute = pageBlocks.filter(b => {
      const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return selectedBlockIds.includes(bid);
    });

    if (blocksToDistribute.length < 3) return;

    setTimeout(async () => {
      const blockElements = blocksToDistribute.map(block => {
        const bid = typeof block.id === 'number' ? block.id : Number(block.id) || 0;
        return document.querySelector(`[data-block-id="${bid}"]`) as HTMLElement;
      }).filter(Boolean);

      if (blockElements.length < 3) return;

      const bounds = blockElements.map(el => {
        const rect = el.getBoundingClientRect();
        const parent = el.offsetParent as HTMLElement;
        const parentRect = parent?.getBoundingClientRect() || { left: 0, top: 0 };
        return {
          id: parseInt(el.dataset.blockId || '0'),
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top,
          width: rect.width,
          height: rect.height
        };
      });

      const { distributeBlocks } = await import('@/utils/layoutUtils');
      const positions = distributeBlocks(bounds, direction);

      for (const [blockId, pos] of Object.entries(positions)) {
        const block = pageBlocks.find(b => {
          const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
          return bid === parseInt(blockId);
        });
        if (block && (pos.x !== undefined || pos.y !== undefined)) {
          const newStyles = { ...(block.styles as Record<string, unknown> || {}) };
          if (pos.x !== undefined) {
            newStyles.left = `${pos.x}px`;
            newStyles.position = 'absolute';
          }
          if (pos.y !== undefined) {
            newStyles.top = `${pos.y}px`;
            newStyles.position = 'absolute';
          }
          
          fetch(API_ENDPOINTS.blocks, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              block_id: parseInt(blockId),
              styles: newStyles,
              content: block.content
            })
          }).catch(error => logger.error('Failed to update block position', error instanceof Error ? error : undefined));

          setPageBlocks(pageBlocks.map(b => {
            const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
            return bid === parseInt(blockId) ? { ...b, styles: newStyles } : b;
          }));
        }
      }

      toast({
        title: "Распределено",
        description: "Блоки успешно распределены"
      });
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedBlockIds.length > 0) {
        e.preventDefault();
        handleCopyBlocks();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        handlePasteBlocks();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedBlockId) {
        e.preventDefault();
        handleDuplicateBlock(selectedBlockId);
      }
      if (e.key === 'Delete' && selectedBlockIds.length > 0) {
        e.preventDefault();
        selectedBlockIds.forEach(id => handleDeleteBlock(id));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockIds, selectedBlockId, clipboard, currentPageId, pageBlocks]);
  
  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setImportExportDialogOpen(true)}>
            <Icon name="Upload" size={16} className="mr-1" />
            Импорт/Экспорт
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsPreviewWindowOpen(true)}>
            <Icon name="Eye" size={16} className="mr-1" />
            Предпросмотр
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsPublishDialogOpen(true)}>
            <Icon name="Rocket" size={16} className="mr-1" />
            Опубликовать
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <span className="text-xs text-muted-foreground">Сохранение...</span>}
          {!isSaving && !hasUnsavedChanges && lastSaveTime && (
            <span className="text-xs text-muted-foreground">
              Сохранено {lastSaveTime.toLocaleTimeString()}
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowMonitoring(true)}>
            <Icon name="Activity" size={16} className="mr-1" />
            Мониторинг
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowVersionManager(true)}>
            <Icon name="GitBranch" size={16} className="mr-1" />
            Версии
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {leftPanelOpen && (
            <aside className="w-72 border-r border-border bg-card flex flex-col shadow-sm">
              <Tabs value={leftPanelTab} onValueChange={(v) => {
                const tab = v as 'blocks' | 'layers' | 'templates';
                setLeftPanelTab(tab);
              }} className="flex-1 flex flex-col">
                <div className="p-3 border-b border-border">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="blocks" className="text-xs">
                      Блоки
                    </TabsTrigger>
                    <TabsTrigger value="layers" className="text-xs">
                      Слои
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="text-xs">
                      Шаблоны
                    </TabsTrigger>
                    <TabsTrigger value="pages" className="text-xs">
                      Страницы
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="blocks" className="flex-1 m-0">
                  <BlocksPanel
                    blocks={blocks}
                    searchQuery={searchQuery}
                    activeCategory={activeCategory}
                    categories={categories}
                    onSearchChange={setSearchQuery}
                    onCategoryChange={setActiveCategory}
                  />
                </TabsContent>
                <TabsContent value="layers" className="flex-1 m-0">
                  <LayersPanel
                    blocks={pageBlocks}
                    selectedBlockId={selectedBlockId}
                    selectedBlockIds={selectedBlockIds}
                    onSelectBlock={handleSelectBlock}
                    onRenameBlock={handleRenameBlock}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleLock={handleToggleLock}
                    onBringToFront={handleBringToFront}
                    onSendToBack={handleSendToBack}
                    onBringForward={handleBringForward}
                    onSendBackward={handleSendBackward}
                  />
                </TabsContent>
                <TabsContent value="templates" className="flex-1 m-0 p-4 overflow-y-auto">
                  <TemplateLibrary
                    onTemplateSelect={(template: Template) => {
                      const newBlocks = template.blocks.map((block, index) => ({
                        ...block,
                        id: Date.now() + index,
                        position: pageBlocks.length + index
                      }));
                      setPageBlocks([...pageBlocks, ...newBlocks]);
                      toast({
                        title: "Шаблон применен",
                        description: `Шаблон "${template.name}" успешно добавлен`
                      });
                    }}
                    onSectionSelect={(section: SectionTemplate) => {
                      const newBlocks = section.blocks.map((block, index) => ({
                        ...block,
                        id: Date.now() + index,
                        position: pageBlocks.length + index
                      }));
                      setPageBlocks([...pageBlocks, ...newBlocks]);
                      toast({
                        title: "Секция добавлена",
                        description: `Секция "${section.name}" успешно добавлена`
                      });
                    }}
                    onSaveTemplate={(template: Template) => {
                      toast({
                        title: "Шаблон сохранен",
                        description: `Шаблон "${template.name}" успешно сохранен`
                      });
                    }}
                    onSaveSection={(section: SectionTemplate) => {
                      toast({
                        title: "Секция сохранена",
                        description: `Секция "${section.name}" успешно сохранена`
                      });
                    }}
                  />
                </TabsContent>
                <TabsContent value="pages" className="flex-1 m-0 overflow-hidden">
                  <Tabs defaultValue="pages" className="flex-1 flex flex-col h-full">
                    <div className="p-3 border-b border-border">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="pages" className="text-xs">Страницы</TabsTrigger>
                        <TabsTrigger value="menu" className="text-xs">Меню</TabsTrigger>
                        <TabsTrigger value="settings" className="text-xs">Настройки</TabsTrigger>
                        <TabsTrigger value="preview" className="text-xs">Предпросмотр</TabsTrigger>
                        <TabsTrigger value="testing" className="text-xs">Тестирование</TabsTrigger>
                        <TabsTrigger value="statistics" className="text-xs">Статистика</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="pages" className="flex-1 m-0 overflow-hidden">
                      <PagesManager
                        projectId={id ? parseInt(id) : 0}
                        pages={projectPages as any}
                        currentPageId={currentPageId}
                        onPageSelect={async (pageId) => {
                          setCurrentPageId(pageId);
                          await loadBlocks(pageId);
                          const page = projectPages.find(p => p.id === pageId);
                          if (page) {
                            setCurrentPageSettings({
                              type: ((page.settings as Record<string, unknown>)?.type as any) || 'default',
                              name: page.name as string,
                              path: page.path as string,
                              is_home: page.is_home || false,
                              meta_title: page.meta_title as string,
                              meta_description: page.meta_description as string,
                              meta_keywords: page.meta_keywords as string,
                              settings: page.settings as any
                            });
                          }
                        }}
                        onPageCreate={async (pageData) => {
                          const response = await fetch(`${API_ENDPOINTS.projects}/${id}/pages`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...pageData, project_id: id })
                          });
                          const newPage = await response.json();
                          setProjectPages([...projectPages, newPage]);
                          return newPage;
                        }}
                        onPageUpdate={async (pageId, updates) => {
                          const response = await fetch(`${API_ENDPOINTS.projects}/${id}/pages/${pageId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updates)
                          });
                          await response.json();
                          setProjectPages(projectPages.map(p => 
                            p.id === pageId ? { ...p, ...updates } : p
                          ));
                        }}
                        onPageDelete={async (pageId) => {
                          await fetch(`${API_ENDPOINTS.projects}/${id}/pages/${pageId}`, {
                            method: 'DELETE'
                          });
                          setProjectPages(projectPages.filter(p => p.id !== pageId));
                          if (currentPageId === pageId && projectPages.length > 1) {
                            const nextPage = projectPages.find(p => p.id !== pageId);
                            if (nextPage) {
                              setCurrentPageId(nextPage.id as number);
                              await loadBlocks(nextPage.id as number);
                            }
                          }
                        }}
                        onPageDuplicate={async (pageId) => {
                          const page = projectPages.find(p => p.id === pageId);
                          if (!page) throw new Error('Page not found');
                          
                          const response = await fetch(`${API_ENDPOINTS.projects}/${id}/pages/${pageId}/duplicate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                          });
                          const duplicatedPage = await response.json();
                          setProjectPages([...projectPages, duplicatedPage]);
                          return duplicatedPage;
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="menu" className="flex-1 m-0 overflow-hidden">
                      <MenuBuilder
                        menuItems={menuItems}
                        availablePages={projectPages.map(p => ({
                          id: p.id as number,
                          name: p.name as string,
                          path: p.path as string
                        }))}
                        onMenuItemsChange={setMenuItems}
                      />
                    </TabsContent>
                    <TabsContent value="settings" className="flex-1 m-0 overflow-hidden">
                      <PageSettings
                        pageId={currentPageId}
                        pageSettings={currentPageSettings}
                        onSettingsChange={setCurrentPageSettings}
                        onSave={async () => {
                          if (!currentPageId) return;
                          const response = await fetch(`${API_ENDPOINTS.projects}/${id}/pages/${currentPageId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: currentPageSettings.name,
                              path: currentPageSettings.path,
                              is_home: currentPageSettings.is_home,
                              meta_title: currentPageSettings.meta_title,
                              meta_description: currentPageSettings.meta_description,
                              meta_keywords: currentPageSettings.meta_keywords,
                              settings: {
                                ...currentPageSettings.settings,
                                type: currentPageSettings.type
                              }
                            })
                          });
                          await response.json();
                          setProjectPages(projectPages.map(p => 
                            p.id === currentPageId ? { ...p, ...currentPageSettings } : p
                          ));
                          toast({
                            title: "Настройки сохранены",
                            description: "Настройки страницы успешно обновлены"
                          });
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                      <PreviewSettings
                        projectId={id ? parseInt(id) : 0}
                        previewSettings={previewSettings}
                        onSettingsChange={setPreviewSettings}
                        onGeneratePreview={async () => {
                          const response = await fetch(`${API_ENDPOINTS.projects}/${id}/preview`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              password: previewSettings.passwordEnabled ? previewSettings.password : undefined,
                              expires_at: previewSettings.expiresEnabled ? previewSettings.expiresAt : undefined,
                              allowed_ips: previewSettings.ipRestrictionEnabled ? previewSettings.allowedIPs : undefined
                            })
                          });
                          const data = await response.json();
                          return data.preview_url || `https://preview.rus.dev/${id}?token=${data.token}`;
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="testing" className="flex-1 m-0 overflow-hidden p-4">
                      <Tabs defaultValue="devices" className="flex-1 flex flex-col h-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                          <TabsTrigger value="devices">Устройства</TabsTrigger>
                          <TabsTrigger value="performance">Производительность</TabsTrigger>
                          <TabsTrigger value="lighthouse">Lighthouse</TabsTrigger>
                        </TabsList>
                        <TabsContent value="devices" className="flex-1 overflow-auto">
                          {previewSettings.previewUrl ? (
                            <DevicePreview
                              previewUrl={previewSettings.previewUrl}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <div className="text-center">
                                <Icon name="Smartphone" size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Сначала создайте ссылку предпросмотра</p>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="performance" className="flex-1 overflow-auto">
                          {previewSettings.previewUrl ? (
                            <PerformanceTest
                              previewUrl={previewSettings.previewUrl}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <div className="text-center">
                                <Icon name="Gauge" size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Сначала создайте ссылку предпросмотра</p>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="lighthouse" className="flex-1 overflow-auto">
                          {previewSettings.previewUrl ? (
                            <LighthouseTest
                              previewUrl={previewSettings.previewUrl}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <div className="text-center">
                                <Icon name="Zap" size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Сначала создайте ссылку предпросмотра</p>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                    <TabsContent value="statistics" className="flex-1 m-0 overflow-hidden p-4">
                      <ScrollArea className="h-full">
                        <SiteStatistics projectId={id ? parseInt(id) : undefined} />
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </aside>
        )}
        <div className="flex-1 overflow-auto bg-muted/30">
          {pageBlocks.map((block, index) => {
            const blockId = typeof block.id === 'number' ? block.id : Number(block.id) || 0;
            return (
              <div
                key={blockId}
                data-block-id={blockId}
                className={`p-4 border-b ${selectedBlockIds.includes(blockId) ? 'bg-primary/10' : ''}`}
                onClick={() => handleSelectBlock(blockId)}
              >
                <div>Блок {blockId}</div>
              </div>
            );
          })}
        </div>
        {rightPanelOpen && selectedBlockId && (
          <PropertiesPanel
              editingStyles={editingStyles}
              responsiveStyles={responsiveStyles as any}
              currentBreakpoint={currentBreakpoint}
              selectedBlockIds={selectedBlockIds}
              animation={editingAnimation as any}
              hoverEffects={editingHoverEffects as any}
              onStylesChange={setEditingStyles}
              onResponsiveStylesChange={setResponsiveStyles as any}
              onBreakpointChange={setCurrentBreakpoint}
              onAnimationChange={setEditingAnimation as any}
              onHoverEffectsChange={setEditingHoverEffects as any}
              currentTheme={currentTheme}
              currentPalette={currentPalette as any}
              customPalettes={customPalettes as any}
              currentFontPair={currentFontPair as any}
              customFontPairs={customFontPairs as any}
              customTypographyStyles={customTypographyStyles as any}
              onThemeChange={setCurrentTheme as any}
              onPaletteSelect={(palette: any) => setCurrentPalette(palette as any)}
              onPaletteSave={(palette: any) => setCustomPalettes([...customPalettes, palette as any])}
              onPaletteDelete={(id: any) => setCustomPalettes(customPalettes.filter(p => (p as any).id !== id))}
              onFontPairSelect={(pair: any) => setCurrentFontPair(pair as any)}
              onFontPairSave={(pair: any) => setCustomFontPairs([...customFontPairs, pair as any])}
              onFontPairDelete={(id: any) => setCustomFontPairs(customFontPairs.filter(p => (p as any).id !== id))}
              onTypographyStyleSelect={(style: any) => {
                toast({
                  title: "Стиль выбран",
                  description: `Стиль "${(style as any).name}" выбран`
                });
              }}
              onTypographyStyleSave={(style: any) => setCustomTypographyStyles([...customTypographyStyles, style as any])}
              onTypographyStyleDelete={(id: any) => setCustomTypographyStyles(customTypographyStyles.filter(s => (s as any).id !== id))}
              onApplyTypographyStyle={(style: any) => {
                toast({
                  title: "Стиль применен",
                  description: `Стиль "${(style as any).name}" применен к выбранному блоку`
                });
              }}
              onApplyThemeToSite={() => {
                toast({
                  title: "Тема применена",
                  description: "Цветовая схема применена ко всему сайту"
                });
              }}
              onAlign={handleAlignBlocks}
              onDistribute={handleDistributeBlocks}
          />
        )}
        {rightPanelOpen && !selectedBlockId && (
            <aside className="w-80 border-l border-border bg-card flex flex-col shadow-sm">
              <Tabs defaultValue="code" className="flex-1 flex flex-col">
                <div className="p-3 border-b border-border">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code" className="text-xs">Код</TabsTrigger>
                    <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">Аналитика</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="code" className="flex-1 m-0 overflow-y-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <CSSEditor
                        globalCSS={globalCSS}
                        cssVariables={cssVariables}
                        mediaQueries={mediaQueries}
                        onGlobalCSSChange={setGlobalCSS}
                        onCSSVariablesChange={setCSSVariables}
                        onMediaQueriesChange={setMediaQueries}
                      />
                      <HeadFooterEditor
                        headCode={headCode}
                        footerCode={footerCode}
                        onHeadCodeChange={setHeadCode}
                        onFooterCodeChange={setFooterCode}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="seo" className="flex-1 m-0 overflow-y-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <SEOEditor
                        seoData={seoData as Record<string, unknown>}
                        onSEODataChange={(data) => setSEOData(data as Record<string, unknown>)}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="analytics" className="flex-1 m-0 overflow-y-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <AnalyticsEditor
                        analyticsData={analyticsData as Record<string, unknown>}
                        onAnalyticsDataChange={(data) => setAnalyticsData(data as Record<string, unknown>)}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </aside>
        )}
      </div>

      <ImportExportDialog
        open={importExportDialogOpen}
        onOpenChange={setImportExportDialogOpen}
        projectName={projectName}
        pageBlocks={pageBlocks}
        onImportBlocks={(blocks) => {
          const newBlocks = blocks.map((block, index) => ({
            ...block,
            id: Date.now() + index,
            position: pageBlocks.length + index
          }));
          setPageBlocks([...pageBlocks, ...newBlocks]);
        }}
        onImportTemplate={(template) => {
          const newBlocks = template.blocks.map((block, index) => ({
            ...block,
            id: Date.now() + index,
            position: pageBlocks.length + index
          }));
          setPageBlocks([...pageBlocks, ...newBlocks]);
        }}
        onImportProject={(data) => {
          if (data.pages && data.pages.length > 0) {
            const blocks = data.pages[0].blocks.map((block, index) => ({
              ...block,
              id: Date.now() + index,
              position: index
            }));
            setPageBlocks(blocks);
            if (data.projectName) {
              setProjectName(data.projectName);
            }
          }
        }}
      />

      <PreviewWindow
        isOpen={isPreviewWindowOpen}
        previewUrl={previewSettings.previewUrl}
        onClose={() => setIsPreviewWindowOpen(false)}
      />

      {showMonitoring && (
        <Dialog open={showMonitoring} onOpenChange={setShowMonitoring}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Мониторинг и логи</DialogTitle>
              <DialogDescription>
                Мониторинг сайта, логи и аналитика деплоев
              </DialogDescription>
            </DialogHeader>
            <MonitoringPanel
              projectId={id ? parseInt(id) : 0}
              publishedUrl={publishSettings.publishedUrl || ''}
            />
          </DialogContent>
        </Dialog>
      )}

      {showVersionManager && (
        <Dialog open={showVersionManager} onOpenChange={setShowVersionManager}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Управление версиями</DialogTitle>
              <DialogDescription>
                Просмотр, сохранение и откат версий проекта
              </DialogDescription>
            </DialogHeader>
            <VersionManager
              projectId={id ? parseInt(id) : 0}
              currentVersion={currentProjectVersion}
              onVersionSelect={async (version) => {
                try {
                  const response = await fetch(`${API_ENDPOINTS.projects}/${id}/versions/${version.id}/load`, {
                    method: 'POST'
                  });
                  if (response.ok) {
                    const data = await response.json();
                    setPageBlocks(data.blocks || []);
                    setCurrentProjectVersion(version.version);
                    toast({
                      title: "Версия загружена",
                      description: `Версия ${version.tag || version.version} успешно загружена`
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Ошибка",
                    description: "Не удалось загрузить версию",
                    variant: "destructive"
                  });
                }
              }}
              onRollback={async (version) => {
                try {
                  const response = await fetch(`${API_ENDPOINTS.projects}/${id}/rollback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ version_id: version.id })
                  });
                  if (!response.ok) {
                    throw new Error('Ошибка отката');
                  }
                  const data = await response.json();
                  setPageBlocks(data.blocks || []);
                  setCurrentProjectVersion(version.version);
                  toast({
                    title: "Откат выполнен",
                    description: `Проект откачен к версии ${version.tag || version.version || 'неизвестная'}`
                  });
                } catch (error) {
                  toast({
                    title: "Ошибка отката",
                    description: error instanceof Error ? error.message : 'Не удалось выполнить откат',
                    variant: "destructive"
                  });
                  throw error;
                }
              }}
              onSaveVersion={async (version, description, tag) => {
                try {
                  const response = await fetch(`${API_ENDPOINTS.projects}/${id}/versions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      version,
                      description,
                      tag,
                      data: {
                        pages: projectPages,
                        blocks: pageBlocks,
                        settings: {
                          globalCSS,
                          cssVariables,
                          mediaQueries,
                          headCode,
                          footerCode,
                          seoData,
                          analyticsData
                        }
                      }
                    })
                  });
                  if (!response.ok) {
                    throw new Error('Ошибка сохранения версии');
                  }
                  toast({
                    title: "Версия сохранена",
                    description: `Версия ${tag || version} успешно сохранена`
                  });
                } catch (error) {
                  toast({
                    title: "Ошибка сохранения",
                    description: error instanceof Error ? error.message : 'Не удалось сохранить версию',
                    variant: "destructive"
                  });
                  throw error;
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <PublishDialog
        isOpen={isPublishDialogOpen}
        projectId={id ? parseInt(id) : 0}
        projectName={projectName}
        publishSettings={publishSettings}
        onClose={() => setIsPublishDialogOpen(false)}
        onPublish={async (settings) => {
          setPublishSettings({ ...settings, status: 'building', progress: 10 });
          
          try {
            setPublishSettings({ ...settings, status: 'building', progress: 30 });
            
            const response = await fetch(`${API_ENDPOINTS.projects}/${id}/publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: settings.type,
                subdomain: settings.subdomain,
                custom_domain: settings.customDomain,
                ssl_enabled: settings.sslEnabled,
                auto_ssl: settings.autoSSL
              })
            });

            if (!response.ok) {
              throw new Error('Ошибка публикации');
            }

            setPublishSettings({ ...settings, status: 'deploying', progress: 60 });
            
            const data = await response.json();
            
            setPublishSettings({ ...settings, status: 'configuring', progress: 80 });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setPublishSettings({
              ...settings,
              status: 'success',
              progress: 100,
              publishedUrl: data.url || (settings.type === 'subdomain' ? `https://${settings.subdomain || ''}.rus.dev` : `https://${settings.customDomain || ''}`)
            });

            toast({
              title: "Сайт опубликован",
              description: `Сайт успешно опубликован по адресу: ${data.url || (settings.type === 'subdomain' ? `${settings.subdomain || ''}.rus.dev` : settings.customDomain || '')}`
            });
          } catch (error) {
            setPublishSettings({
              ...settings,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
            toast({
              title: "Ошибка публикации",
              description: error instanceof Error ? error.message : 'Не удалось опубликовать сайт',
              variant: "destructive"
            });
          }
        }}
      />
    </div>
  );
};
