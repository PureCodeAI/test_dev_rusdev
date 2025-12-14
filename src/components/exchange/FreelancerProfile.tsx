import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_ENDPOINTS } from '@/config/api';
import { logger } from '@/utils/logger';

interface FreelancerProfileProps {
  freelancerId: number;
  onClose: () => void;
}

interface FreelancerData {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  reviews_count: number;
  completed_deals: number;
  created_at: string;
  description?: string;
  portfolio?: PortfolioItem[];
  reviews?: Review[];
  skills?: string[];
}

interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  images: string[];
  project_url?: string;
  completed_at?: string;
}

interface Review {
  id: number;
  reviewer_id: number;
  reviewer_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const FreelancerProfile = ({ freelancerId, onClose }: FreelancerProfileProps) => {
  const [profile, setProfile] = useState<FreelancerData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      // Загружаем данные фрилансера
      const userResponse = await fetch(`${API_ENDPOINTS.profile}?user_id=${freelancerId}`);
      const userData = userResponse.ok ? await userResponse.json() : null;
      
      // Загружаем портфолио
      const portfolioUrl = `${API_ENDPOINTS.exchange}?type=exchange&action=portfolio&freelancer_id=${freelancerId}`;
      const portfolioResponse = await fetch(portfolioUrl);
      const portfolio = portfolioResponse.ok ? await portfolioResponse.json() : [];
      
      // Загружаем отзывы
      const reviewsUrl = `${API_ENDPOINTS.exchange}?type=exchange&action=reviews&freelancer_id=${freelancerId}`;
      const reviewsResponse = await fetch(reviewsUrl);
      const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];
      
      // Загружаем навыки
      const skillsUrl = `${API_ENDPOINTS.exchange}?type=exchange&action=skills&freelancer_id=${freelancerId}`;
      const skillsResponse = await fetch(skillsUrl);
      const skills = skillsResponse.ok ? await skillsResponse.json() : [];
      
      // Рассчитываем рейтинг и статистику
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length
        : 0;
      
      setProfile({
        id: freelancerId,
        name: userData?.full_name || userData?.name || 'Неизвестно',
        email: userData?.email || '',
        avatar: userData?.avatar,
        rating: avgRating,
        reviews_count: reviews.length,
        completed_deals: userData?.completed_deals || 0,
        created_at: userData?.created_at || '',
        description: userData?.description,
        portfolio: Array.isArray(portfolio) ? portfolio : [],
        reviews: Array.isArray(reviews) ? reviews : [],
        skills: Array.isArray(skills) ? skills.map((s: { skill_name: string }) => s.skill_name) : [],
      });
    } catch (error) {
      logger.error('Error loading freelancer profile', error instanceof Error ? error : new Error(String(error)), { freelancerId });
    } finally {
      setLoading(false);
    }
  }, [freelancerId]);

  useEffect(() => {
    loadProfile();
  }, [freelancerId, loadProfile]);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
            Загрузка профиля...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ошибка</DialogTitle>
            <DialogDescription>Не удалось загрузить профиль</DialogDescription>
          </DialogHeader>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Профиль фрилансера</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-xl">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Icon name="Star" size={16} className="text-yellow-500" />
                  <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({profile.reviews_count} отзывов)</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  На платформе с {new Date(profile.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="about" className="mt-4">
          <TabsList>
            <TabsTrigger value="about">О фрилансере</TabsTrigger>
            <TabsTrigger value="portfolio">Портфолио</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы ({profile.reviews_count})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{profile.completed_deals}</div>
                    <div className="text-sm text-muted-foreground">Завершенных сделок</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{profile.rating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Средний рейтинг</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{profile.reviews_count}</div>
                    <div className="text-sm text-muted-foreground">Отзывов</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {profile.description && (
              <Card>
                <CardHeader>
                  <CardTitle>О себе</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{profile.description}</p>
                </CardContent>
              </Card>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Навыки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            {profile.portfolio && profile.portfolio.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {profile.portfolio.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      {item.category && (
                        <CardDescription>{item.category}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="text-sm mb-4">{item.description}</p>
                      )}
                      {item.images && item.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {item.images.slice(0, 4).map((img, idx) => (
                            <img key={idx} src={img} alt={`${item.title} ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                          ))}
                        </div>
                      )}
                      {item.project_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                            <Icon name="ExternalLink" className="mr-2" size={16} />
                            Открыть проект
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="Briefcase" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Портфолио пока пусто</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {profile.reviews && profile.reviews.length > 0 ? (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Icon
                                key={i}
                                name="Star"
                                size={16}
                                className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.reviewer_name || 'Аноним'}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm mt-2">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Отзывов пока нет</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

