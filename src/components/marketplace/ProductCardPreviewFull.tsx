import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProductCardPreviewFullProps {
  title: string;
  description: string;
  price: number;
  category: string;
  coverImageUrl?: string | null;
  coverImageFile?: File | null;
  galleryImages?: string[];
  galleryImageFiles?: File[];
  deliveryType?: 'manual' | 'auto' | 'repeatable';
  rating?: number;
  salesCount?: number;
  attachedFileUrl?: string | null;
  attachedFileName?: string | null;
}

export const ProductCardPreviewFull: React.FC<ProductCardPreviewFullProps> = ({
  title,
  description,
  price,
  category,
  coverImageUrl,
  coverImageFile,
  galleryImages,
  galleryImageFiles,
  deliveryType,
  rating,
  salesCount,
  attachedFileUrl,
  attachedFileName,
}) => {
  const imageUrl = coverImageFile 
    ? URL.createObjectURL(coverImageFile)
    : coverImageUrl ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${coverImageUrl}` : null;

  const categoryNames: Record<string, string> = {
    site_templates: 'Шаблоны сайтов',
    bot_templates: 'Шаблоны ботов',
    scripts: 'Скрипты',
    extensions: 'Расширения',
    projects: 'Проекты',
    services: 'Услуги',
    design: 'Дизайн',
    content: 'Контент',
  };

  const deliveryTypeNames: Record<string, string> = {
    manual: 'Ручная выдача',
    auto: 'Автовыдача',
    repeatable: 'Повторная выдача',
  };

  const allGalleryImages: (string | File)[] = [
    ...(galleryImageFiles || []),
    ...(galleryImages || []).map(url => 
      url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${url}`
    ),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{title || 'Название товара'}</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">{categoryNames[category] || category}</Badge>
              {deliveryType && (
                <Badge>{deliveryTypeNames[deliveryType]}</Badge>
              )}
              {rating !== undefined && rating > 0 && (
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden border bg-muted">
            <img
              src={imageUrl}
              alt={title || 'Обложка товара'}
              className="w-full h-64 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.style.display = 'none';
                }
              }}
            />
          </div>
        )}

        {allGalleryImages.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Галерея изображений</h4>
            <div className="grid grid-cols-3 gap-3">
              {allGalleryImages.slice(0, 6).map((img, index) => {
                const imgUrl = img instanceof File 
                  ? URL.createObjectURL(img)
                  : img;
                return (
                  <div key={index} className="rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={imgUrl}
                      alt={`Галерея ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Описание</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {description || 'Описание товара появится здесь...'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Цена</div>
              <div className="font-semibold text-lg">{price.toLocaleString('ru-RU')} ₽</div>
            </div>
            {deliveryType && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Тип выдачи</div>
                <div className="font-semibold">{deliveryTypeNames[deliveryType]}</div>
              </div>
            )}
            {rating !== undefined && rating > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Рейтинг</div>
                <div className="font-semibold flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  {rating.toFixed(1)}
                </div>
              </div>
            )}
            {salesCount !== undefined && salesCount > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Продаж</div>
                <div className="font-semibold">{salesCount}</div>
              </div>
            )}
          </div>

          {attachedFileUrl && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Прикрепленный файл</h4>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Paperclip" size={16} />
                <a href={attachedFileUrl.startsWith('http') ? attachedFileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${attachedFileUrl}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline">
                  {attachedFileName || 'Скачать файл'}
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

