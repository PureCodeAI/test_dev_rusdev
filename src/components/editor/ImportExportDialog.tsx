import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { exportToJSON, exportToHTML, exportTemplate, exportImages, downloadFile, downloadZIP, downloadWordPressTheme, ExportData } from '@/utils/exportUtils';
import { importFromJSON, importTemplate, importBlocks, validateImportData, readFileAsText } from '@/utils/importUtils';
import { Template } from '@/types/template.types';
import { useToast } from '@/hooks/use-toast';
import { HostingInstructions } from './HostingInstructions';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  pageBlocks: Array<Record<string, unknown>>;
  onImportBlocks?: (blocks: Array<Record<string, unknown>>) => void;
  onImportTemplate?: (template: Template) => void;
  onImportProject?: (data: ExportData) => void;
}

export const ImportExportDialog = ({
  open,
  onOpenChange,
  projectName,
  pageBlocks,
  onImportBlocks,
  onImportTemplate,
  onImportProject
}: ImportExportDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'html' | 'template' | 'zip' | 'wordpress'>('json');
  const [exportingZIP, setExportingZIP] = useState(false);
  const [exportingWordPress, setExportingWordPress] = useState(false);
  const [showHostingInstructions, setShowHostingInstructions] = useState(false);

  const handleExportJSON = () => {
    const exportData: ExportData = {
      projectName,
      pages: [{
        id: 1,
        name: 'Главная',
        path: '/',
        blocks: pageBlocks
      }],
      settings: {},
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };

    const json = exportToJSON(exportData);
    downloadFile(json, `${projectName}.json`, 'application/json');
    
    toast({
      title: "Экспорт выполнен",
      description: "Проект успешно экспортирован в JSON"
    });
  };

  const handleExportHTML = () => {
    const exportData: ExportData = {
      projectName,
      pages: [{
        id: 1,
        name: 'Главная',
        path: '/',
        blocks: pageBlocks
      }],
      settings: {},
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };

    const html = exportToHTML(exportData);
    downloadFile(html, `${projectName}.html`, 'text/html');
    
    toast({
      title: "Экспорт выполнен",
      description: "Проект успешно экспортирован в HTML"
    });
  };

  const handleExportTemplate = () => {
    const template: Template = {
      id: `template-${Date.now()}`,
      name: projectName,
      category: 'custom',
      description: 'Экспортированный шаблон',
      blocks: pageBlocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false
    };

    const json = exportTemplate(template);
    downloadFile(json, `${projectName}-template.json`, 'application/json');
    
    toast({
      title: "Шаблон экспортирован",
      description: "Шаблон успешно экспортирован"
    });
  };

  const handleExportImages = () => {
    const images = exportImages(pageBlocks);
    
    if (images.length === 0) {
      toast({
        title: "Нет изображений",
        description: "В проекте нет изображений для экспорта",
        variant: "destructive"
      });
      return;
    }

    images.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 100);
    });
    
    toast({
      title: "Изображения экспортированы",
      description: `Экспортировано ${images.length} изображений`
    });
  };

  const handleExportZIP = async () => {
    try {
      setExportingZIP(true);
      const exportData: ExportData = {
        projectName,
        pages: [{
          id: 1,
          name: 'Главная',
          path: '/',
          blocks: pageBlocks
        }],
        settings: {},
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      };

      await downloadZIP(exportData, `${projectName}-export.zip`, {
        includeImages: true,
        includeCSS: true,
        includeJS: true,
        includeSitemap: true,
        includeRobots: true,
        includeReadme: true
      });
      
      toast({
        title: "Экспорт выполнен",
        description: "Проект успешно экспортирован в ZIP архив"
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: error instanceof Error ? error.message : "Не удалось создать ZIP архив",
        variant: "destructive"
      });
    } finally {
      setExportingZIP(false);
    }
  };

  const handleExportWordPress = async () => {
    try {
      setExportingWordPress(true);
      const exportData: ExportData = {
        projectName,
        pages: [{
          id: 1,
          name: 'Главная',
          path: '/',
          blocks: pageBlocks
        }],
        settings: {},
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      };

      await downloadWordPressTheme(exportData, `${projectName}-wordpress-theme.zip`);
      
      toast({
        title: "Экспорт выполнен",
        description: "Тема WordPress успешно создана и скачана"
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: error instanceof Error ? error.message : "Не удалось создать WordPress тему",
        variant: "destructive"
      });
    } finally {
      setExportingWordPress(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const content = await readFileAsText(file);
      
      if (exportFormat === 'template') {
        const template = importTemplate(content);
        if (template) {
          const validation = validateImportData({ blocks: template.blocks });
          if (validation.valid) {
            if (onImportTemplate) {
              onImportTemplate(template);
            }
            toast({
              title: "Шаблон импортирован",
              description: `Шаблон "${template.name}" успешно импортирован`
            });
            onOpenChange(false);
          } else {
            setImportError(`Ошибки валидации: ${validation.errors.join(', ')}`);
          }
        } else {
          setImportError('Не удалось распарсить шаблон. Проверьте формат файла.');
        }
      } else {
        const data = importFromJSON(content);
        if (data) {
          if (data.blocks) {
            const validation = validateImportData(data);
            if (validation.valid) {
              if (onImportBlocks) {
                onImportBlocks(data.blocks);
              }
              toast({
                title: "Блоки импортированы",
                description: `Импортировано ${data.blocks.length} блоков`
              });
              onOpenChange(false);
            } else {
              setImportError(`Ошибки валидации: ${validation.errors.join(', ')}`);
            }
          } else if (data.pages) {
            const validation = validateImportData(data);
            if (validation.valid) {
              if (onImportProject) {
                onImportProject(data as ExportData);
              }
              toast({
                title: "Проект импортирован",
                description: `Проект "${data.projectName || 'Без названия'}" успешно импортирован`
              });
              onOpenChange(false);
            } else {
              setImportError(`Ошибки валидации: ${validation.errors.join(', ')}`);
            }
          } else {
            setImportError('Файл не содержит блоков или страниц для импорта.');
          }
        } else {
          setImportError('Не удалось распарсить файл. Проверьте формат JSON.');
        }
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Ошибка при чтении файла');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Импорт / Экспорт</DialogTitle>
          <DialogDescription>
            Импортируйте или экспортируйте ваш проект
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Экспорт</TabsTrigger>
            <TabsTrigger value="import">Импорт</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div>
              <Label className="mb-2 block">Формат экспорта</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'json' | 'html' | 'template' | 'zip' | 'wordpress')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="html">HTML/CSS</SelectItem>
                  <SelectItem value="template">Шаблон</SelectItem>
                  <SelectItem value="zip">ZIP архив</SelectItem>
                  <SelectItem value="wordpress">WordPress тема</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {exportFormat === 'json' && (
                <Button onClick={handleExportJSON} className="w-full">
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспортировать в JSON
                </Button>
              )}
              
              {exportFormat === 'html' && (
                <Button onClick={handleExportHTML} className="w-full">
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспортировать в HTML/CSS
                </Button>
              )}
              
              {exportFormat === 'template' && (
                <Button onClick={handleExportTemplate} className="w-full">
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспортировать как шаблон
                </Button>
              )}

              {exportFormat === 'zip' && (
                <Button onClick={handleExportZIP} className="w-full" disabled={exportingZIP}>
                  <Icon name={exportingZIP ? "Loader2" : "Package"} size={16} className={`mr-2 ${exportingZIP ? 'animate-spin' : ''}`} />
                  {exportingZIP ? 'Создание архива...' : 'Экспортировать в ZIP'}
                </Button>
              )}

              {exportFormat === 'wordpress' && (
                <Button onClick={handleExportWordPress} className="w-full" disabled={exportingWordPress}>
                  <Icon name={exportingWordPress ? "Loader2" : "Wordpress"} size={16} className={`mr-2 ${exportingWordPress ? 'animate-spin' : ''}`} />
                  {exportingWordPress ? 'Создание темы...' : 'Экспортировать WordPress тему'}
                </Button>
              )}

              {exportFormat !== 'zip' && exportFormat !== 'wordpress' && (
                <Button onClick={handleExportImages} variant="outline" className="w-full">
                  <Icon name="Image" size={16} className="mr-2" />
                  Экспортировать изображения
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Экспортировано блоков: {pageBlocks.length}</p>
            </div>

            {(exportFormat === 'zip' || exportFormat === 'wordpress') && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowHostingInstructions(true)}
                >
                  <Icon name="BookOpen" size={16} className="mr-2" />
                  Инструкции по загрузке на хостинг
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div>
              <Label className="mb-2 block">Тип импорта</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'json' | 'html' | 'template')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">Проект/Блоки (JSON)</SelectItem>
                  <SelectItem value="template">Шаблон (JSON)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Выбрать файл для импорта
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {importError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{importError}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Поддерживаемые форматы: JSON</p>
              <p>Максимальный размер файла: 10MB</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {showHostingInstructions && (
        <Dialog open={showHostingInstructions} onOpenChange={setShowHostingInstructions}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Инструкции по загрузке на хостинг</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="pr-4">
                <HostingInstructions onClose={() => setShowHostingInstructions(false)} />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

