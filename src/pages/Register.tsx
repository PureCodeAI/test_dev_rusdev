import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    agreedToNewsletter: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateFullName = (name: string) => {
    const words = name.trim().split(/\s+/);
    return words.length >= 2 ? '' : 'Введите имя и фамилию';
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 ? '' : 'Некорректный номер телефона';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Некорректный email';
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Минимум 8 символов';
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Должны быть буквы и цифры';
    }
    return '';
  };

  const validateConfirmPassword = (password: string, confirm: string) => {
    return password === confirm ? '' : 'Пароли не совпадают';
  };

  const handleBlur = (field: string) => {
    let error = '';
    switch (field) {
      case 'fullName':
        error = validateFullName(formData.fullName);
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, formData.confirmPassword);
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    newErrors.fullName = validateFullName(formData.fullName);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (!formData.agreedToTerms) {
      newErrors.terms = 'Необходимо согласие на обработку данных';
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(err => err !== '');
    if (!hasErrors) {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            userType: 'entrepreneur'
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setErrors({ submit: data.error || 'Ошибка регистрации' });
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
        navigate('/dashboard');
      } catch (error) {
        setErrors({ submit: 'Ошибка сети. Попробуйте позже' });
        setIsLoading(false);
      }
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    
    if (match) {
      let formatted = '+7';
      if (match[2]) formatted += ` (${match[2]}`;
      if (match[3]) formatted += `) ${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      if (match[5]) formatted += `-${match[5]}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      const formatted = formatPhoneNumber(cleaned);
      setFormData({ ...formData, phone: formatted });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-12 flex-col justify-center animate-slide-in-left">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-8">
            <Logo size={140} className="text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Создайте аккаунт</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Начните свой путь к успешному бизнесу
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Zap" className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Быстрый старт</h3>
                <p className="text-sm text-muted-foreground">Создайте первый сайт за 5 минут после регистрации</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Shield" className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Безопасность</h3>
                <p className="text-sm text-muted-foreground">Защита данных и безопасные платежи</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Users" className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Сообщество</h3>
                <p className="text-sm text-muted-foreground">Более 10,000 предпринимателей уже с нами</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-muted-foreground italic">
              "Зарегистрируйтесь и начните создавать свой бизнес уже сегодня!"
            </p>
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

          <h2 className="text-2xl font-bold mb-2">Создать аккаунт</h2>
          <p className="text-muted-foreground mb-6">Заполните данные для регистрации</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Иван Петров"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                onBlur={() => handleBlur('fullName')}
                className={errors.fullName ? 'border-red-500' : ''}
                required
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={() => handleBlur('phone')}
                className={errors.phone ? 'border-red-500' : ''}
                required
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="ivan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur('email')}
                className={errors.email ? 'border-red-500' : ''}
                required
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Минимум 8 символов, буквы + цифры"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={() => handleBlur('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтверждение пароля <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreedToTerms: checked as boolean })
                  }
                  className={errors.terms ? 'border-red-500' : ''}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-normal">
                  Я согласен с{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    условиями обработки персональных данных
                  </a>{' '}
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms}</p>}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.agreedToNewsletter}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreedToNewsletter: checked as boolean })
                  }
                />
                <Label htmlFor="newsletter" className="text-sm leading-relaxed cursor-pointer font-normal">
                  Я хочу получать новости и специальные предложения
                </Label>
              </div>
            </div>

            {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}
            
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>Регистрация...</>
              ) : (
                <>
                  <Icon name="UserPlus" className="mr-2" size={18} />
                  Зарегистрироваться
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
              Продолжить через Google
            </Button>
            <Button variant="outline" className="w-full" type="button">
              <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Продолжить через VK
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Уже есть аккаунт? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline"
            >
              Войти
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;