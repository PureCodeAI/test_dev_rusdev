import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';

interface SecurityTabProps {
  is2FAEnabled: boolean;
  setIs2FAEnabled: (value: boolean) => void;
  sessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

export const SecurityTab = ({ is2FAEnabled, setIs2FAEnabled, sessions }: SecurityTabProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorVerificationCode, setTwoFactorVerificationCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [userSessions, setUserSessions] = useState(sessions);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const loadUserData = useCallback(async () => {
    if (user?.email) {
      setUserEmail(user.email);
      return;
    }
    const email = localStorage.getItem('userEmail') || '';
    setUserEmail(email);
  }, [user?.email]);

  const loadSessions = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      setIsLoadingSessions(true);
      const response = await fetch(`${API_ENDPOINTS.login}/sessions`, {
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserSessions(data);
      }
    } catch (error) {
      // Игнорируем ошибки
    } finally {
      setIsLoadingSessions(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserData();
    loadSessions();
  }, [user, loadUserData, loadSessions]);

  const handlePasswordChange = async (data: PasswordChangeForm) => {
    setIsChangingPassword(true);
    try {
      const userId = user?.id;
      const response = await fetch(`${API_ENDPOINTS.login}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId ? String(userId) : '',
        },
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: result.error || 'Не удалось изменить пароль',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Успешно',
        description: 'Пароль успешно изменен',
      });
      reset();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить пароль',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      // Включаем 2FA - генерируем секрет
      setIsEnabling2FA(true);
      try {
        const userId = user?.id;
        const response = await fetch(`${API_ENDPOINTS.login}/2fa/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId ? String(userId) : '',
          },
        });

        const result = await response.json();

        if (!response.ok) {
          toast({
            title: 'Ошибка',
            description: result.error || 'Не удалось сгенерировать секрет',
            variant: 'destructive',
          });
          return;
        }

        setTwoFactorSecret(result.secret);
        setIs2FAEnabled(true);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось включить 2FA',
          variant: 'destructive',
        });
      } finally {
        setIsEnabling2FA(false);
      }
    } else {
      // Отключаем 2FA
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_ENDPOINTS.login}/2fa/disable`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId || '',
          },
        });

        if (!response.ok) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось отключить 2FA',
            variant: 'destructive',
          });
          return;
        }

        setIs2FAEnabled(false);
        setTwoFactorSecret(null);
        setTwoFactorVerificationCode('');
        toast({
          title: 'Успешно',
          description: '2FA отключена',
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось отключить 2FA',
          variant: 'destructive',
        });
      }
    }
  };

  const handle2FAVerification = async () => {
    if (!twoFactorSecret || !twoFactorVerificationCode) {
      toast({
        title: 'Ошибка',
        description: 'Введите код из приложения',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying2FA(true);
    try {
      const userId = user?.id;
      const response = await fetch(`${API_ENDPOINTS.login}/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId ? String(userId) : '',
        },
        body: JSON.stringify({
          secret: twoFactorSecret,
          code: twoFactorVerificationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: result.error || 'Неверный код',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Успешно',
        description: '2FA успешно активирована',
      });
      setTwoFactorVerificationCode('');
      setTwoFactorSecret(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подтвердить 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const userId = user?.id;
      if (!userId) return;
      const response = await fetch(`${API_ENDPOINTS.login}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось завершить сессию',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Успешно',
        description: 'Сессия завершена',
      });
      loadSessions();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить сессию',
        variant: 'destructive',
      });
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;
      const response = await fetch(`${API_ENDPOINTS.login}/sessions`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось завершить все сессии',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Успешно',
        description: 'Все сессии завершены',
      });
      loadSessions();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить все сессии',
        variant: 'destructive',
      });
    }
  };

  const getQRCodeURL = (secret: string): string => {
    const issuer = 'BizForge';
    const accountName = userEmail || 'user';
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Смена пароля</CardTitle>
          <CardDescription>Обновите пароль для повышения безопасности</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
            <div className="space-y-2">
              <Label>Текущий пароль</Label>
              <Input
                type="password"
                {...register('currentPassword')}
                disabled={isChangingPassword}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Новый пароль</Label>
              <Input
                type="password"
                {...register('newPassword')}
                disabled={isChangingPassword}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Подтвердите новый пароль</Label>
              <Input
                type="password"
                {...register('confirmPassword')}
                disabled={isChangingPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={18} />
                  Изменение...
                </>
              ) : (
                'Сменить пароль'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Двухфакторная аутентификация (2FA)</CardTitle>
          <CardDescription>Дополнительная защита вашего аккаунта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-muted-foreground">Google Authenticator, Authy</p>
            </div>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={handle2FAToggle}
              disabled={isEnabling2FA}
            />
          </div>
          {is2FAEnabled && twoFactorSecret && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <Alert>
                <Icon name="Info" className="h-4 w-4" />
                <AlertDescription>
                  Отсканируйте QR-код в приложении-аутентификаторе (Google Authenticator, Authy и т.д.)
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={getQRCodeURL(twoFactorSecret)}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Введите код из приложения</Label>
                <Input
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorVerificationCode}
                  onChange={(e) => setTwoFactorVerificationCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isVerifying2FA}
                />
              </div>
              <Button
                className="w-full"
                onClick={handle2FAVerification}
                disabled={isVerifying2FA || twoFactorVerificationCode.length !== 6}
              >
                {isVerifying2FA ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={18} />
                    Проверка...
                  </>
                ) : (
                  'Подтвердить'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Активные сессии</CardTitle>
          <CardDescription>Устройства, на которых выполнен вход</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingSessions ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={32} />
              <p>Загрузка сессий...</p>
            </div>
          ) : userSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Monitor" className="mx-auto mb-4 opacity-50" size={48} />
              <p>Нет активных сессий</p>
            </div>
          ) : (
            <>
              {userSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon
                        name={session.device.includes('Mac') || session.device.includes('Windows') ? 'Monitor' : 'Smartphone'}
                        size={20}
                        className="text-primary"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.current && <Badge className="bg-green-100 text-green-700">Текущая</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                      <p className="text-xs text-muted-foreground">Активна: {session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      Завершить
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleTerminateAllSessions}
              >
                Выйти со всех устройств
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
