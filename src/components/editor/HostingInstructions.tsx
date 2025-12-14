import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface HostingInstructionsProps {
  onClose?: () => void;
}

export const HostingInstructions = ({ onClose }: HostingInstructionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Icon name="Server" size={20} className="text-primary" />
            Инструкции по загрузке на хостинг
          </h3>
          <p className="text-sm text-muted-foreground">
            Пошаговые инструкции для популярных хостингов
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={16} />
          </button>
        )}
      </div>

      <Tabs defaultValue="timeweb" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeweb">Timeweb</TabsTrigger>
          <TabsTrigger value="regru">Reg.ru</TabsTrigger>
          <TabsTrigger value="beget">Beget</TabsTrigger>
          <TabsTrigger value="general">Общие</TabsTrigger>
        </TabsList>

        <TabsContent value="timeweb" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeweb</CardTitle>
              <CardDescription>Инструкция по загрузке сайта на Timeweb</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Войдите в панель управления</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте сайт timeweb.com и войдите в личный кабинет используя ваши учетные данные
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Откройте "Файловый менеджер"</h4>
                      <p className="text-sm text-muted-foreground">
                        В панели управления найдите раздел "Файлы" и откройте "Файловый менеджер"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Перейдите в папку public_html</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте папку public_html - это корневая папка вашего сайта
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">4</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Загрузите файлы</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Распакуйте ZIP архив на вашем компьютере и загрузите все файлы в папку public_html
                      </p>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">
                          Используйте кнопку "Загрузить" в файловом менеджере или перетащите файлы
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">5</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Проверьте index.html</h4>
                      <p className="text-sm text-muted-foreground">
                        Убедитесь, что файл index.html находится в корне папки public_html
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">6</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Проверьте сайт</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте ваш домен в браузере и убедитесь, что сайт загружается корректно
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regru" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reg.ru</CardTitle>
              <CardDescription>Инструкция по загрузке сайта на Reg.ru</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Войдите в панель управления</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте сайт reg.ru и войдите в личный кабинет
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Откройте "Файловый менеджер"</h4>
                      <p className="text-sm text-muted-foreground">
                        В разделе "Хостинг" найдите "Файловый менеджер"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Перейдите в папку www</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте папку www - это корневая папка вашего сайта на Reg.ru
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">4</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Загрузите файлы</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Распакуйте ZIP архив и загрузите все файлы в папку www
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">5</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Настройте индексный файл</h4>
                      <p className="text-sm text-muted-foreground">
                        Убедитесь, что index.html установлен как индексный файл в настройках хостинга
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">6</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Проверьте сайт</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте ваш домен в браузере для проверки
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beget" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Beget</CardTitle>
              <CardDescription>Инструкция по загрузке сайта на Beget</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Войдите в панель управления</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте сайт beget.com и войдите в личный кабинет
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Откройте "Файловый менеджер"</h4>
                      <p className="text-sm text-muted-foreground">
                        В разделе "Хостинг" найдите "Файловый менеджер"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Перейдите в папку public_html</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте папку public_html - это корневая папка вашего сайта
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">4</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Загрузите файлы</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Распакуйте ZIP архив и загрузите все файлы в папку public_html
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">5</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Проверьте права доступа</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Установите правильные права доступа:
                      </p>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">
                          <strong>Папки:</strong> 755 (rwxr-xr-x)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Файлы:</strong> 644 (rw-r--r--)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">6</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Проверьте сайт</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте ваш домен в браузере для проверки работы сайта
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Общие инструкции</CardTitle>
              <CardDescription>Универсальные инструкции для любого хостинга</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Upload" size={16} />
                      Загрузка через FTP/SFTP
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground ml-6">
                      <p>1. Используйте FTP клиент (FileZilla, WinSCP, Cyberduck и т.д.)</p>
                      <p>2. Подключитесь к хостингу используя FTP данные (хост, логин, пароль)</p>
                      <p>3. Перейдите в корневую папку сайта (public_html, www или htdocs)</p>
                      <p>4. Загрузите все файлы из распакованного архива</p>
                      <p>5. Убедитесь, что структура папок сохранена</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Folder" size={16} />
                      Загрузка через файловый менеджер
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground ml-6">
                      <p>1. Войдите в панель управления хостингом</p>
                      <p>2. Откройте файловый менеджер</p>
                      <p>3. Перейдите в корневую папку сайта</p>
                      <p>4. Используйте кнопку "Загрузить" или перетащите файлы</p>
                      <p>5. Дождитесь завершения загрузки</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Globe" size={16} />
                      Настройка домена
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground ml-6">
                      <p>1. Убедитесь, что домен привязан к хостингу</p>
                      <p>2. Проверьте DNS записи:</p>
                      <div className="p-3 bg-muted rounded-md mt-2">
                        <p className="text-xs mb-1"><strong>A запись:</strong> должна указывать на IP сервера</p>
                        <p className="text-xs mb-1"><strong>CNAME:</strong> для www поддомена (если используется)</p>
                        <p className="text-xs">Дождитесь распространения DNS (обычно 24-48 часов)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} />
                      Проверка работы сайта
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground ml-6">
                      <p>1. Откройте ваш сайт в браузере</p>
                      <p>2. Проверьте, что все страницы загружаются</p>
                      <p>3. Проверьте отображение изображений</p>
                      <p>4. Проверьте применение стилей</p>
                      <p>5. Проверьте работу форм и интерактивных элементов</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Shield" size={16} />
                      Права доступа
                    </h4>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        <strong>Папки:</strong> 755 (rwxr-xr-x) - владелец может читать, писать, выполнять; остальные - читать и выполнять
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Файлы:</strong> 644 (rw-r--r--) - владелец может читать и писать; остальные - только читать
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

