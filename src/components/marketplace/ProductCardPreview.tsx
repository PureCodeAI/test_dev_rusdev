import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardPreviewProps {
  title: string;
  description: string;
  price: number;
  category: string;
  coverImageUrl?: string | null;
  coverImageFile?: File | null;
  deliveryType?: 'manual' | 'auto' | 'repeatable';
}

export const ProductCardPreview: React.FC<ProductCardPreviewProps> = ({
  title,
  description,
  price,
  category,
  coverImageUrl,
  coverImageFile,
  deliveryType,
}) => {
  const imageUrl = coverImageFile 
    ? URL.createObjectURL(coverImageFile)
    : coverImageUrl || '/placeholder-product.jpg';

  const categoryNames: Record<string, string> = {
    site_templates: 'Шаблоны сайтов',
    bot_templates: 'Шаблоны ботов',
    projects: 'Проекты',
    domains: 'Домены',
    hosting: 'Хостинг',
    scripts: 'Скрипты',
    extensions: 'Расширения',
  };

  const deliveryBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    manual: { label: 'Ручная выдача', variant: 'outline' },
    auto: { label: 'Автовыдача', variant: 'default' },
    repeatable: { label: 'Повторяемая', variant: 'secondary' },
  };

  return (
    <div className="relative">
      {/* Блюр фона */}
      <div 
        className="absolute inset-0 blur-3xl opacity-20 -z-10"
        style={{
          backgroundImage: coverImageFile || coverImageUrl 
            ? `url(${imageUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl">
        {/* Обложка */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title || 'Превью товара'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {deliveryType && deliveryBadges[deliveryType] && (
            <div className="absolute top-2 right-2">
              <Badge variant={deliveryBadges[deliveryType].variant}>
                {deliveryBadges[deliveryType].label}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Категория */}
          <Badge variant="outline" className="mb-2 text-xs">
            {categoryNames[category] || category}
          </Badge>

          {/* Заголовок */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3rem]">
            {title || 'Название товара'}
          </h3>

          {/* Описание */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[4rem]">
            {description || 'Описание товара появится здесь...'}
          </p>

          {/* Цена */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-2xl font-bold text-primary">
              {price > 0 ? `${price.toLocaleString('ru-RU')} ₽` : 'Бесплатно'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

