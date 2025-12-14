import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

export type PageType = 'default' | 'home' | 'blog' | 'product' | 'category' | '404';

export interface PageSettings {
  type: PageType;
  name: string;
  path: string;
  is_home?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  settings?: {
    showHeader?: boolean;
    showFooter?: boolean;
    showSidebar?: boolean;
    sidebarPosition?: 'left' | 'right';
    layout?: 'full-width' | 'container' | 'boxed';
    customCSS?: string;
    customJS?: string;
    [key: string]: unknown;
  };
}

interface PageSettingsProps {
  pageId: number | null;
  pageSettings: PageSettings;
  onSettingsChange: (settings: PageSettings) => void;
  onSave: () => Promise<void>;
}

export const PageSettings = ({ pageId, pageSettings, onSettingsChange, onSave }: PageSettingsProps) => {
  const [localSettings, setLocalSettings] = useState<PageSettings>(pageSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(pageSettings);
  }, [pageSettings]);

  const updateSetting = (key: keyof PageSettings, value: unknown) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const updateNestedSetting = (key: string, value: unknown) => {
    const updated = {
      ...localSettings,
      settings: {
        ...localSettings.settings,
        [key]: value
      }
    };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const pageTypeDescriptions: Record<PageType, string> = {
    default: 'Обычная страница для контента',
    home: 'Главная страница сайта',
    blog: 'Страница блога с постами',
    product: 'Страница товара в магазине',
    category: 'Страница категории товаров',
    '404': 'Страница ошибки 404'
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Настройки страницы</h3>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !pageId}>
            <Icon name={isSaving ? "Loader2" : "Save"} size={16} className="mr-2" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="text-xs">Основные</TabsTrigger>
            <TabsTrigger value="type" className="text-xs">Тип</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">Макет</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <Label>Название страницы</Label>
              <Input
                value={localSettings.name}
                onChange={(e) => updateSetting('name', e.target.value)}
                placeholder="О нас"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Путь (URL)</Label>
              <Input
                value={localSettings.path}
                onChange={(e) => updateSetting('path', e.target.value)}
                placeholder="/about"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Путь должен начинаться с / (например: /about, /contacts)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-home"
                checked={localSettings.is_home || false}
                onCheckedChange={(checked) => {
                  updateSetting('is_home', checked);
                  if (checked) {
                    updateSetting('type', 'home');
                  }
                }}
              />
              <Label htmlFor="is-home">Главная страница</Label>
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4 mt-4">
            <div>
              <Label>Тип страницы</Label>
              <Select
                value={localSettings.type}
                onValueChange={(value) => {
                  updateSetting('type', value as PageType);
                  if (value === 'home') {
                    updateSetting('is_home', true);
                  }
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div>
                      <div className="font-medium">Обычная страница</div>
                      <div className="text-xs text-muted-foreground">{pageTypeDescriptions.default}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="home">
                    <div>
                      <div className="font-medium">Главная страница</div>
                      <div className="text-xs text-muted-foreground">{pageTypeDescriptions.home}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="blog">
                    <div>
                      <div className="font-medium">Страница блога</div>
                      <div className="text-xs text-muted-foreground">{pageTypeDescriptions.blog}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="product">
                    <div>
                      <div className="font-medium">Страница товара</div>
                      <div className="text-xs text-muted-foreground">{pageTypeDescriptions.product}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="category">
                    <div>
                      <div className="font-medium">Страница категории</div>
                      <div className="text-xs text-muted-foreground">{pageTypeDescriptions.category}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="404">
                    <div>
                      <div className="font-medium">404 страница</div>
                      <div className="text-xs text-muted-foreground">{pageTypeDescriptions['404']}</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {pageTypeDescriptions[localSettings.type]}
              </p>
            </div>

            {localSettings.type === 'blog' && (
              <div className="p-3 bg-muted rounded">
                <Label className="text-sm font-semibold mb-2 block">Настройки блога</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blog-show-excerpt"
                      checked={localSettings.settings?.showExcerpt !== false}
                      onCheckedChange={(checked) => updateNestedSetting('showExcerpt', checked)}
                    />
                    <Label htmlFor="blog-show-excerpt" className="text-sm">Показывать краткое описание</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blog-show-author"
                      checked={localSettings.settings?.showAuthor !== false}
                      onCheckedChange={(checked) => updateNestedSetting('showAuthor', checked)}
                    />
                    <Label htmlFor="blog-show-author" className="text-sm">Показывать автора</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blog-show-date"
                      checked={localSettings.settings?.showDate !== false}
                      onCheckedChange={(checked) => updateNestedSetting('showDate', checked)}
                    />
                    <Label htmlFor="blog-show-date" className="text-sm">Показывать дату</Label>
                  </div>
                </div>
              </div>
            )}

            {localSettings.type === 'product' && (
              <div className="p-3 bg-muted rounded">
                <Label className="text-sm font-semibold mb-2 block">Настройки товара</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="product-show-gallery"
                      checked={localSettings.settings?.showGallery !== false}
                      onCheckedChange={(checked) => updateNestedSetting('showGallery', checked)}
                    />
                    <Label htmlFor="product-show-gallery" className="text-sm">Показывать галерею</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="product-show-reviews"
                      checked={localSettings.settings?.showReviews !== false}
                      onCheckedChange={(checked) => updateNestedSetting('showReviews', checked)}
                    />
                    <Label htmlFor="product-show-reviews" className="text-sm">Показывать отзывы</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="product-show-related"
                      checked={localSettings.settings?.showRelated !== false}
                      onCheckedChange={(checked) => updateNestedSetting('showRelated', checked)}
                    />
                    <Label htmlFor="product-show-related" className="text-sm">Показывать похожие товары</Label>
                  </div>
                </div>
              </div>
            )}

            {localSettings.type === 'category' && (
              <div className="p-3 bg-muted rounded">
                <Label className="text-sm font-semibold mb-2 block">Настройки категории</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm mb-1 block">Количество товаров на странице</Label>
                    <Input
                      type="number"
                      value={localSettings.settings?.itemsPerPage || 12}
                      onChange={(e) => updateNestedSetting('itemsPerPage', parseInt(e.target.value) || 12)}
                      min={1}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Сортировка по умолчанию</Label>
                    <Select
                      value={localSettings.settings?.defaultSort || 'name'}
                      onValueChange={(value) => updateNestedSetting('defaultSort', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">По названию</SelectItem>
                        <SelectItem value="price-asc">По цене (возр.)</SelectItem>
                        <SelectItem value="price-desc">По цене (убыв.)</SelectItem>
                        <SelectItem value="date">По дате</SelectItem>
                        <SelectItem value="popularity">По популярности</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <div>
              <Label>Meta Title</Label>
              <Input
                value={localSettings.meta_title || ''}
                onChange={(e) => updateSetting('meta_title', e.target.value)}
                placeholder="Заголовок страницы для поисковых систем"
                className="mt-2"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {localSettings.meta_title?.length || 0} / 60 символов
              </p>
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea
                value={localSettings.meta_description || ''}
                onChange={(e) => updateSetting('meta_description', e.target.value)}
                placeholder="Описание страницы для поисковых систем"
                className="mt-2"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {localSettings.meta_description?.length || 0} / 160 символов
              </p>
            </div>
            <div>
              <Label>Meta Keywords</Label>
              <Input
                value={localSettings.meta_keywords || ''}
                onChange={(e) => updateSetting('meta_keywords', e.target.value)}
                placeholder="ключевое слово 1, ключевое слово 2"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Разделяйте ключевые слова запятыми
              </p>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div>
              <Label>Макет страницы</Label>
              <Select
                value={localSettings.settings?.layout || 'container'}
                onValueChange={(value) => updateNestedSetting('layout', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-width">Полная ширина</SelectItem>
                  <SelectItem value="container">Контейнер</SelectItem>
                  <SelectItem value="boxed">В рамке</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Элементы страницы</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-header"
                  checked={localSettings.settings?.showHeader !== false}
                  onCheckedChange={(checked) => updateNestedSetting('showHeader', checked)}
                />
                <Label htmlFor="show-header" className="text-sm">Показывать шапку</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-footer"
                  checked={localSettings.settings?.showFooter !== false}
                  onCheckedChange={(checked) => updateNestedSetting('showFooter', checked)}
                />
                <Label htmlFor="show-footer" className="text-sm">Показывать подвал</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-sidebar"
                  checked={localSettings.settings?.showSidebar === true}
                  onCheckedChange={(checked) => updateNestedSetting('showSidebar', checked)}
                />
                <Label htmlFor="show-sidebar" className="text-sm">Показывать боковую панель</Label>
              </div>
              {localSettings.settings?.showSidebar && (
                <div className="ml-6">
                  <Label className="text-sm mb-1 block">Позиция боковой панели</Label>
                  <Select
                    value={localSettings.settings?.sidebarPosition || 'left'}
                    onValueChange={(value) => updateNestedSetting('sidebarPosition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Слева</SelectItem>
                      <SelectItem value="right">Справа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Кастомный код</Label>
              <div>
                <Label className="text-sm mb-1 block">CSS</Label>
                <Textarea
                  value={localSettings.settings?.customCSS || ''}
                  onChange={(e) => updateNestedSetting('customCSS', e.target.value)}
                  placeholder="/* Ваш CSS код */"
                  className="mt-2 font-mono text-xs"
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">JavaScript</Label>
                <Textarea
                  value={localSettings.settings?.customJS || ''}
                  onChange={(e) => updateNestedSetting('customJS', e.target.value)}
                  placeholder="// Ваш JavaScript код"
                  className="mt-2 font-mono text-xs"
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

