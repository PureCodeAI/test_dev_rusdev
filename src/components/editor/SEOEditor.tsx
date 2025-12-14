import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  robotsNoArchive?: boolean;
  robotsNoSnippet?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  openGraphType?: string;
  openGraphUrl?: string;
  openGraphSiteName?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  schemaType?: string;
  schemaData?: string;
}

interface SEOEditorProps {
  seoData?: SEOData;
  onSEODataChange?: (data: SEOData) => void;
}

export const SEOEditor = ({ seoData = {}, onSEODataChange }: SEOEditorProps) => {
  const [localData, setLocalData] = useState<SEOData>(seoData);

  useEffect(() => {
    setLocalData(seoData);
  }, [seoData]);

  const updateField = (field: keyof SEOData, value: string | boolean) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    if (onSEODataChange) {
      onSEODataChange(updated);
    }
  };

  const generateSchemaJSON = (): string => {
    if (!localData.schemaType || !localData.schemaData) {
      return '';
    }

    try {
      const baseSchema = {
        '@context': 'https://schema.org',
        '@type': localData.schemaType
      };

      const parsedData = JSON.parse(localData.schemaData);
      const schema = { ...baseSchema, ...parsedData };

      return JSON.stringify(schema, null, 2);
    } catch {
      return '';
    }
  };

  const generateMetaTags = (): string => {
    const tags: string[] = [];

    if (localData.metaTitle) {
      tags.push(`<title>${localData.metaTitle}</title>`);
    }
    if (localData.metaDescription) {
      tags.push(`<meta name="description" content="${localData.metaDescription}" />`);
    }
    if (localData.metaKeywords) {
      tags.push(`<meta name="keywords" content="${localData.metaKeywords}" />`);
    }
    if (localData.canonicalUrl) {
      tags.push(`<link rel="canonical" href="${localData.canonicalUrl}" />`);
    }

    const robotsParts: string[] = [];
    if (localData.robotsIndex === false) robotsParts.push('noindex');
    if (localData.robotsFollow === false) robotsParts.push('nofollow');
    if (localData.robotsNoArchive) robotsParts.push('noarchive');
    if (localData.robotsNoSnippet) robotsParts.push('nosnippet');
    if (robotsParts.length > 0) {
      tags.push(`<meta name="robots" content="${robotsParts.join(', ')}" />`);
    }

    if (localData.openGraphTitle) {
      tags.push(`<meta property="og:title" content="${localData.openGraphTitle}" />`);
    }
    if (localData.openGraphDescription) {
      tags.push(`<meta property="og:description" content="${localData.openGraphDescription}" />`);
    }
    if (localData.openGraphImage) {
      tags.push(`<meta property="og:image" content="${localData.openGraphImage}" />`);
    }
    if (localData.openGraphType) {
      tags.push(`<meta property="og:type" content="${localData.openGraphType}" />`);
    }
    if (localData.openGraphUrl) {
      tags.push(`<meta property="og:url" content="${localData.openGraphUrl}" />`);
    }
    if (localData.openGraphSiteName) {
      tags.push(`<meta property="og:site_name" content="${localData.openGraphSiteName}" />`);
    }

    if (localData.twitterCard) {
      tags.push(`<meta name="twitter:card" content="${localData.twitterCard}" />`);
    }
    if (localData.twitterTitle) {
      tags.push(`<meta name="twitter:title" content="${localData.twitterTitle}" />`);
    }
    if (localData.twitterDescription) {
      tags.push(`<meta name="twitter:description" content="${localData.twitterDescription}" />`);
    }
    if (localData.twitterImage) {
      tags.push(`<meta name="twitter:image" content="${localData.twitterImage}" />`);
    }
    if (localData.twitterSite) {
      tags.push(`<meta name="twitter:site" content="${localData.twitterSite}" />`);
    }
    if (localData.twitterCreator) {
      tags.push(`<meta name="twitter:creator" content="${localData.twitterCreator}" />`);
    }

    const schemaJSON = generateSchemaJSON();
    if (schemaJSON) {
      tags.push(`<script type="application/ld+json">\n${schemaJSON}\n</script>`);
    }

    return tags.join('\n');
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Основные</TabsTrigger>
          <TabsTrigger value="og">Open Graph</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="schema">Schema.org</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div>
            <Label className="mb-2 block">Meta Title</Label>
            <Input
              value={localData.metaTitle || ''}
              onChange={(e) => updateField('metaTitle', e.target.value)}
              placeholder="Заголовок страницы (50-60 символов)"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {localData.metaTitle?.length || 0}/60 символов
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Meta Description</Label>
            <Textarea
              value={localData.metaDescription || ''}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              placeholder="Описание страницы (150-160 символов)"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {localData.metaDescription?.length || 0}/160 символов
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Meta Keywords</Label>
            <Input
              value={localData.metaKeywords || ''}
              onChange={(e) => updateField('metaKeywords', e.target.value)}
              placeholder="Ключевые слова через запятую"
            />
          </div>

          <div>
            <Label className="mb-2 block">Canonical URL</Label>
            <Input
              value={localData.canonicalUrl || ''}
              onChange={(e) => updateField('canonicalUrl', e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Robots Meta</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="robots-index" className="text-sm">Индексировать (index)</Label>
                <Switch
                  id="robots-index"
                  checked={localData.robotsIndex !== false}
                  onCheckedChange={(checked) => updateField('robotsIndex', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="robots-follow" className="text-sm">Следовать ссылкам (follow)</Label>
                <Switch
                  id="robots-follow"
                  checked={localData.robotsFollow !== false}
                  onCheckedChange={(checked) => updateField('robotsFollow', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="robots-archive" className="text-sm">Не архивировать (noarchive)</Label>
                <Switch
                  id="robots-archive"
                  checked={localData.robotsNoArchive || false}
                  onCheckedChange={(checked) => updateField('robotsNoArchive', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="robots-snippet" className="text-sm">Не показывать сниппет (nosnippet)</Label>
                <Switch
                  id="robots-snippet"
                  checked={localData.robotsNoSnippet || false}
                  onCheckedChange={(checked) => updateField('robotsNoSnippet', checked)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="og" className="space-y-4 mt-4">
          <div>
            <Label className="mb-2 block">OG Title</Label>
            <Input
              value={localData.openGraphTitle || ''}
              onChange={(e) => updateField('openGraphTitle', e.target.value)}
              placeholder="Заголовок для соцсетей"
            />
          </div>

          <div>
            <Label className="mb-2 block">OG Description</Label>
            <Textarea
              value={localData.openGraphDescription || ''}
              onChange={(e) => updateField('openGraphDescription', e.target.value)}
              placeholder="Описание для соцсетей"
              rows={3}
            />
          </div>

          <div>
            <Label className="mb-2 block">OG Image URL</Label>
            <Input
              value={localData.openGraphImage || ''}
              onChange={(e) => updateField('openGraphImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label className="mb-2 block">OG Type</Label>
            <Select
              value={localData.openGraphType || 'website'}
              onValueChange={(value) => updateField('openGraphType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">OG URL</Label>
            <Input
              value={localData.openGraphUrl || ''}
              onChange={(e) => updateField('openGraphUrl', e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>

          <div>
            <Label className="mb-2 block">OG Site Name</Label>
            <Input
              value={localData.openGraphSiteName || ''}
              onChange={(e) => updateField('openGraphSiteName', e.target.value)}
              placeholder="Название сайта"
            />
          </div>
        </TabsContent>

        <TabsContent value="twitter" className="space-y-4 mt-4">
          <div>
            <Label className="mb-2 block">Twitter Card Type</Label>
            <Select
              value={localData.twitterCard || 'summary'}
              onValueChange={(value) => updateField('twitterCard', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                <SelectItem value="app">App</SelectItem>
                <SelectItem value="player">Player</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Twitter Title</Label>
            <Input
              value={localData.twitterTitle || ''}
              onChange={(e) => updateField('twitterTitle', e.target.value)}
              placeholder="Заголовок для Twitter"
            />
          </div>

          <div>
            <Label className="mb-2 block">Twitter Description</Label>
            <Textarea
              value={localData.twitterDescription || ''}
              onChange={(e) => updateField('twitterDescription', e.target.value)}
              placeholder="Описание для Twitter"
              rows={3}
            />
          </div>

          <div>
            <Label className="mb-2 block">Twitter Image URL</Label>
            <Input
              value={localData.twitterImage || ''}
              onChange={(e) => updateField('twitterImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label className="mb-2 block">Twitter Site</Label>
            <Input
              value={localData.twitterSite || ''}
              onChange={(e) => updateField('twitterSite', e.target.value)}
              placeholder="@username"
            />
          </div>

          <div>
            <Label className="mb-2 block">Twitter Creator</Label>
            <Input
              value={localData.twitterCreator || ''}
              onChange={(e) => updateField('twitterCreator', e.target.value)}
              placeholder="@username"
            />
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4 mt-4">
          <div>
            <Label className="mb-2 block">Schema.org Type</Label>
            <Select
              value={localData.schemaType || ''}
              onValueChange={(value) => updateField('schemaType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Organization">Organization</SelectItem>
                <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                <SelectItem value="WebSite">WebSite</SelectItem>
                <SelectItem value="Article">Article</SelectItem>
                <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Person">Person</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="Recipe">Recipe</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="VideoObject">VideoObject</SelectItem>
                <SelectItem value="BreadcrumbList">BreadcrumbList</SelectItem>
                <SelectItem value="FAQPage">FAQPage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Schema.org Data (JSON)</Label>
            <Textarea
              value={localData.schemaData || ''}
              onChange={(e) => updateField('schemaData', e.target.value)}
              placeholder='{"name": "Example", "url": "https://example.com"}'
              className="font-mono text-xs"
              rows={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Введите JSON данные для выбранного типа Schema.org
            </p>
          </div>

          {localData.schemaType && localData.schemaData && (
            <div className="p-3 bg-muted rounded">
              <Label className="text-xs mb-2 block">Предпросмотр JSON-LD:</Label>
              <pre className="text-xs font-mono overflow-x-auto">
                {generateSchemaJSON()}
              </pre>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-muted rounded">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold">Предпросмотр Meta тегов</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const metaTags = generateMetaTags();
              navigator.clipboard.writeText(metaTags);
            }}
          >
            <Icon name="Copy" size={14} className="mr-2" />
            Копировать
          </Button>
        </div>
        <ScrollArea className="h-[200px]">
          <pre className="text-xs font-mono">
            {generateMetaTags() || 'Заполните SEO данные для предпросмотра'}
          </pre>
        </ScrollArea>
      </div>
    </Card>
  );
};

