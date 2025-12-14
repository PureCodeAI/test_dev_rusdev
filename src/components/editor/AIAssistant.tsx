import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { callAI } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import type { AIMessage } from '@/types/ai';

interface AIAssistantProps {
  blockType?: string;
  blockContent?: Record<string, unknown>;
  blockStyles?: Record<string, unknown>;
  onContentGenerated?: (content: string) => void;
  onImageSuggestion?: (description: string) => void;
  onDesignSuggestion?: (suggestion: string) => void;
  onSEOSuggestion?: (suggestion: string) => void;
}

type GenerationType = 'text' | 'image' | 'design' | 'seo';

export const AIAssistant = ({
  blockType,
  blockContent,
  blockStyles,
  onContentGenerated,
  onImageSuggestion,
  onDesignSuggestion,
  onSEOSuggestion
}: AIAssistantProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<GenerationType>('text');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ type: string; text: string; action?: () => void }>>([]);

  const generateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите запрос для генерации текста",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const systemPrompt = `Ты эксперт по созданию контента для веб-сайтов. 
Создай качественный текст для блока типа "${blockType || 'контент'}".
Текст должен быть информативным, интересным и подходящим для веб-сайта.
Верни только текст без дополнительных комментариев.`;

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Запрос пользователя: ${prompt}\n\n${blockContent ? `Текущий контент блока: ${JSON.stringify(blockContent)}` : ''}`
        }
      ];

      const response = await callAI(messages, 'site', {
        temperature: 0.8,
        max_tokens: 1000
      });

      if (response?.content) {
        setGeneratedContent(response.content);
        if (onContentGenerated) {
          onContentGenerated(response.content);
        }
        toast({
          title: "Текст сгенерирован",
          description: "Текст успешно создан"
        });
      } else {
        throw new Error('Не удалось сгенерировать текст');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сгенерировать текст",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageDescription = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите описание для генерации изображения",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const systemPrompt = `Ты эксперт по созданию описаний изображений для веб-сайтов.
Создай детальное описание изображения, которое подходит для блока типа "${blockType || 'контент'}".
Описание должно быть понятным для генерации изображения через AI.
Верни только описание без дополнительных комментариев.`;

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Запрос пользователя: ${prompt}\n\n${blockContent ? `Контекст блока: ${JSON.stringify(blockContent)}` : ''}`
        }
      ];

      const response = await callAI(messages, 'site', {
        temperature: 0.7,
        max_tokens: 500
      });

      if (response?.content) {
        setGeneratedContent(response.content);
        if (onImageSuggestion) {
          onImageSuggestion(response.content);
        }
        toast({
          title: "Описание создано",
          description: "Описание изображения готово к использованию"
        });
      } else {
        throw new Error('Не удалось создать описание');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать описание",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDesignSuggestions = async () => {
    setIsGenerating(true);
    try {
      const systemPrompt = `Ты эксперт по веб-дизайну и UX/UI.
Проанализируй текущий дизайн блока и предложи улучшения.
Учитывай тип блока "${blockType || 'контент'}" и его стили.
Предложи конкретные улучшения по цветам, типографике, отступам, анимациям.
Верни список предложений, каждое на новой строке с маркером "-".`;

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Тип блока: ${blockType || 'неизвестно'}\n\nСтили блока: ${blockStyles ? JSON.stringify(blockStyles, null, 2) : 'не заданы'}\n\nКонтент блока: ${blockContent ? JSON.stringify(blockContent, null, 2) : 'не задан'}`
        }
      ];

      const response = await callAI(messages, 'site', {
        temperature: 0.7,
        max_tokens: 1000
      });

      if (response?.content) {
        const suggestionsList = response.content
          .split('\n')
          .filter(line => line.trim() && (line.trim().startsWith('-') || line.trim().startsWith('•')))
          .map(line => ({
            type: 'design',
            text: line.trim().replace(/^[-•]\s*/, ''),
            action: () => {
              toast({
                title: "Предложение",
                description: line.trim()
              });
            }
          }));
        
        setSuggestions(suggestionsList);
        setGeneratedContent(response.content);
        if (onDesignSuggestion) {
          onDesignSuggestion(response.content);
        }
        toast({
          title: "Предложения готовы",
          description: `Создано ${suggestionsList.length} предложений по улучшению дизайна`
        });
      } else {
        throw new Error('Не удалось создать предложения');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать предложения",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSEOSuggestions = async () => {
    setIsGenerating(true);
    try {
      const systemPrompt = `Ты эксперт по SEO оптимизации веб-сайтов.
Проанализируй контент блока и предложи улучшения для SEO.
Учитывай тип блока "${blockType || 'контент'}" и его контент.
Предложи улучшения по ключевым словам, мета-тегам, структуре контента, заголовкам.
Верни список предложений, каждое на новой строке с маркером "-".`;

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Тип блока: ${blockType || 'неизвестно'}\n\nКонтент блока: ${blockContent ? JSON.stringify(blockContent, null, 2) : 'не задан'}`
        }
      ];

      const response = await callAI(messages, 'site', {
        temperature: 0.7,
        max_tokens: 1000
      });

      if (response?.content) {
        const suggestionsList = response.content
          .split('\n')
          .filter(line => line.trim() && (line.trim().startsWith('-') || line.trim().startsWith('•')))
          .map(line => ({
            type: 'seo',
            text: line.trim().replace(/^[-•]\s*/, ''),
            action: () => {
              toast({
                title: "SEO предложение",
                description: line.trim()
              });
            }
          }));
        
        setSuggestions(suggestionsList);
        setGeneratedContent(response.content);
        if (onSEOSuggestion) {
          onSEOSuggestion(response.content);
        }
        toast({
          title: "SEO предложения готовы",
          description: `Создано ${suggestionsList.length} предложений по SEO`
        });
      } else {
        throw new Error('Не удалось создать предложения');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать предложения",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    switch (activeTab) {
      case 'text':
        generateText();
        break;
      case 'image':
        generateImageDescription();
        break;
      case 'design':
        generateDesignSuggestions();
        break;
      case 'seo':
        generateSEOSuggestions();
        break;
    }
  };

  const quickPrompts = {
    text: [
      'Создай приветственный текст для главной страницы',
      'Напиши описание продукта',
      'Создай призыв к действию (CTA)',
      'Напиши текст для секции "О нас"'
    ],
    image: [
      'Опиши изображение для hero-секции',
      'Создай описание фонового изображения',
      'Опиши иконку для кнопки',
      'Создай описание изображения продукта'
    ]
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Icon name="Sparkles" size={20} className="text-primary" />
          AI Помощник
        </h3>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
          Beta
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GenerationType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text">Текст</TabsTrigger>
          <TabsTrigger value="image">Изображение</TabsTrigger>
          <TabsTrigger value="design">Дизайн</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label>Запрос для генерации текста</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Опишите, какой текст вам нужен..."
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Быстрые шаблоны</Label>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.text.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(template)}
                      className="text-xs"
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={16} className="mr-2" />
                    Сгенерировать текст
                  </>
                )}
              </Button>
              {generatedContent && (
                <div className="space-y-2">
                  <Label>Сгенерированный текст</Label>
                  <ScrollArea className="h-32 border rounded p-3">
                    <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                  </ScrollArea>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onContentGenerated) {
                        onContentGenerated(generatedContent);
                      }
                    }}
                    className="w-full"
                  >
                    <Icon name="Check" size={14} className="mr-2" />
                    Применить к блоку
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label>Описание изображения</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Опишите изображение, которое нужно создать..."
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Быстрые шаблоны</Label>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.image.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(template)}
                      className="text-xs"
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Icon name="Image" size={16} className="mr-2" />
                    Создать описание
                  </>
                )}
              </Button>
              {generatedContent && (
                <div className="space-y-2">
                  <Label>Описание изображения</Label>
                  <ScrollArea className="h-32 border rounded p-3">
                    <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                  </ScrollArea>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onImageSuggestion) {
                        onImageSuggestion(generatedContent);
                      }
                    }}
                    className="w-full"
                  >
                    <Icon name="Check" size={14} className="mr-2" />
                    Использовать описание
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label>Предложения по улучшению дизайна</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  AI проанализирует текущий дизайн блока и предложит улучшения
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Анализ...
                  </>
                ) : (
                  <>
                    <Icon name="Palette" size={16} className="mr-2" />
                    Получить предложения
                  </>
                )}
              </Button>
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <Label>Предложения по дизайну</Label>
                  <ScrollArea className="h-64 border rounded p-3">
                    <div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 bg-muted rounded text-sm flex items-start gap-2"
                        >
                          <Icon name="Lightbulb" size={16} className="text-yellow-600 mt-0.5" />
                          <span className="flex-1">{suggestion.text}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              {generatedContent && suggestions.length === 0 && (
                <div className="space-y-2">
                  <Label>Полный ответ AI</Label>
                  <ScrollArea className="h-64 border rounded p-3">
                    <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                  </ScrollArea>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label>Предложения по SEO оптимизации</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  AI проанализирует контент блока и предложит улучшения для SEO
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Анализ...
                  </>
                ) : (
                  <>
                    <Icon name="Search" size={16} className="mr-2" />
                    Получить SEO предложения
                  </>
                )}
              </Button>
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <Label>SEO предложения</Label>
                  <ScrollArea className="h-64 border rounded p-3">
                    <div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 bg-muted rounded text-sm flex items-start gap-2"
                        >
                          <Icon name="TrendingUp" size={16} className="text-green-600 mt-0.5" />
                          <span className="flex-1">{suggestion.text}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              {generatedContent && suggestions.length === 0 && (
                <div className="space-y-2">
                  <Label>Полный ответ AI</Label>
                  <ScrollArea className="h-64 border rounded p-3">
                    <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                  </ScrollArea>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

