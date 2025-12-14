import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';

const BotEditor = () => {
  const navigate = useNavigate();
  const [botName, setBotName] = useState('Новый бот');
  const [isEditingName, setIsEditingName] = useState(false);
  const [leftPanelOpen] = useState(true); // Используется для управления панелью
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const nodeTypes = [
    { id: 'message', name: 'Сообщение', icon: 'MessageSquare', desc: 'Отправить текст/медиа', color: 'blue' },
    { id: 'condition', name: 'Условие', icon: 'GitBranch', desc: 'Ветвление логики', color: 'purple' },
    { id: 'delay', name: 'Задержка', icon: 'Clock', desc: 'Умная задержка', color: 'orange' },
    { id: 'api', name: 'API-вызов', icon: 'Code', desc: 'Внешний запрос', color: 'green' },
    { id: 'payment', name: 'Платеж', icon: 'CreditCard', desc: 'Прием оплаты', color: 'yellow' },
    { id: 'menu', name: 'Меню', icon: 'List', desc: 'Кнопки выбора', color: 'indigo' },
    { id: 'gallery', name: 'Галерея', icon: 'Images', desc: 'Несколько фото', color: 'pink' },
    { id: 'video', name: 'Видео', icon: 'Video', desc: 'Отправка видео', color: 'red' },
    { id: 'file', name: 'Файл', icon: 'File', desc: 'Документы', color: 'gray' },
    { id: 'product', name: 'Товары', icon: 'ShoppingBag', desc: 'Каталог товаров', color: 'teal' },
    { id: 'note', name: 'Заметка', icon: 'StickyNote', desc: 'Комментарий', color: 'cyan' }
  ];

  const templates = [
    { id: '1', name: 'Лид-магнит', icon: 'Magnet', desc: 'Сбор контактов с подарком', color: 'green' },
    { id: '2', name: 'Интернет-магазин', icon: 'ShoppingCart', desc: 'Продажа товаров', color: 'blue' },
    { id: '3', name: 'Поддержка', icon: 'Headphones', desc: 'FAQ и техподдержка', color: 'purple' },
    { id: '4', name: 'Запись на услуги', icon: 'Calendar', desc: 'Бронирование времени', color: 'orange' },
    { id: '5', name: 'Опрос', icon: 'ListChecks', desc: 'Сбор обратной связи', color: 'pink' },
    { id: '6', name: 'Обучающий курс', icon: 'GraduationCap', desc: 'Уроки и тесты', color: 'indigo' }
  ];

  const integrations = [
    { id: 'telegram', name: 'Telegram', icon: 'Send', connected: true, color: 'blue' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', connected: false, color: 'green' },
    { id: 'vk', name: 'VK', icon: 'Share2', connected: false, color: 'indigo' },
    { id: 'chatgpt', name: 'ChatGPT', icon: 'Sparkles', connected: true, color: 'purple' },
    { id: 'sheets', name: 'Google Sheets', icon: 'Table', connected: false, color: 'green' },
    { id: 'amocrm', name: 'AmoCRM', icon: 'Users', connected: false, color: 'orange' }
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-primary/10">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          
          {isEditingName ? (
            <Input
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="w-64"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-lg font-semibold hover:text-primary transition-colors flex items-center gap-2"
            >
              <Icon name="Bot" size={20} className="text-primary" />
              {botName}
            </button>
          )}
          <Badge variant="outline" className="ml-2">Черновик</Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Icon name="Play" size={16} />
            Тестировать
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Icon name="Save" size={16} />
            Сохранить
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2">
            <Logo size={140} />
            Запустить бота
          </Button>

          <div className="h-8 w-px bg-border" />
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Icon name="Settings" size={20} />
          </Button>

          <button 
            onClick={() => navigate('/dashboard/settings')} 
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm hover:scale-110 transition-transform"
          >
            ИП
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {leftPanelOpen && (
          <aside className="w-72 border-r border-border bg-card flex flex-col shadow-sm">
            <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="nodes" className="text-xs gap-1">
                    <Icon name="Box" size={14} />
                    Узлы
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs gap-1">
                    <Icon name="Sparkles" size={14} />
                    Шаблоны
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="text-xs gap-1">
                    <Icon name="Plug" size={14} />
                    Связи
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="nodes" className="flex-1 m-0 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Библиотека узлов</h3>
                  <Badge variant="secondary">{nodeTypes.length}+</Badge>
                </div>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-2">
                    {nodeTypes.map((node) => (
                      <Card
                        key={node.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('nodeId', node.id)}
                        className="p-3 hover:shadow-md hover:border-primary/50 transition-all cursor-move group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon name={node.icon} size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{node.name}</div>
                            <div className="text-xs text-muted-foreground">{node.desc}</div>
                          </div>
                          <Icon name="GripVertical" size={16} className="text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="templates" className="flex-1 m-0 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Готовые сценарии</h3>
                  <Badge variant="secondary">{templates.length}+</Badge>
                </div>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                            <Icon name={template.icon} size={24} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{template.name}</div>
                            <div className="text-xs text-muted-foreground leading-relaxed">{template.desc}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="integrations" className="flex-1 m-0 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Интеграции</h3>
                  <Badge variant="secondary">{integrations.filter(i => i.connected).length}/{integrations.length}</Badge>
                </div>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-2">
                    {integrations.map((integration) => (
                      <Card key={integration.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name={integration.icon} size={18} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{integration.name}</div>
                          </div>
                          {integration.connected ? (
                            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                              Подключен
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm" className="text-xs">
                              Подключить
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </aside>
        )}

        <main className="flex-1 bg-muted/30 p-6 overflow-auto relative">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          
          <div className="relative h-full flex items-center justify-center">
            <div 
              className="w-full max-w-4xl"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const nodeId = e.dataTransfer.getData('nodeId');
                if (nodeId) {
                  // Обработка drop события может быть добавлена позже
                }
              }}
            >
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-xl animate-pulse" />
                  <Icon name="Workflow" size={64} className="text-primary relative z-10" />
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Создайте сценарий бота
                </h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-lg leading-relaxed">
                  Перетащите узлы из левой панели на холст и соедините их для создания логики работы бота
                </p>
                <div className="flex gap-4">
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Icon name="Wand2" size={16} />
                    AI-генерация сценария
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Sparkles" size={16} />
                    Выбрать шаблон
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Play" size={16} />
                    Открыть обучение
                  </Button>
                </div>

                <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl">
                  <Card className="p-4 border-2 border-blue-500/30 bg-blue-500/5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 mx-auto">
                      <Icon name="MessageSquare" size={20} className="text-blue-600" />
                    </div>
                    <div className="text-sm font-medium text-center">Приветствие</div>
                  </Card>
                  <div className="flex items-center justify-center">
                    <Icon name="ArrowRight" size={24} className="text-muted-foreground" />
                  </div>
                  <Card className="p-4 border-2 border-purple-500/30 bg-purple-500/5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 mx-auto">
                      <Icon name="List" size={20} className="text-purple-600" />
                    </div>
                    <div className="text-sm font-medium text-center">Меню</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 w-48 h-32 border border-border rounded-lg bg-card/80 backdrop-blur-sm shadow-lg p-2">
            <div className="text-xs text-muted-foreground mb-2">Карта сценария</div>
            <div className="w-full h-full bg-muted/30 rounded flex items-center justify-center">
              <Icon name="Map" size={24} className="text-muted-foreground opacity-50" />
            </div>
          </div>
        </main>

        {rightPanelOpen && (
          <aside className="w-80 border-l border-border bg-card flex flex-col shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name="Settings2" size={18} className="text-primary" />
                Настройки узла
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setRightPanelOpen(false)}>
                <Icon name="X" size={18} />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                <div className="text-center py-12">
                  <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Выберите узел на холсте<br />для настройки его параметров
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border space-y-2">
              <div className="text-xs font-semibold text-muted-foreground mb-3">Быстрые действия</div>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Icon name="Users" size={14} />
                Управление пользователями
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Icon name="BarChart3" size={14} />
                Статистика бота
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Icon name="History" size={14} />
                История диалогов
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BotEditor;
