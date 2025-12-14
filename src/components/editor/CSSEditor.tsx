import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CSSVariable {
  name: string;
  value: string;
}

interface MediaQuery {
  id: string;
  query: string;
  css: string;
}

interface CSSEditorProps {
  globalCSS?: string;
  cssVariables?: CSSVariable[];
  mediaQueries?: MediaQuery[];
  onGlobalCSSChange?: (css: string) => void;
  onCSSVariablesChange?: (variables: CSSVariable[]) => void;
  onMediaQueriesChange?: (queries: MediaQuery[]) => void;
}

export const CSSEditor = ({
  globalCSS = '',
  cssVariables = [],
  mediaQueries = [],
  onGlobalCSSChange,
  onCSSVariablesChange,
  onMediaQueriesChange
}: CSSEditorProps) => {
  const [localCSS, setLocalCSS] = useState(globalCSS);
  const [localVariables, setLocalVariables] = useState<CSSVariable[]>(cssVariables);
  const [localMediaQueries, setLocalMediaQueries] = useState<MediaQuery[]>(mediaQueries);
  const [newVariable, setNewVariable] = useState({ name: '', value: '' });
  const [newMediaQuery, setNewMediaQuery] = useState({ query: '', css: '' });

  useEffect(() => {
    setLocalCSS(globalCSS);
  }, [globalCSS]);

  useEffect(() => {
    setLocalVariables(cssVariables);
  }, [cssVariables]);

  useEffect(() => {
    setLocalMediaQueries(mediaQueries);
  }, [mediaQueries]);

  const handleCSSChange = (value: string) => {
    setLocalCSS(value);
    if (onGlobalCSSChange) {
      onGlobalCSSChange(value);
    }
  };

  const handleFormatCSS = () => {
    const formatted = localCSS
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    handleCSSChange(formatted);
  };

  const handleAddVariable = () => {
    if (newVariable.name && newVariable.value) {
      const updated = [...localVariables, { ...newVariable }];
      setLocalVariables(updated);
      if (onCSSVariablesChange) {
        onCSSVariablesChange(updated);
      }
      setNewVariable({ name: '', value: '' });
    }
  };

  const handleRemoveVariable = (index: number) => {
    const updated = localVariables.filter((_, i) => i !== index);
    setLocalVariables(updated);
    if (onCSSVariablesChange) {
      onCSSVariablesChange(updated);
    }
  };

  const handleUpdateVariable = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...localVariables];
    updated[index] = { ...updated[index], [field]: value };
    setLocalVariables(updated);
    if (onCSSVariablesChange) {
      onCSSVariablesChange(updated);
    }
  };

  const handleAddMediaQuery = () => {
    if (newMediaQuery.query && newMediaQuery.css) {
      const updated = [...localMediaQueries, { ...newMediaQuery, id: `mq-${Date.now()}` }];
      setLocalMediaQueries(updated);
      if (onMediaQueriesChange) {
        onMediaQueriesChange(updated);
      }
      setNewMediaQuery({ query: '', css: '' });
    }
  };

  const handleRemoveMediaQuery = (id: string) => {
    const updated = localMediaQueries.filter(mq => mq.id !== id);
    setLocalMediaQueries(updated);
    if (onMediaQueriesChange) {
      onMediaQueriesChange(updated);
    }
  };

  const handleUpdateMediaQuery = (id: string, field: 'query' | 'css', value: string) => {
    const updated = localMediaQueries.map(mq => 
      mq.id === id ? { ...mq, [field]: value } : mq
    );
    setLocalMediaQueries(updated);
    if (onMediaQueriesChange) {
      onMediaQueriesChange(updated);
    }
  };

  const generateCSSVariablesString = (): string => {
    return `:root {\n${localVariables.map(v => `  --${v.name}: ${v.value};`).join('\n')}\n}`;
  };

  const generateMediaQueriesString = (): string => {
    return localMediaQueries.map(mq => `@media ${mq.query} {\n${mq.css}\n}`).join('\n\n');
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Глобальные стили</TabsTrigger>
          <TabsTrigger value="variables">CSS переменные</TabsTrigger>
          <TabsTrigger value="media">Media queries</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Глобальные CSS стили</Label>
            <Button variant="outline" size="sm" onClick={handleFormatCSS}>
              <Icon name="Code" size={14} className="mr-2" />
              Форматировать
            </Button>
          </div>
          <Textarea
            value={localCSS}
            onChange={(e) => handleCSSChange(e.target.value)}
            className="font-mono text-sm min-h-[400px]"
            placeholder="Введите CSS код..."
          />
        </TabsContent>

        <TabsContent value="variables" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-semibold mb-3 block">CSS переменные</Label>
            <div className="space-y-2 mb-4">
              {localVariables.map((variable, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={variable.name}
                    onChange={(e) => handleUpdateVariable(index, 'name', e.target.value)}
                    placeholder="Имя переменной"
                    className="flex-1"
                  />
                  <Input
                    value={variable.value}
                    onChange={(e) => handleUpdateVariable(index, 'value', e.target.value)}
                    placeholder="Значение"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVariable(index)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newVariable.name}
                onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                placeholder="Имя переменной (без --)"
                className="flex-1"
              />
              <Input
                value={newVariable.value}
                onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                placeholder="Значение"
                className="flex-1"
              />
              <Button onClick={handleAddVariable}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>
            {localVariables.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded">
                <Label className="text-xs mb-2 block">Предпросмотр:</Label>
                <pre className="text-xs font-mono">
                  {generateCSSVariablesString()}
                </pre>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-semibold mb-3 block">Media queries</Label>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {localMediaQueries.map((mq) => (
                  <Card key={mq.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Запрос</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMediaQuery(mq.id)}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                      <Select
                        value={mq.query}
                        onValueChange={(value) => handleUpdateMediaQuery(mq.id, 'query', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="(max-width: 768px)">Mobile (max-width: 768px)</SelectItem>
                          <SelectItem value="(max-width: 1024px)">Tablet (max-width: 1024px)</SelectItem>
                          <SelectItem value="(min-width: 1025px)">Desktop (min-width: 1025px)</SelectItem>
                          <SelectItem value="(max-width: 480px)">Small Mobile (max-width: 480px)</SelectItem>
                          <SelectItem value="(min-width: 769px) and (max-width: 1024px)">Tablet Only</SelectItem>
                          <SelectItem value="(min-width: 1025px)">Large Desktop (min-width: 1025px)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={mq.css}
                        onChange={(e) => handleUpdateMediaQuery(mq.id, 'css', e.target.value)}
                        className="font-mono text-xs min-h-[100px]"
                        placeholder="CSS код для этого media query..."
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 space-y-2">
              <Select
                value={newMediaQuery.query}
                onValueChange={(value) => setNewMediaQuery({ ...newMediaQuery, query: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите media query" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="(max-width: 768px)">Mobile (max-width: 768px)</SelectItem>
                  <SelectItem value="(max-width: 1024px)">Tablet (max-width: 1024px)</SelectItem>
                  <SelectItem value="(min-width: 1025px)">Desktop (min-width: 1025px)</SelectItem>
                  <SelectItem value="(max-width: 480px)">Small Mobile (max-width: 480px)</SelectItem>
                  <SelectItem value="(min-width: 769px) and (max-width: 1024px)">Tablet Only</SelectItem>
                  <SelectItem value="(min-width: 1025px)">Large Desktop (min-width: 1025px)</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                value={newMediaQuery.css}
                onChange={(e) => setNewMediaQuery({ ...newMediaQuery, css: e.target.value })}
                className="font-mono text-xs min-h-[100px]"
                placeholder="CSS код..."
              />
              <Button onClick={handleAddMediaQuery} className="w-full">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить media query
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

