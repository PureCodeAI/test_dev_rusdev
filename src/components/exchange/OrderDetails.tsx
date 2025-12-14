import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';
import { OrderProposals } from './OrderProposals';

interface ExchangeOrder {
  id: number;
  client_id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  deadline: string | null;
  status: string;
  required_skills: string[];
  attachments: string[];
  cover_url?: string | null;
  cover_image_url?: string | null;
  auto_delivery_enabled?: boolean;
  auto_delivery_content?: string | null;
  auto_delivery_payload?: string | null;
  created_at: string;
  updated_at: string;
  views_count?: number;
  proposals_count?: number;
  client_rating?: number;
  max_proposals?: number | null;
}

interface OrderDetailsProps {
  orderId: number;
  onClose: () => void;
  onEdit?: (order: ExchangeOrder) => void;
  onDelete?: (orderId: number) => void;
  onProposalClick?: (orderId: number) => void;
}

export const OrderDetails = ({ orderId, onClose, onEdit, onDelete, onProposalClick }: OrderDetailsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id ? Number(user.id) : null;
  const userType = user?.userType ?? null;
  const [order, setOrder] = useState<ExchangeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingProposals, setViewingProposals] = useState(false);

  const loadOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${API_ENDPOINTS.exchange}?type=exchange&order_id=${orderId}`;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderDetails.tsx:66',message:'Loading order details',data:{orderId,url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const response = await fetch(url);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderDetails.tsx:67',message:'Fetch response received',data:{orderId,status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (response.ok) {
        const data = await response.json();
        const orderData = Array.isArray(data) ? data[0] : data;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderDetails.tsx:69',message:'Order data received',data:{orderId,hasData:!!orderData,cover_image_url:orderData?.cover_image_url,cover_url:orderData?.cover_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        if (orderData) {
          const finalCoverUrl = orderData.cover_image_url || orderData.cover_url || null;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderDetails.tsx:73',message:'Setting order with cover URL',data:{orderId,finalCoverUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          setOrder({
            ...orderData,
            cover_image_url: finalCoverUrl,
            required_skills: Array.isArray(orderData.required_skills) 
              ? orderData.required_skills 
              : typeof orderData.required_skills === 'string' 
                ? JSON.parse(orderData.required_skills || '[]')
                : [],
            attachments: Array.isArray(orderData.attachments)
              ? orderData.attachments
              : typeof orderData.attachments === 'string'
                ? JSON.parse(orderData.attachments || '[]')
                : [],
          });
        }
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderDetails.tsx:87',message:'Error loading order details',data:{orderId,error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      logger.error('Error loading order details', error instanceof Error ? error : new Error(String(error)), { orderId });
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить детали заказа',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId, loadOrderDetails]);

  const isOwner = userId && order && order.client_id === userId;

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали заказа #{orderId}</DialogTitle>
            <DialogDescription>
              Полная информация о заказе
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-12">
              <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
              Загрузка...
            </div>
          ) : !order ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Заказ не найден</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{order.title}</CardTitle>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline">{order.category}</Badge>
                        <Badge>
                          {order.status === 'in_progress' ? 'В работе' : 
                           order.status === 'completed' ? 'Завершен' :
                           order.status === 'cancelled' ? 'Отменен' :
                           order.status === 'dispute' ? 'Спор' : 'Открыт'}
                        </Badge>
                        {order.client_rating !== undefined && order.client_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">{order.client_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isOwner && (
                      <div className="flex gap-2">
                        {order.status === 'open' && onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onEdit(order);
                              onClose();
                            }}
                          >
                            <Icon name="Edit" className="mr-2" size={16} />
                            Редактировать
                          </Button>
                        )}
                        {order.status === 'open' && onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
                                onDelete(order.id);
                                onClose();
                              }
                            }}
                          >
                            <Icon name="Trash2" className="mr-2" size={16} />
                            Удалить
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.cover_image_url && (
                    <div className="mb-6 rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={order.cover_image_url.startsWith('http') ? order.cover_image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${order.cover_image_url}`}
                        alt={order.title}
                        className="w-full h-64 object-cover"
                        crossOrigin="anonymous"
                        onLoad={() => {
                          // #region agent log
                          fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderDetails.tsx:210',message:'Image loaded successfully in OrderDetails',data:{orderId:order?.id,cover_image_url:order?.cover_image_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
                          // #endregion
                        }}
                        onError={(e) => {
                          // #region agent log
                          fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OrderDetails.tsx:218',message:'Image load error in OrderDetails',data:{orderId:order?.id,cover_image_url:order?.cover_image_url,imageSrc:(e.target as HTMLImageElement).src},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
                          // #endregion
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
                  
                  <div>
                    <h4 className="font-semibold mb-2">Описание</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{order.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Бюджет</div>
                      <div className="font-semibold">
                        {order.budget_min && order.budget_max
                          ? `₽${order.budget_min.toLocaleString()} - ₽${order.budget_max.toLocaleString()}`
                          : order.budget_min
                          ? `от ₽${order.budget_min.toLocaleString()}`
                          : order.budget_max
                          ? `до ₽${order.budget_max.toLocaleString()}`
                          : 'По договоренности'}
                      </div>
                    </div>
                    {order.deadline && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Срок</div>
                        <div className="font-semibold">
                          {new Date(order.deadline).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Откликов</div>
                      <div className="font-semibold">
                        {order.proposals_count || 0}
                        {order.max_proposals && ` / ${order.max_proposals}`}
                      </div>
                    </div>
                    {order.views_count !== undefined && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Просмотров</div>
                        <div className="font-semibold">{order.views_count}</div>
                      </div>
                    )}
                  </div>

                  {order.required_skills && order.required_skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Требуемые навыки</h4>
                      <div className="flex flex-wrap gap-2">
                        {order.required_skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.attachments && order.attachments.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Прикрепленные файлы</h4>
                      <div className="space-y-2">
                        {order.attachments.map((url: string, index: number) => {
                          const fullUrl = url.startsWith('http') 
                            ? url 
                            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${url}`;
                          const fileName = url.split('/').pop() || `Файл ${index + 1}`;
                          return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Icon name="Paperclip" size={16} />
                              <a 
                                href={fullUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline"
                              >
                                {fileName}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Calendar" size={16} />
                    <span>Создан: {new Date(order.created_at).toLocaleString('ru-RU')}</span>
                    {order.updated_at !== order.created_at && (
                      <>
                        <span>•</span>
                        <span>Обновлен: {new Date(order.updated_at).toLocaleString('ru-RU')}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Действия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {isOwner ? (
                      <>
                        <Button
                          onClick={() => setViewingProposals(true)}
                          variant="default"
                        >
                          <Icon name="Users" className="mr-2" size={16} />
                          Просмотреть отклики ({order.proposals_count || 0})
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Навигация к созданию тикета поддержки
                            window.location.href = `/dashboard/support?create_from_order=${order.id}`;
                          }}
                        >
                          <Icon name="MessageSquare" className="mr-2" size={16} />
                          Создать тикет поддержки
                        </Button>
                      </>
                    ) : (
                      <>
                        {onProposalClick && order.status === 'open' && userType === 'freelancer' && order.client_id !== userId && (
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              logger.debug('Proposal button clicked', { orderId: order.id, onProposalClick: !!onProposalClick });
                              if (onProposalClick) {
                                onProposalClick(order.id);
                                onClose();
                              }
                            }}
                            variant="default"
                            className="cursor-pointer"
                          >
                            <Icon name="Send" className="mr-2" size={16} />
                            Дать отклик
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Навигация к созданию тикета поддержки
                            window.location.href = `/dashboard/support?create_from_order=${order.id}`;
                          }}
                        >
                          <Icon name="MessageSquare" className="mr-2" size={16} />
                          Создать тикет поддержки
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {viewingProposals && (
        <OrderProposals
          orderId={orderId}
          onClose={() => setViewingProposals(false)}
          onProposalAccepted={() => {
            loadOrderDetails();
          }}
        />
      )}
    </>
  );
};

