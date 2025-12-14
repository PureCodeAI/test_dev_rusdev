import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Template, SectionTemplate, TemplateCategory } from '@/types/template.types';
import { defaultTemplates, defaultSectionTemplates } from '@/data/templates';
import { cn } from '@/lib/utils';
import { filterAndSearchTemplates, searchSections, createTemplate, createSection } from '@/utils/templateUtils';

interface TemplateLibraryProps {
  onTemplateSelect?: (template: Template) => void;
  onSectionSelect?: (section: SectionTemplate) => void;
  onSaveTemplate?: (template: Template) => void;
  onSaveSection?: (section: SectionTemplate) => void;
  className?: string;
}

const categoryLabels: Record<TemplateCategory, string> = {
  landing: 'Лендинги',
  blog: 'Блоги',
  shop: 'Магазины',
  portfolio: 'Портфолио',
  custom: 'Пользовательские'
};

export const TemplateLibrary = ({
  onTemplateSelect,
  onSectionSelect,
  onSaveTemplate,
  onSaveSection,
  className
}: TemplateLibraryProps) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'sections'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | SectionTemplate | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState<TemplateCategory>('custom');
  const [saveType, setSaveType] = useState<'template' | 'section'>('template');

  const filteredTemplates = filterAndSearchTemplates(defaultTemplates, selectedCategory, searchQuery);

  const filteredSections = searchSections(defaultSectionTemplates, searchQuery);

  const handleTemplateSelect = (template: Template) => {
    setPreviewTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleSectionSelect = (section: SectionTemplate) => {
    setPreviewTemplate(section);
    if (onSectionSelect) {
      onSectionSelect(section);
    }
  };

  const handleSave = () => {
    if (saveName.trim() && previewTemplate) {
      if (saveType === 'template' && onSaveTemplate) {
        const template = createTemplate(
          saveName,
          (previewTemplate as Template).blocks || [],
          saveCategory,
          (previewTemplate as Template).description || '',
          (previewTemplate as Template).authorId
        );
        onSaveTemplate(template);
      } else if (saveType === 'section' && onSaveSection) {
        const section = createSection(
          saveName,
          (previewTemplate as SectionTemplate).blocks || [],
          (previewTemplate as SectionTemplate).type || 'custom',
          (previewTemplate as SectionTemplate).description || '',
          (previewTemplate as SectionTemplate).authorId
        );
        onSaveSection(section);
      }
      setIsSaveDialogOpen(false);
      setSaveName('');
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Библиотека шаблонов</h3>
        {onSaveTemplate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSaveType('template');
              setIsSaveDialogOpen(true);
            }}
          >
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить шаблон
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'templates' | 'sections')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="sections">Секции</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as TemplateCategory | 'all')}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    {template.previewImage ? (
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Icon name="Image" size={48} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {categoryLabels[template.category]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                    >
                      <Icon name="Eye" size={14} className="mr-1" />
                      Предпросмотр
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                    >
                      Применить
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Поиск секций..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {onSaveSection && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSaveType('section');
                  setIsSaveDialogOpen(true);
                }}
              >
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить секцию
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSections.map((section) => (
              <Card
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionSelect(section)}
              >
                <div className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    {section.previewImage ? (
                      <img
                        src={section.previewImage}
                        alt={section.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Icon name="Layout" size={48} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{section.name}</h4>
                    <span className="text-xs text-muted-foreground capitalize">
                      {section.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSectionSelect(section);
                      }}
                    >
                      <Icon name="Eye" size={14} className="mr-1" />
                      Предпросмотр
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSectionSelect(section);
                      }}
                    >
                      Добавить
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={previewTemplate !== null && !isSaveDialogOpen} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {previewTemplate && 'blocks' in previewTemplate && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Блоков: {previewTemplate.blocks.length}
                </p>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm">Предпросмотр блоков шаблона</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить {saveType === 'template' ? 'шаблон' : 'секцию'}</DialogTitle>
            <DialogDescription>
              Введите название для {saveType === 'template' ? 'шаблона' : 'секции'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Название</Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Введите название"
                className="mt-2"
              />
            </div>
            {saveType === 'template' && (
              <div>
                <Label>Категория</Label>
                <Select
                  value={saveCategory}
                  onValueChange={(v) => setSaveCategory(v as TemplateCategory)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

