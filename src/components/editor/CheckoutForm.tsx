import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface CheckoutFormProps {
  onComplete?: (orderData: Record<string, unknown>) => void;
  className?: string;
}

export const CheckoutForm = ({ onComplete, className }: CheckoutFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
    deliveryMethod: 'courier',
    comment: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'fullName':
        return value.trim().length < 2 ? 'Минимум 2 символа' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Некорректный email' : '';
      case 'phone':
        const phoneRegex = /^\+?[\d\s()-]+$/;
        return !phoneRegex.test(value) || value.replace(/\D/g, '').length < 10 ? 'Некорректный телефон' : '';
      case 'address':
        return value.trim().length < 5 ? 'Минимум 5 символов' : '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'comment' && key !== 'paymentMethod' && key !== 'deliveryMethod') {
        const error = validateField(key, value);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && onComplete) {
      onComplete(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">ФИО *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              className={cn(errors.fullName && 'border-destructive')}
            />
            {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={cn(errors.email && 'border-destructive')}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className={cn(errors.phone && 'border-destructive')}
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Доставка</h3>
        <div className="space-y-4">
          <div>
            <Label>Способ доставки</Label>
            <RadioGroup
              value={formData.deliveryMethod}
              onValueChange={(value) => handleFieldChange('deliveryMethod', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="courier" id="courier" />
                <Label htmlFor="courier" className="cursor-pointer">Курьером</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="cursor-pointer">Самовывоз</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="post" id="post" />
                <Label htmlFor="post" className="cursor-pointer">Почтой</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              className={cn(errors.address && 'border-destructive')}
            />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Индекс</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Оплата</h3>
        <RadioGroup
          value={formData.paymentMethod}
          onValueChange={(value) => handleFieldChange('paymentMethod', value)}
        >
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="cursor-pointer flex items-center gap-2">
              <Icon name="CreditCard" size={16} />
              Банковская карта
            </Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="cursor-pointer flex items-center gap-2">
              <Icon name="Wallet" size={16} />
              PayPal
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="cursor-pointer flex items-center gap-2">
              <Icon name="Banknote" size={16} />
              Наличными при получении
            </Label>
          </div>
        </RadioGroup>
      </Card>

      <div>
        <Label htmlFor="comment">Комментарий к заказу</Label>
        <Textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => handleFieldChange('comment', e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" size="lg">
        Оформить заказ
      </Button>
    </form>
  );
};

