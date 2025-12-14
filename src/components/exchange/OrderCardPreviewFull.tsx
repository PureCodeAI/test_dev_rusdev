import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface OrderCardPreviewFullProps {
  title: string;
  description: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  category: string;
  coverImageUrl?: string | null;
  coverImageFile?: File | null;
  deadline?: string | null;
  requiredSkills?: string[];
  proposalsCount?: number;
  viewsCount?: number;
  clientRating?: number;
  attachments?: string[];
}

export const OrderCardPreviewFull: React.FC<OrderCardPreviewFullProps> = ({
  title,
  description,
  budgetMin,
  budgetMax,
  category,
  coverImageUrl,
  coverImageFile,
  deadline,
  requiredSkills,
  proposalsCount,
  viewsCount,
  clientRating,
  attachments,
}) => {
  const imageUrl = coverImageFile 
    ? URL.createObjectURL(coverImageFile)
    : coverImageUrl 
      ? (coverImageUrl.startsWith('http') ? coverImageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${coverImageUrl}`)
      : null;

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
      return `₽${budgetMin.toLocaleString('ru-RU')} - ₽${budgetMax.toLocaleString('ru-RU')}`;
    }
    if (budgetMin) {
      return `от ₽${budgetMin.toLocaleString('ru-RU')}`;
    }
    if (budgetMax) {
      return `до ₽${budgetMax.toLocaleString('ru-RU')}`;
    }
    return 'По договоренности';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{title || 'Название заказа'}</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">{categoryNames[category] || category}</Badge>
              <Badge>Открыт</Badge>
              {clientRating !== undefined && clientRating > 0 && (
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{clientRating.toFixed(1)}</span>
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
              alt={title || 'Обложка заказа'}
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

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Описание</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {description || 'Описание заказа появится здесь...'}
            </p>
          </div>

          {requiredSkills && requiredSkills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Требуемые навыки</h4>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Бюджет</div>
              <div className="font-semibold text-lg">{formatBudget()}</div>
            </div>
            {deadline && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Срок выполнения</div>
                <div className="font-semibold">{new Date(deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
              </div>
            )}
            {proposalsCount !== undefined && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Откликов</div>
                <div className="font-semibold">{proposalsCount}</div>
              </div>
            )}
            {viewsCount !== undefined && viewsCount > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Просмотров</div>
                <div className="font-semibold">{viewsCount}</div>
              </div>
            )}
          </div>

          {attachments && attachments.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Прикрепленные файлы</h4>
              <div className="space-y-2">
                {attachments.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Icon name="Paperclip" size={16} />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Файл {index + 1}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

