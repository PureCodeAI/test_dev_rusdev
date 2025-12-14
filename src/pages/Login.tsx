import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginToken, setLoginToken] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Если пользователь уже авторизован, редиректим на dashboard или исходную страницу
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Если требуется 2FA, отправляем код
      if (requires2FA) {
        const response = await fetch(`${API_ENDPOINTS.login}/2fa/verify-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: loginToken,
            code: twoFactorCode,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Неверный код');
          setIsLoading(false);
          return;
        }
        
        setUser({
          id: data.userId,
          fullName: data.fullName,
          email: data.email,
          userType: data.userType,
          token: data.token,
        });
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
        return;
      }
      
      // Обычный вход
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Ошибка авторизации');
        setIsLoading(false);
        return;
      }
      
      // Проверяем, требуется ли 2FA
      if (data.requires_2fa) {
        setRequires2FA(true);
        setLoginToken(data.temp_token);
        setIsLoading(false);
        return;
      }
      
      setUser({
        id: data.userId,
        fullName: data.fullName,
        email: data.email,
        userType: data.userType,
        token: data.token,
      });
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-12 flex-col justify-center animate-slide-in-left">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-8">
            <Logo size={140} className="text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">С возвращением!</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Войдите, чтобы продолжить работу с вашими проектами
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="BarChart3" className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Аналитика в реальном времени</h3>
                <p className="text-sm text-muted-foreground">Отслеживайте показатели бизнеса</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Sparkles" className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-ассистент</h3>
                <p className="text-sm text-muted-foreground">Умный помощник для решения задач</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Zap" className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Автоматизация</h3>
                <p className="text-sm text-muted-foreground">Экономьте время на рутинных задачах</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">10K+</div>
              <div className="text-sm text-muted-foreground">Пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">Проектов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">99%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 animate-slide-in-right">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 -ml-2"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            На главную
          </Button>

          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <Logo size={140} className="text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Войти в аккаунт</h2>
          <p className="text-muted-foreground mb-6">Введите данные для входа</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!requires2FA ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone">Email или телефон</Label>
                  <div className="relative">
                    <Input
                      id="emailOrPhone"
                      type="text"
                      placeholder="ivan@example.com или +7 (999) 123-45-67"
                      value={formData.emailOrPhone}
                      onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                    <Icon name="User" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Пароль</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Забыли пароль?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Введите пароль"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <Icon name="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon name="Shield" className="text-blue-600 mt-0.5" size={20} />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Требуется двухфакторная аутентификация</p>
                      <p className="text-sm text-blue-700">
                        Введите код из приложения-аутентификатора
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Код из приложения</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest font-mono"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFactorCode('');
                    setLoginToken('');
                  }}
                >
                  Назад
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
              />
              <Label htmlFor="rememberMe" className="text-sm cursor-pointer font-normal">
                Запомнить меня
              </Label>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>Вход...</>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2" size={18} />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full" type="button">
              <Icon name="Mail" className="mr-2" size={18} />
              Войти через Google
            </Button>
            <Button variant="outline" className="w-full" type="button">
              <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Войти через VK
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Нет аккаунта? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-primary font-medium hover:underline"
            >
              Зарегистрироваться
            </button>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Входя в систему, вы соглашаетесь с{' '}
              <a href="#" className="text-primary hover:underline">
                пользовательским соглашением
              </a>{' '}
              и{' '}
              <a href="#" className="text-primary hover:underline">
                политикой конфиденциальности
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;