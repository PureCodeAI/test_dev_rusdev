import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DomainInstructionsProps {
  type: 'subdomain' | 'custom-domain';
  subdomain?: string;
  customDomain?: string;
  serverIP?: string;
  onCopy?: (text: string) => void;
}

export const DomainInstructions = ({
  type,
  subdomain,
  customDomain,
  serverIP = '185.123.45.67',
  onCopy
}: DomainInstructionsProps) => {
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    toast({
      title: 'Скопировано',
      description: `${label} скопирован в буфер обмена`,
    });
    if (onCopy) {
      onCopy(text);
    }
  };

  const subdomainSteps = [
    {
      number: 1,
      title: 'В редакторе нажмите "Публиковать"',
      description: 'Найдите кнопку "Публиковать" в верхней панели редактора',
      icon: 'Rocket',
    },
    {
      number: 2,
      title: 'Выберите "Поддомен"',
      description: 'В диалоге публикации выберите вкладку "Поддомен"',
      icon: 'Globe',
    },
    {
      number: 3,
      title: 'Введите желаемое имя',
      description: `Введите имя поддомена (например: "${subdomain || 'my-site'}")`,
      icon: 'Edit',
    },
    {
      number: 4,
      title: 'Нажмите "Опубликовать"',
      description: 'Подтвердите публикацию, нажав кнопку "Опубликовать"',
      icon: 'CheckCircle',
    },
    {
      number: 5,
      title: 'Сайт будет доступен',
      description: `Ваш сайт будет доступен по адресу: ${subdomain ? `${subdomain}.rus.dev` : 'my-site.rus.dev'}`,
      icon: 'Link',
      code: subdomain ? `${subdomain}.rus.dev` : 'my-site.rus.dev',
    },
    {
      number: 6,
      title: 'SSL сертификат установлен автоматически',
      description: 'SSL сертификат будет установлен автоматически в течение нескольких минут',
      icon: 'Shield',
    },
  ];

  const customDomainSteps = [
    {
      number: 1,
      title: 'В редакторе нажмите "Публиковать"',
      description: 'Найдите кнопку "Публиковать" в верхней панели редактора',
      icon: 'Rocket',
    },
    {
      number: 2,
      title: 'Выберите "Собственный домен"',
      description: 'В диалоге публикации выберите вкладку "Собственный домен"',
      icon: 'Globe',
    },
    {
      number: 3,
      title: 'Введите ваш домен',
      description: `Введите ваш домен (например: "${customDomain || 'example.com'}")`,
      icon: 'Edit',
    },
    {
      number: 4,
      title: 'Настройте DNS записи',
      description: 'Настройте DNS записи в панели вашего регистратора домена',
      icon: 'Settings',
      details: true,
    },
    {
      number: 5,
      title: 'Подождите распространения DNS',
      description: 'Обычно это занимает 5-30 минут, но может занять до 48 часов',
      icon: 'Clock',
    },
    {
      number: 6,
      title: 'Нажмите "Проверить подключение"',
      description: 'После настройки DNS нажмите кнопку "Проверить подключение"',
      icon: 'RefreshCw',
    },
    {
      number: 7,
      title: 'SSL сертификат установлен автоматически',
      description: 'SSL сертификат будет установлен автоматически после проверки DNS',
      icon: 'Shield',
    },
  ];

  const dnsRecords = [
    {
      title: 'Для корневого домена (example.com)',
      description: 'Настройте одну из следующих записей:',
      records: [
        {
          type: 'CNAME',
          name: '@',
          value: 'rus.dev',
          ttl: '3600',
          description: 'Рекомендуемый вариант',
        },
        {
          type: 'A',
          name: '@',
          value: serverIP,
          ttl: '3600',
          description: 'Альтернативный вариант',
        },
      ],
    },
    {
      title: 'Для поддомена www (www.example.com)',
      description: 'Настройте CNAME запись:',
      records: [
        {
          type: 'CNAME',
          name: 'www',
          value: 'rus.dev',
          ttl: '3600',
          description: 'Для поддержки www версии сайта',
        },
      ],
    },
  ];

  const dnsCheckCommands = [
    {
      title: 'Проверка CNAME записи',
      description: 'Проверьте, что CNAME запись настроена правильно',
      commands: [
        {
          label: 'nslookup',
          command: `nslookup ${customDomain || 'example.com'}`,
          description: 'Проверка CNAME записи',
        },
        {
          label: 'dig',
          command: `dig ${customDomain || 'example.com'} CNAME`,
          description: 'Детальная проверка CNAME',
        },
      ],
    },
    {
      title: 'Проверка A записи',
      description: 'Если используете A запись вместо CNAME',
      commands: [
        {
          label: 'dig',
          command: `dig ${customDomain || 'example.com'} A`,
          description: 'Проверка A записи',
        },
        {
          label: 'nslookup',
          command: `nslookup -type=A ${customDomain || 'example.com'}`,
          description: 'Альтернативная проверка A записи',
        },
      ],
    },
    {
      title: 'Проверка с разных DNS серверов',
      description: 'Проверьте распространение DNS по всему миру',
      commands: [
        {
          label: 'Google DNS',
          command: `dig @8.8.8.8 ${customDomain || 'example.com'}`,
          description: 'Проверка через Google DNS',
        },
        {
          label: 'Cloudflare DNS',
          command: `dig @1.1.1.1 ${customDomain || 'example.com'}`,
          description: 'Проверка через Cloudflare DNS',
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {type === 'subdomain' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={20} />
              Инструкция по подключению поддомена
            </CardTitle>
            <CardDescription>
              Пошаговая инструкция для публикации сайта на поддомене
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {subdomainSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{step.number}</span>
                        </div>
                        {index < subdomainSteps.length - 1 && (
                          <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start gap-3">
                          <Icon name={step.icon as any} size={20} className="text-primary mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                            {step.code && (
                              <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                                <code className="text-xs font-mono">{step.code}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleCopy(step.code!, 'URL')}
                                >
                                  {copiedText === step.code ? (
                                    <CheckCircle2 size={14} className="text-green-600" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps">Инструкция</TabsTrigger>
            <TabsTrigger value="dns">DNS записи</TabsTrigger>
            <TabsTrigger value="check">Проверка DNS</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" size={20} />
                  Инструкция по подключению собственного домена
                </CardTitle>
                <CardDescription>
                  Пошаговая инструкция для публикации сайта на собственном домене
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {customDomainSteps.map((step, index) => (
                      <div key={index} className="relative">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">{step.number}</span>
                            </div>
                            {index < customDomainSteps.length - 1 && (
                              <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-start gap-3">
                              <Icon name={step.icon as any} size={20} className="text-primary mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                                {step.details && (
                                  <div className="mt-3 p-3 bg-muted rounded-md">
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Подробные инструкции по настройке DNS записей смотрите во вкладке "DNS записи"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dns" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings" size={20} />
                  Настройка DNS записей
                </CardTitle>
                <CardDescription>
                  Настройте DNS записи в панели вашего регистратора домена
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {dnsRecords.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
                        <div className="space-y-3">
                          {section.records.map((record, recordIndex) => (
                            <Card key={recordIndex} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline">{record.type}</Badge>
                                  <span className="text-xs text-muted-foreground">{record.description}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Имя:</span>
                                    <div className="mt-1 p-2 bg-muted rounded-md flex items-center justify-between">
                                      <code className="text-xs font-mono">{record.name}</code>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleCopy(record.name, 'Имя')}
                                      >
                                        {copiedText === record.name ? (
                                          <CheckCircle2 size={14} className="text-green-600" />
                                        ) : (
                                          <Copy size={14} />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Значение:</span>
                                    <div className="mt-1 p-2 bg-muted rounded-md flex items-center justify-between">
                                      <code className="text-xs font-mono">{record.value}</code>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleCopy(record.value, 'Значение')}
                                      >
                                        {copiedText === record.value ? (
                                          <CheckCircle2 size={14} className="text-green-600" />
                                        ) : (
                                          <Copy size={14} />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-xs">TTL:</span>
                                  <code className="text-xs font-mono ml-2">{record.ttl}</code>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                        {sectionIndex < dnsRecords.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="check" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Terminal" size={20} />
                  Команды для проверки DNS
                </CardTitle>
                <CardDescription>
                  Используйте эти команды в терминале для проверки DNS записей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {dnsCheckCommands.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
                        <div className="space-y-3">
                          {section.commands.map((cmd, cmdIndex) => (
                            <Card key={cmdIndex} className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline">{cmd.label}</Badge>
                                  <span className="text-xs text-muted-foreground">{cmd.description}</span>
                                </div>
                                <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                                  <code className="text-xs font-mono flex-1">{cmd.command}</code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 ml-2"
                                    onClick={() => handleCopy(cmd.command, 'Команда')}
                                  >
                                    {copiedText === cmd.command ? (
                                      <CheckCircle2 size={16} className="text-green-600" />
                                    ) : (
                                      <Copy size={16} />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                        {sectionIndex < dnsCheckCommands.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

