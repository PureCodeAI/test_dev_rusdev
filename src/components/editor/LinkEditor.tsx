import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export interface LinkData {
  href: string;
  target?: '_blank' | '_self';
  type: 'internal' | 'external' | 'anchor' | 'page';
  label?: string;
  rel?: string;
  title?: string;
}

interface LinkEditorProps {
  linkData?: LinkData;
  availablePages?: Array<{ id: number; name: string; path: string }>;
  onLinkChange: (link: LinkData) => void;
}

export const LinkEditor = ({ linkData, availablePages = [], onLinkChange }: LinkEditorProps) => {
  const [localLink, setLocalLink] = useState<LinkData>(linkData || {
    href: '',
    target: '_self',
    type: 'internal'
  });

  const updateLink = (updates: Partial<LinkData>) => {
    const updated = { ...localLink, ...updates };
    setLocalLink(updated);
    onLinkChange(updated);
  };

  const handleTypeChange = (type: string) => {
    const newType = type as LinkData['type'];
    let newHref = localLink.href;

    if (newType === 'page' && availablePages.length > 0) {
      newHref = availablePages[0].path;
    } else if (newType === 'anchor') {
      newHref = '#section';
    } else if (newType === 'external') {
      newHref = 'https://';
    } else if (newType === 'internal') {
      newHref = '/';
    }

    updateLink({ type: newType, href: newHref });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Тип ссылки</Label>
          <Select
            value={localLink.type}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Внутренняя ссылка</SelectItem>
              <SelectItem value="page">Страница сайта</SelectItem>
              <SelectItem value="anchor">Якорная ссылка</SelectItem>
              <SelectItem value="external">Внешняя ссылка</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {localLink.type === 'page' && availablePages.length > 0 && (
          <div>
            <Label className="mb-2 block">Страница</Label>
            <Select
              value={localLink.href}
              onValueChange={(value) => updateLink({ href: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePages.map(page => (
                  <SelectItem key={page.id} value={page.path}>
                    {page.name} ({page.path})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(localLink.type === 'internal' || localLink.type === 'anchor' || localLink.type === 'external') && (
          <div>
            <Label className="mb-2 block">URL / Путь</Label>
            <Input
              value={localLink.href}
              onChange={(e) => updateLink({ href: e.target.value })}
              placeholder={
                localLink.type === 'anchor' ? '#section' :
                localLink.type === 'external' ? 'https://example.com' :
                '/page'
              }
            />
            {localLink.type === 'external' && (
              <p className="text-xs text-muted-foreground mt-1">
                Внешние ссылки должны начинаться с http:// или https://
              </p>
            )}
            {localLink.type === 'anchor' && (
              <p className="text-xs text-muted-foreground mt-1">
                Якорные ссылки должны начинаться с # (например: #section)
              </p>
            )}
          </div>
        )}

        <div>
          <Label className="mb-2 block">Текст ссылки (опционально)</Label>
          <Input
            value={localLink.label || ''}
            onChange={(e) => updateLink({ label: e.target.value })}
            placeholder="Текст ссылки"
          />
        </div>

        <div>
          <Label className="mb-2 block">Открывать в новой вкладке</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={localLink.target === '_blank'}
              onCheckedChange={(checked) => updateLink({ target: checked ? '_blank' : '_self' })}
            />
            <span className="text-sm text-muted-foreground">
              {localLink.target === '_blank' ? 'Да' : 'Нет'}
            </span>
          </div>
        </div>

        {localLink.type === 'external' && (
          <div>
            <Label className="mb-2 block">Rel атрибут</Label>
            <Select
              value={localLink.rel || 'noopener noreferrer'}
              onValueChange={(value) => updateLink({ rel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="noopener noreferrer">noopener noreferrer (рекомендуется)</SelectItem>
                <SelectItem value="noopener">noopener</SelectItem>
                <SelectItem value="nofollow">nofollow</SelectItem>
                <SelectItem value="noopener nofollow">noopener nofollow</SelectItem>
                <SelectItem value="">Нет</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="mb-2 block">Title (опционально)</Label>
          <Input
            value={localLink.title || ''}
            onChange={(e) => updateLink({ title: e.target.value })}
            placeholder="Всплывающая подсказка"
          />
        </div>

        <div className="p-3 bg-muted rounded">
          <Label className="text-xs mb-2 block">Предпросмотр:</Label>
          <a
            href={localLink.href}
            target={localLink.target}
            rel={localLink.rel}
            title={localLink.title}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            {localLink.label || localLink.href}
            {localLink.target === '_blank' && (
              <Icon name="ExternalLink" size={12} />
            )}
          </a>
        </div>
      </div>
    </Card>
  );
};

