import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { logger } from '@/utils/logger';

interface DealReviewProps {
  dealId: number;
  revieweeId: number;
  revieweeName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export const DealReview = ({ dealId, revieweeId, revieweeName, onClose, onSubmitted }: DealReviewProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, оставьте комментарий',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      // Отправляем отзыв через API
      const response = await fetch(`${API_ENDPOINTS.exchange}?type=exchange&action=review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deal_id: dealId,
          reviewee_id: revieweeId,
          rating: rating,
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Отзыв оставлен',
        });
        onSubmitted();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка отправки отзыва');
      }
    } catch (error) {
      logger.error('Error submitting review', error instanceof Error ? error : new Error(String(error)), { dealId });
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось оставить отзыв',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Оставить отзыв</DialogTitle>
          <DialogDescription>
            Оцените работу {revieweeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Оценка</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`p-2 rounded-lg transition-colors ${
                    value <= rating
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Icon name="Star" size={24} className={value <= rating ? 'fill-current' : ''} />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 5 && 'Отлично'}
              {rating === 4 && 'Хорошо'}
              {rating === 3 && 'Удовлетворительно'}
              {rating === 2 && 'Плохо'}
              {rating === 1 && 'Очень плохо'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Комментарий</label>
            <Textarea
              placeholder="Расскажите о вашем опыте работы..."
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Отправка...' : 'Оставить отзыв'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

