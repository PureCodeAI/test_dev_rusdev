import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AnalyticsData {
  googleAnalytics?: {
    enabled: boolean;
    trackingId?: string;
    measurementId?: string;
  };
  yandexMetrika?: {
    enabled: boolean;
    counterId?: string;
    clickmap?: boolean;
    trackLinks?: boolean;
    accurateTrackBounce?: boolean;
    webvisor?: boolean;
    trackHash?: boolean;
  };
  facebookPixel?: {
    enabled: boolean;
    pixelId?: string;
  };
  hotjar?: {
    enabled: boolean;
    siteId?: string;
  };
  googleTagManager?: {
    enabled: boolean;
    containerId?: string;
  };
}

interface AnalyticsEditorProps {
  analyticsData?: AnalyticsData;
  onAnalyticsDataChange?: (data: AnalyticsData) => void;
}

export const AnalyticsEditor = ({ analyticsData = {}, onAnalyticsDataChange }: AnalyticsEditorProps) => {
  const [localData, setLocalData] = useState<AnalyticsData>(analyticsData);

  useEffect(() => {
    setLocalData(analyticsData);
  }, [analyticsData]);

  const updateField = (service: keyof AnalyticsData, field: string, value: string | boolean) => {
    const updated = {
      ...localData,
      [service]: {
        ...localData[service],
        [field]: value
      }
    };
    setLocalData(updated);
    if (onAnalyticsDataChange) {
      onAnalyticsDataChange(updated);
    }
  };

  const generateGoogleAnalyticsCode = (): string => {
    if (!localData.googleAnalytics?.enabled || !localData.googleAnalytics?.measurementId) {
      return '';
    }

    return `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${localData.googleAnalytics.measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${localData.googleAnalytics.measurementId}');
</script>`;
  };

  const generateYandexMetrikaCode = (): string => {
    if (!localData.yandexMetrika?.enabled || !localData.yandexMetrika?.counterId) {
      return '';
    }

    const options: string[] = [];
    if (localData.yandexMetrika.clickmap) options.push('clickmap: true');
    if (localData.yandexMetrika.trackLinks) options.push('trackLinks: true');
    if (localData.yandexMetrika.accurateTrackBounce) options.push('accurateTrackBounce: true');
    if (localData.yandexMetrika.webvisor) options.push('webvisor: true');
    if (localData.yandexMetrika.trackHash) options.push('trackHash: true');

    return `<!-- Yandex.Metrika counter -->
<script type="text/javascript">
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  ym(${localData.yandexMetrika.counterId}, "init", {
    ${options.join(',\n    ')}
  });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${localData.yandexMetrika.counterId}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`;
  };

  const generateFacebookPixelCode = (): string => {
    if (!localData.facebookPixel?.enabled || !localData.facebookPixel?.pixelId) {
      return '';
    }

    return `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${localData.facebookPixel.pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${localData.facebookPixel.pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`;
  };

  const generateHotjarCode = (): string => {
    if (!localData.hotjar?.enabled || !localData.hotjar?.siteId) {
      return '';
    }

    return `<!-- Hotjar Tracking Code -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:${localData.hotjar.siteId},hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>`;
  };

  const generateGoogleTagManagerCode = (): string => {
    if (!localData.googleTagManager?.enabled || !localData.googleTagManager?.containerId) {
      return '';
    }

    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${localData.googleTagManager.containerId}');</script>
<!-- End Google Tag Manager -->`;
  };

  const generateAllCode = (): string => {
    const codes: string[] = [];
    
    if (localData.googleAnalytics?.enabled) {
      codes.push(generateGoogleAnalyticsCode());
    }
    if (localData.yandexMetrika?.enabled) {
      codes.push(generateYandexMetrikaCode());
    }
    if (localData.facebookPixel?.enabled) {
      codes.push(generateFacebookPixelCode());
    }
    if (localData.hotjar?.enabled) {
      codes.push(generateHotjarCode());
    }
    if (localData.googleTagManager?.enabled) {
      codes.push(generateGoogleTagManagerCode());
    }

    return codes.filter(Boolean).join('\n\n');
  };

  return (
    <Card className="p-4">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Интеграции аналитики</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Настройте интеграции с сервисами аналитики для отслеживания посетителей и поведения на сайте
          </p>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-6 pr-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Google Analytics</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Отслеживание посетителей и поведения на сайте
                  </p>
                </div>
                <Switch
                  checked={localData.googleAnalytics?.enabled || false}
                  onCheckedChange={(checked) => updateField('googleAnalytics', 'enabled', checked)}
                />
              </div>
              {localData.googleAnalytics?.enabled && (
                <div className="ml-4 space-y-3 pl-4 border-l-2">
                  <div>
                    <Label className="mb-2 block">Measurement ID (G-XXXXXXXXXX)</Label>
                    <Input
                      value={localData.googleAnalytics?.measurementId || ''}
                      onChange={(e) => updateField('googleAnalytics', 'measurementId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Найти в Google Analytics → Администратор → Потоки данных
                    </p>
                  </div>
                  <div>
                    <Label className="mb-2 block">Tracking ID (UA-XXXXXXXXX-X) - устаревший</Label>
                    <Input
                      value={localData.googleAnalytics?.trackingId || ''}
                      onChange={(e) => updateField('googleAnalytics', 'trackingId', e.target.value)}
                      placeholder="UA-XXXXXXXXX-X"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Яндекс Метрика</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Российская аналитика с тепловыми картами и записями сессий
                  </p>
                </div>
                <Switch
                  checked={localData.yandexMetrika?.enabled || false}
                  onCheckedChange={(checked) => updateField('yandexMetrika', 'enabled', checked)}
                />
              </div>
              {localData.yandexMetrika?.enabled && (
                <div className="ml-4 space-y-3 pl-4 border-l-2">
                  <div>
                    <Label className="mb-2 block">ID счетчика</Label>
                    <Input
                      value={localData.yandexMetrika?.counterId || ''}
                      onChange={(e) => updateField('yandexMetrika', 'counterId', e.target.value)}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ym-clickmap" className="text-sm">Карта кликов</Label>
                      <Switch
                        id="ym-clickmap"
                        checked={localData.yandexMetrika?.clickmap || false}
                        onCheckedChange={(checked) => updateField('yandexMetrika', 'clickmap', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ym-tracklinks" className="text-sm">Отслеживание ссылок</Label>
                      <Switch
                        id="ym-tracklinks"
                        checked={localData.yandexMetrika?.trackLinks || false}
                        onCheckedChange={(checked) => updateField('yandexMetrika', 'trackLinks', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ym-bounce" className="text-sm">Точный показатель отказов</Label>
                      <Switch
                        id="ym-bounce"
                        checked={localData.yandexMetrika?.accurateTrackBounce || false}
                        onCheckedChange={(checked) => updateField('yandexMetrika', 'accurateTrackBounce', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ym-webvisor" className="text-sm">Вебвизор</Label>
                      <Switch
                        id="ym-webvisor"
                        checked={localData.yandexMetrika?.webvisor || false}
                        onCheckedChange={(checked) => updateField('yandexMetrika', 'webvisor', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ym-hash" className="text-sm">Отслеживание хеша</Label>
                      <Switch
                        id="ym-hash"
                        checked={localData.yandexMetrika?.trackHash || false}
                        onCheckedChange={(checked) => updateField('yandexMetrika', 'trackHash', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Facebook Pixel</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Отслеживание конверсий для рекламы в Facebook
                  </p>
                </div>
                <Switch
                  checked={localData.facebookPixel?.enabled || false}
                  onCheckedChange={(checked) => updateField('facebookPixel', 'enabled', checked)}
                />
              </div>
              {localData.facebookPixel?.enabled && (
                <div className="ml-4 space-y-3 pl-4 border-l-2">
                  <div>
                    <Label className="mb-2 block">Pixel ID</Label>
                    <Input
                      value={localData.facebookPixel?.pixelId || ''}
                      onChange={(e) => updateField('facebookPixel', 'pixelId', e.target.value)}
                      placeholder="123456789012345"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Найти в Facebook Events Manager
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Hotjar</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Тепловые карты, записи сессий и опросы
                  </p>
                </div>
                <Switch
                  checked={localData.hotjar?.enabled || false}
                  onCheckedChange={(checked) => updateField('hotjar', 'enabled', checked)}
                />
              </div>
              {localData.hotjar?.enabled && (
                <div className="ml-4 space-y-3 pl-4 border-l-2">
                  <div>
                    <Label className="mb-2 block">Site ID</Label>
                    <Input
                      value={localData.hotjar?.siteId || ''}
                      onChange={(e) => updateField('hotjar', 'siteId', e.target.value)}
                      placeholder="1234567"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Найти в Hotjar → Settings → Site Settings
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Google Tag Manager</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Управление всеми тегами аналитики из одного места
                  </p>
                </div>
                <Switch
                  checked={localData.googleTagManager?.enabled || false}
                  onCheckedChange={(checked) => updateField('googleTagManager', 'enabled', checked)}
                />
              </div>
              {localData.googleTagManager?.enabled && (
                <div className="ml-4 space-y-3 pl-4 border-l-2">
                  <div>
                    <Label className="mb-2 block">Container ID (GTM-XXXXXXX)</Label>
                    <Input
                      value={localData.googleTagManager?.containerId || ''}
                      onChange={(e) => updateField('googleTagManager', 'containerId', e.target.value)}
                      placeholder="GTM-XXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Найти в Google Tag Manager → Контейнер → ID контейнера
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4 bg-muted rounded">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold">Предпросмотр кода</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const code = generateAllCode();
                navigator.clipboard.writeText(code);
              }}
            >
              <Icon name="Copy" size={14} className="mr-2" />
              Копировать код
            </Button>
          </div>
          <ScrollArea className="h-[200px]">
            <pre className="text-xs font-mono">
              {generateAllCode() || 'Включите хотя бы одну интеграцию для предпросмотра кода'}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};

