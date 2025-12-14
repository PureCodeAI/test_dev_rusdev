import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeBlockProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
  language: 'html' | 'css' | 'javascript';
  isEditing?: boolean;
}

export const CodeBlock = ({ content, onContentChange, language, isEditing = false }: CodeBlockProps) => {
  const [code, setCode] = useState<string>((content.code as string) || '');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setCode((content.code as string) || '');
  }, [content]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    onContentChange({ ...content, code: value });
  };

  const handleFormat = () => {
    try {
      if (language === 'html') {
        const formatted = formatHTML(code);
        setCode(formatted);
        onContentChange({ ...content, code: formatted });
      } else if (language === 'css') {
        const formatted = formatCSS(code);
        setCode(formatted);
        onContentChange({ ...content, code: formatted });
      } else if (language === 'javascript') {
        const formatted = formatJS(code);
        setCode(formatted);
        onContentChange({ ...content, code: formatted });
      }
    } catch (error) {
      console.error('Format error:', error);
    }
  };

  const formatHTML = (html: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    html.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) {
        indent--;
      }
      formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n';
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input') && !node.startsWith('img') && !node.startsWith('br') && !node.startsWith('hr')) {
        indent++;
      }
    });
    
    return formatted.substring(1, formatted.length - 2);
  };

  const formatCSS = (css: string): string => {
    return css
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  };

  const formatJS = (js: string): string => {
    return js
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  };

  if (isEditing) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {language === 'html' && 'HTML код'}
              {language === 'css' && 'CSS код'}
              {language === 'javascript' && 'JavaScript код'}
            </Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleFormat}>
                <Icon name="Code" size={14} className="mr-2" />
                Форматировать
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
                <Icon name={isPreview ? "Code" : "Eye"} size={14} className="mr-2" />
                {isPreview ? 'Код' : 'Превью'}
              </Button>
            </div>
          </div>
          
          {isPreview && language === 'html' ? (
            <div 
              className="border border-border rounded p-4 bg-background min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: code }}
            />
          ) : (
            <Textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
              placeholder={`Введите ${language.toUpperCase()} код...`}
            />
          )}
        </div>
      </Card>
    );
  }

  if (language === 'html') {
    return (
      <div 
        className="code-block-html"
        dangerouslySetInnerHTML={{ __html: code }}
      />
    );
  }

  if (language === 'css') {
    return (
      <style dangerouslySetInnerHTML={{ __html: code }} />
    );
  }

  if (language === 'javascript') {
    return (
      <script dangerouslySetInnerHTML={{ __html: code }} />
    );
  }

  return null;
};

