import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProductCardPreviewCompactProps {
  title: string;
  description: string;
  price: number;
  category: string;
  coverImageUrl?: string | null;
  coverImageFile?: File | null;
  deliveryType?: 'manual' | 'auto' | 'repeatable';
  rating?: number;
  salesCount?: number;
}

export const ProductCardPreviewCompact: React.FC<ProductCardPreviewCompactProps> = ({
  title,
  description,
  price,
  category,
  coverImageUrl,
  coverImageFile,
  deliveryType,
  rating,
  salesCount,
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

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold truncate">{title || 'Название товара'}</h3>
              <Badge variant="secondary" className="flex-shrink-0">
                {categoryNames[category] || category}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {description || 'Описание товара появится здесь...'}
            </p>

            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={16} className="text-green-600" />
                <span className="font-semibold text-lg">{price.toLocaleString('ru-RU')} ₽</span>
              </div>
              {deliveryType && (
                <div className="flex items-center gap-2">
                  <Icon name="Package" size={16} className="text-blue-600" />
                  <span>{deliveryTypeNames[deliveryType]}</span>
                </div>
              )}
              {rating !== undefined && rating > 0 && (
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-yellow-600 fill-yellow-600" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                </div>
              )}
              {salesCount !== undefined && salesCount > 0 && (
                <div className="flex items-center gap-2">
                  <Icon name="ShoppingCart" size={16} className="text-purple-600" />
                  <span>{salesCount} продаж</span>
                </div>
              )}
            </div>
          </div>
          
          {imageUrl && (
            <div className="ml-4 w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
              <img
                src={imageUrl}
                alt={title || 'Обложка товара'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

