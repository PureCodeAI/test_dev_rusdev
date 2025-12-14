import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface PreviewSettings {
  enabled: boolean;
  token?: string;
  password?: string;
  passwordEnabled: boolean;
  expiresAt?: string;
  expiresEnabled: boolean;
  allowedIPs?: string[];
  ipRestrictionEnabled: boolean;
  previewUrl?: string;
}

interface PreviewSettingsProps {
  projectId: number;
  previewSettings: PreviewSettings;
  onSettingsChange: (settings: PreviewSettings) => void;
  onGeneratePreview: () => Promise<string>;
}

export const PreviewSettings = ({ projectId, previewSettings, onSettingsChange, onGeneratePreview }: PreviewSettingsProps) => {
  const [localSettings, setLocalSettings] = useState<PreviewSettings>(previewSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [ipInput, setIpInput] = useState('');

  useEffect(() => {
    setLocalSettings(previewSettings);
  }, [previewSettings]);

  const updateSetting = (key: keyof PreviewSettings, value: unknown) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    try {
      const previewUrl = await onGeneratePreview();
      updateSetting('previewUrl', previewUrl);
      updateSetting('enabled', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (localSettings.previewUrl) {
      navigator.clipboard.writeText(localSettings.previewUrl);
    }
  };

  const handleAddIP = () => {
    if (ipInput.trim()) {
      const updatedIPs = [...(localSettings.allowedIPs || []), ipInput.trim()];
      updateSetting('allowedIPs', updatedIPs);
      setIpInput('');
    }
  };

  const handleRemoveIP = (ip: string) => {
    const updatedIPs = (localSettings.allowedIPs || []).filter(i => i !== ip);
    updateSetting('allowedIPs', updatedIPs);
  };

  const formatExpiresAt = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Предпросмотр</h3>
          <div className="flex items-center gap-2">
            {localSettings.enabled && (
              <Badge variant="success" className="bg-green-500">
                <Icon name="Check" size={12} className="mr-1" />
                Активен
              </Badge>
            )}
            <Button
              size="sm"
              variant={localSettings.enabled ? "outline" : "default"}
              onClick={handleGeneratePreview}
              disabled={isGenerating}
            >
              <Icon name={isGenerating ? "Loader2" : localSettings.enabled ? "RefreshCw" : "Eye"} size={16} className="mr-2" />
              {isGenerating ? 'Генерация...' : localSettings.enabled ? 'Обновить ссылку' : 'Создать предпросмотр'}
            </Button>
          </div>
        </div>

        {localSettings.previewUrl && (
          <div className="p-3 bg-muted rounded">
            <Label className="text-sm mb-2 block">Публичная ссылка для предпросмотра</Label>
            <div className="flex items-center gap-2">
              <Input
                value={localSettings.previewUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
              >
                <Icon name="Copy" size={14} className="mr-1" />
                Копировать
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(localSettings.previewUrl, '_blank')}
              >
                <Icon name="ExternalLink" size={14} className="mr-1" />
                Открыть
              </Button>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Пароль для доступа</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Требовать пароль для просмотра предпросмотра
              </p>
            </div>
            <Switch
              checked={localSettings.passwordEnabled || false}
              onCheckedChange={(checked) => {
                updateSetting('passwordEnabled', checked);
                if (checked && !localSettings.password) {
                  setShowPasswordDialog(true);
                }
              }}
            />
          </div>

          {localSettings.passwordEnabled && (
            <div className="p-3 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Пароль</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Icon name="Edit" size={12} className="mr-1" />
                  Изменить
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  value={localSettings.password ? '••••••••' : ''}
                  readOnly
                  className="flex-1"
                />
                {localSettings.password && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateSetting('password', undefined)}
                  >
                    <Icon name="X" size={12} />
                  </Button>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Ограничение по времени</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Автоматически отключить доступ после указанной даты
              </p>
            </div>
            <Switch
              checked={localSettings.expiresEnabled || false}
              onCheckedChange={(checked) => updateSetting('expiresEnabled', checked)}
            />
          </div>

          {localSettings.expiresEnabled && (
            <div className="p-3 bg-muted rounded">
              <Label className="text-sm mb-2 block">Дата истечения</Label>
              <Input
                type="datetime-local"
                value={localSettings.expiresAt ? new Date(localSettings.expiresAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  updateSetting('expiresAt', date.toISOString());
                }}
                min={new Date().toISOString().slice(0, 16)}
              />
              {localSettings.expiresAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Истекает: {formatExpiresAt(localSettings.expiresAt)}
                </p>
              )}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Ограничение по IP</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Разрешить доступ только с указанных IP-адресов
              </p>
            </div>
            <Switch
              checked={localSettings.ipRestrictionEnabled || false}
              onCheckedChange={(checked) => updateSetting('ipRestrictionEnabled', checked)}
            />
          </div>

          {localSettings.ipRestrictionEnabled && (
            <div className="p-3 bg-muted rounded space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="192.168.1.1"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddIP();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAddIP}
                  disabled={!ipInput.trim()}
                >
                  <Icon name="Plus" size={14} className="mr-1" />
                  Добавить
                </Button>
              </div>
              {localSettings.allowedIPs && localSettings.allowedIPs.length > 0 && (
                <div className="space-y-2">
                  {localSettings.allowedIPs.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                      <span className="text-sm font-mono">{ip}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveIP(ip)}
                      >
                        <Icon name="X" size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Установить пароль</DialogTitle>
            <DialogDescription>
              Введите пароль для доступа к предпросмотру
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Пароль</Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Введите пароль"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false);
              setPasswordInput('');
            }}>
              Отмена
            </Button>
            <Button onClick={() => {
              updateSetting('password', passwordInput);
              setShowPasswordDialog(false);
              setPasswordInput('');
            }} disabled={!passwordInput.trim()}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

