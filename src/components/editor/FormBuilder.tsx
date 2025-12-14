import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'password' 
  | 'number' 
  | 'date' 
  | 'time' 
  | 'datetime-local' 
  | 'month' 
  | 'week' 
  | 'url' 
  | 'search' 
  | 'color' 
  | 'range' 
  | 'file' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'switch';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  options?: string[];
  conditional?: {
    fieldId: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number | boolean;
  };
  value?: string | number | boolean | string[];
}

interface FormBuilderProps {
  fields: FormField[];
  onSubmit?: (data: Record<string, unknown>) => void;
  onFieldsChange?: (fields: FormField[]) => void;
  className?: string;
}

export const FormBuilder = ({ fields, onSubmit, onFieldsChange, className }: FormBuilderProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional) return true;
    
    const conditionalField = fields.find(f => f.id === field.conditional!.fieldId);
    if (!conditionalField) return true;

    const conditionalValue = formData[conditionalField.id];
    const { operator, value } = field.conditional;

    switch (operator) {
      case 'equals':
        return conditionalValue === value;
      case 'notEquals':
        return conditionalValue !== value;
      case 'contains':
        return String(conditionalValue || '').includes(String(value));
      case 'greaterThan':
        return Number(conditionalValue) > Number(value);
      case 'lessThan':
        return Number(conditionalValue) < Number(value);
      default:
        return true;
    }
  };

  const validateField = (field: FormField, value: unknown): string => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Это поле обязательно для заполнения';
    }

    if (!field.validation || !value) return '';

    const { min, max, minLength, maxLength, pattern, message } = field.validation;

    if (typeof value === 'string') {
      if (minLength !== undefined && value.length < minLength) {
        return message || `Минимум ${minLength} символов`;
      }
      if (maxLength !== undefined && value.length > maxLength) {
        return message || `Максимум ${maxLength} символов`;
      }
      if (pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return message || 'Неверный формат';
        }
      }
    }

    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return message || `Минимум ${min}`;
      }
      if (max !== undefined && value > max) {
        return message || `Максимум ${max}`;
      }
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) {
        return 'Некорректный email';
      }
    }

    if (field.type === 'url' && value) {
      try {
        new URL(value as string);
      } catch {
        return 'Некорректный URL';
      }
    }

    return '';
  };

  const handleFieldChange = (fieldId: string, value: unknown) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);

    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldId]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (isFieldVisible(field)) {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && onSubmit) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const fieldValue = formData[field.id] ?? field.value ?? '';
    const error = errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={fieldValue as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={cn(error && 'border-destructive')}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue as string}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className={cn(error && 'border-destructive')}>
                <SelectValue placeholder={field.placeholder || 'Выберите...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={fieldValue as boolean || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {error && <p className="text-sm text-destructive ml-2">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={fieldValue as string}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'switch':
        return (
          <div key={field.id} className="flex items-center justify-between">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Switch
              id={field.id}
              checked={fieldValue as boolean || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'range':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}: {fieldValue as number || 0}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Slider
              value={[fieldValue as number || 0]}
              onValueChange={(vals) => handleFieldChange(field.id, vals[0])}
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              step={1}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFieldChange(field.id, file.name);
                }
              }}
              className={cn(error && 'border-destructive')}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'color':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={field.id}
                type="color"
                value={fieldValue as string || '#000000'}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className={cn("w-20 h-10", error && 'border-destructive')}
              />
              <Input
                type="text"
                value={fieldValue as string || '#000000'}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder="#000000"
                className={cn(error && 'border-destructive')}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={fieldValue as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              min={field.validation?.min}
              max={field.validation?.max}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern}
              className={cn(error && 'border-destructive')}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {fields.map(field => renderField(field))}
      {onSubmit && (
        <Button type="submit" className="w-full">
          Отправить
        </Button>
      )}
    </form>
  );
};

