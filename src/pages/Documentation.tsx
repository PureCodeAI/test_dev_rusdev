import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Documentation = () => {
  const sections = [
    {
      title: 'API Документация',
      description: 'Интеграция с платформой через REST API',
      icon: 'Code',
      content: 'Полная документация по REST API для разработчиков. Примеры запросов, ответы, коды ошибок.',
    },
    {
      title: 'Руководства',
      description: 'Пошаговые инструкции по использованию',
      icon: 'BookOpen',
      content: 'Детальные руководства по всем функциям платформы: от базовых до продвинутых.',
    },
    {
      title: 'Примеры кода',
      description: 'Готовые примеры интеграций',
      icon: 'FileCode',
      content: 'Примеры кода на различных языках программирования для быстрого старта.',
    },
    {
      title: 'SDK и библиотеки',
      description: 'Готовые библиотеки для разработки',
      icon: 'Package',
      content: 'SDK для популярных языков программирования: JavaScript, Python, PHP, Java.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Документация</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Полная техническая документация для разработчиков и пользователей
            </p>
          </div>

          <Tabs defaultValue="api" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="guides">Руководства</TabsTrigger>
              <TabsTrigger value="examples">Примеры</TabsTrigger>
              <TabsTrigger value="sdk">SDK</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>REST API</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    BizForge предоставляет REST API для интеграции с вашими приложениями.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Базовый URL</h3>
                      <code className="block p-3 bg-slate-100 rounded text-sm">https://api.bizforge.ru/v1</code>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Аутентификация</h3>
                      <p className="text-slate-600 text-sm">
                        Используйте API ключ в заголовке Authorization: Bearer YOUR_API_KEY
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {sections.map((section, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name={section.icon} size={20} className="text-primary" />
                        <CardTitle>{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">{section.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Примеры использования API</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">JavaScript</h3>
                      <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`fetch('https://api.bizforge.ru/v1/sites', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Site',
    template: 'business'
  })
})`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sdk" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {['JavaScript', 'Python', 'PHP', 'Java'].map((lang, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{lang}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        <Icon name="Download" className="mr-2" size={16} />
                        Скачать SDK
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Documentation;


