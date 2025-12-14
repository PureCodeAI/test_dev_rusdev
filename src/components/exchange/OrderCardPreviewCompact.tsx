import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface OrderCardPreviewCompactProps {
  title: string;
  description: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  category: string;
  coverImageUrl?: string | null;
  coverImageFile?: File | null;
  deadline?: string | null;
  proposalsCount?: number;
  viewsCount?: number;
  clientRating?: number;
}

export const OrderCardPreviewCompact: React.FC<OrderCardPreviewCompactProps> = ({
  title,
  description,
  budgetMin,
  budgetMax,
  category,
  coverImageUrl,
  coverImageFile,
  deadline,
  proposalsCount,
  viewsCount,
  clientRating,
}) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderCardPreviewCompact.tsx:32',message:'OrderCardPreviewCompact render',data:{coverImageUrl,coverImageFile:coverImageFile?.name,title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const imageUrl = coverImageFile 
    ? URL.createObjectURL(coverImageFile)
    : coverImageUrl 
      ? (coverImageUrl.startsWith('http') ? coverImageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${coverImageUrl}`)
      : null;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderCardPreviewCompact.tsx:38',message:'imageUrl calculated',data:{imageUrl,baseUrl:import.meta.env.VITE_API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

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
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold truncate">{title || 'Название заказа'}</h3>
              <Badge variant="secondary" className="flex-shrink-0">
                {categoryNames[category] || category}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {description || 'Описание заказа появится здесь...'}
            </p>

            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={16} className="text-green-600" />
                <span className="font-semibold">{formatBudget()}</span>
              </div>
              {deadline && (
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} className="text-orange-600" />
                  <span>{new Date(deadline).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
              {proposalsCount !== undefined && (
                <div className="flex items-center gap-2">
                  <Icon name="Users" size={16} className="text-blue-600" />
                  <span>{proposalsCount} откликов</span>
                </div>
              )}
              {viewsCount !== undefined && viewsCount > 0 && (
                <div className="flex items-center gap-2">
                  <Icon name="Eye" size={16} className="text-gray-600" />
                  <span>{viewsCount} просмотров</span>
                </div>
              )}
              {clientRating !== undefined && clientRating > 0 && (
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-yellow-600 fill-yellow-600" />
                  <span className="font-semibold">{clientRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          
          {imageUrl && (
            <div className="ml-4 w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
              <img
                src={imageUrl}
                alt={title || 'Обложка заказа'}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onLoad={() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderCardPreviewCompact.tsx:120',message:'Image loaded successfully',data:{imageUrl,title},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
                  // #endregion
                }}
                onError={(e) => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderCardPreviewCompact.tsx:127',message:'Image load error',data:{imageUrl,title,error:(e.target as HTMLImageElement).src},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
                  // #endregion
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

