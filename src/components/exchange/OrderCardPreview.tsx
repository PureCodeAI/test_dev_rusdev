import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderCardPreviewProps {
  title: string;
  description: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  category: string;
  coverImageUrl?: string | null;
  coverImageFile?: File | null;
  deadline?: string | null;
}

export const OrderCardPreview: React.FC<OrderCardPreviewProps> = ({
  title,
  description,
  budgetMin,
  budgetMax,
  category,
  coverImageUrl,
  coverImageFile,
  deadline,
}) => {
  const imageUrl = coverImageFile 
    ? URL.createObjectURL(coverImageFile)
    : coverImageUrl || '/placeholder-order.jpg';

  const categoryNames: Record<string, string> = {
    site_development: 'Сайты',
    bot_development: 'Боты',
    design: 'Дизайн',
    marketing: 'Реклама',
    content: 'Контент',
    consulting: 'Консалтинг',
    web_development: 'Веб-разработка',
    seo: 'SEO',
    other: 'Другое',
  };

  const formatBudget = () => {
    if (budgetMin && budgetMax) {
      return `${budgetMin.toLocaleString('ru-RU')} - ${budgetMax.toLocaleString('ru-RU')} ₽`;
    }
    if (budgetMin) {
      return `от ${budgetMin.toLocaleString('ru-RU')} ₽`;
    }
    if (budgetMax) {
      return `до ${budgetMax.toLocaleString('ru-RU')} ₽`;
    }
    return 'По договоренности';
  };

  const formatDeadline = () => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
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
              alt={title || 'Превью заказа'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        <CardContent className="p-4">
          {/* Категория */}
          <Badge variant="outline" className="mb-2 text-xs">
            {categoryNames[category] || category}
          </Badge>

          {/* Заголовок */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3rem]">
            {title || 'Название заказа'}
          </h3>

          {/* Описание */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[4rem]">
            {description || 'Описание заказа появится здесь...'}
          </p>

          {/* Бюджет и дедлайн */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-lg font-bold text-primary">
              {formatBudget()}
            </span>
            {deadline && (
              <Badge variant="secondary" className="text-xs">
                До {formatDeadline()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

