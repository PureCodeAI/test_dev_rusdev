import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Введите ФИО'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(1, 'Введите телефон'),
  company: z.string().optional(),
  about: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const ProfileTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      about: '',
    },
  });

  const loadProfile = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await fetch(`${API_ENDPOINTS.profile}?user_id=${userId}`, {
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setValue('fullName', data.full_name || '');
        setValue('email', data.email || '');
        setValue('phone', data.phone || '');
        setValue('company', data.company || '');
        setValue('about', data.about || '');
        if (data.profile_photo_url) {
          setProfilePhoto(data.profile_photo_url);
        }
      }
    } catch (error) {
      // Игнорируем ошибки загрузки
    }
  }, [user?.id, setValue]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка размера (5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5 МБ',
        variant: 'destructive',
      });
      return;
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Поддерживаются только изображения',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Конвертируем файл в base64 для отправки
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          const response = await fetch(API_ENDPOINTS.fileUpload, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': String(userId),
            },
            body: JSON.stringify({
              file_data: base64Data,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              type: 'profile_photo',
            }),
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();
          setProfilePhoto(data.url);

          // Обновляем профиль с новой ссылкой на фото
          await updateProfilePhoto(data.url);

          toast({
            title: 'Успешно',
            description: 'Фото профиля загружено',
          });
        } catch (error) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить фото',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  const updateProfilePhoto = async (photoUrl: string) => {
    try {
      const userId = user?.id;
      if (!userId) return;

      await fetch(API_ENDPOINTS.profile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          profile_photo_url: photoUrl,
        }),
      });
    } catch (error) {
      // Игнорируем ошибки
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.profile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          about: data.about,
        }),
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      toast({
        title: 'Успешно',
        description: 'Профиль обновлен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fullName = watch('fullName');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
        <CardDescription>Управление личной информацией</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
              {fullName ? getInitials(fullName) : 'ИП'}
            </div>
          )}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={14} />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Upload" className="mr-2" size={14} />
                  Загрузить фото
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG до 5 МБ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ФИО</Label>
              <Input {...register('fullName')} />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input {...register('phone')} />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Компания</Label>
              <Input {...register('company')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>О себе</Label>
            <textarea
              className="w-full p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Расскажите о себе и своем бизнесе..."
              {...register('about')}
            />
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Icon name="Loader2" className="animate-spin mr-2" size={18} />
                Сохранение...
              </>
            ) : (
              'Сохранить изменения'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
