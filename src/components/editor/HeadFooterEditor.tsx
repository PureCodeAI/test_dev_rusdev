import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeadFooterEditorProps {
  headCode?: string;
  footerCode?: string;
  onHeadCodeChange?: (code: string) => void;
  onFooterCodeChange?: (code: string) => void;
}

export const HeadFooterEditor = ({
  headCode = '',
  footerCode = '',
  onHeadCodeChange,
  onFooterCodeChange
}: HeadFooterEditorProps) => {
  const [localHeadCode, setLocalHeadCode] = useState(headCode);
  const [localFooterCode, setLocalFooterCode] = useState(footerCode);

  useEffect(() => {
    setLocalHeadCode(headCode);
  }, [headCode]);

  useEffect(() => {
    setLocalFooterCode(footerCode);
  }, [footerCode]);

  const handleHeadCodeChange = (value: string) => {
    setLocalHeadCode(value);
    if (onHeadCodeChange) {
      onHeadCodeChange(value);
    }
  };

  const handleFooterCodeChange = (value: string) => {
    setLocalFooterCode(value);
    if (onFooterCodeChange) {
      onFooterCodeChange(value);
    }
  };

  const handleFormatHTML = (code: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    code.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) {
        indent--;
      }
      formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n';
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input') && !node.startsWith('img') && !node.startsWith('br') && !node.startsWith('hr') && !node.startsWith('meta') && !node.startsWith('link')) {
        indent++;
      }
    });
    
    return formatted.substring(1, formatted.length - 2);
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="head" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="head">Head код</TabsTrigger>
          <TabsTrigger value="footer">Footer код</TabsTrigger>
        </TabsList>

        <TabsContent value="head" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Код в &lt;head&gt;</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleHeadCodeChange(handleFormatHTML(localHeadCode))}
            >
              <Icon name="Code" size={14} className="mr-2" />
              Форматировать
            </Button>
          </div>
          <Textarea
            value={localHeadCode}
            onChange={(e) => handleHeadCodeChange(e.target.value)}
            className="font-mono text-sm min-h-[300px]"
            placeholder="Введите HTML код для секции &lt;head&gt; (meta теги, скрипты, стили)..."
          />
          <div className="text-xs text-muted-foreground">
            <p>Этот код будет добавлен в секцию &lt;head&gt; каждой страницы.</p>
            <p>Используйте для: meta тегов, подключения скриптов, стилей, аналитики и т.д.</p>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Код перед &lt;/body&gt;</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleFooterCodeChange(handleFormatHTML(localFooterCode))}
            >
              <Icon name="Code" size={14} className="mr-2" />
              Форматировать
            </Button>
          </div>
          <Textarea
            value={localFooterCode}
            onChange={(e) => handleFooterCodeChange(e.target.value)}
            className="font-mono text-sm min-h-[300px]"
            placeholder="Введите HTML код для секции перед &lt;/body&gt; (скрипты, аналитика)..."
          />
          <div className="text-xs text-muted-foreground">
            <p>Этот код будет добавлен перед закрывающим тегом &lt;/body&gt; каждой страницы.</p>
            <p>Используйте для: скриптов аналитики, виджетов, дополнительных библиотек и т.д.</p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

