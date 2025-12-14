import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { FreelancerProfile } from './FreelancerProfile';

interface OrderProposalsProps {
  orderId: number;
  onClose: () => void;
  onProposalAccepted?: () => void;
}

interface Proposal {
  id: number;
  order_id: number;
  freelancer_id: number;
  price: number;
  currency: string;
  delivery_time_days: number | null;
  message: string;
  status: string;
  created_at: string;
  freelancer_name?: string;
  freelancer_email?: string;
  freelancer_avatar?: string;
  freelancer_rating?: number;
  completed_deals?: number;
}

export const OrderProposals = ({ orderId, onClose, onProposalAccepted }: OrderProposalsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id ? Number(user.id) : null;
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<number | null>(null);
  const [acceptingProposalId, setAcceptingProposalId] = useState<number | null>(null);

  const loadProposals = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${API_ENDPOINTS.exchange}?type=exchange&path=/proposals&order_id=${orderId}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProposals(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      logger.error('Error loading proposals', error instanceof Error ? error : new Error(String(error)), { orderId });
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить отклики',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    loadProposals();
  }, [orderId, loadProposals]);

  const handleAcceptProposal = async (proposalId: number) => {
    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'Необходима авторизация',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm('Вы уверены, что хотите принять этот отклик? Будет создана безопасная сделка.')) {
      return;
    }

    try {
      setAcceptingProposalId(proposalId);
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      // Создаем сделку
      const response = await fetch(`${API_ENDPOINTS.exchange}?type=exchange&action=accept_proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          order_id: orderId,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Отклик принят, сделка создана',
        });
        onProposalAccepted?.();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка принятия отклика');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось принять отклик',
        variant: 'destructive',
      });
    } finally {
      setAcceptingProposalId(null);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Отклики на заказ #{orderId}</DialogTitle>
            <DialogDescription>
              Выберите исполнителя для вашего заказа
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-12">
                <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
                Загрузка откликов...
              </div>
            ) : proposals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Пока нет откликов</p>
                </CardContent>
              </Card>
            ) : (
              proposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                            {proposal.freelancer_avatar ? (
                              <img src={proposal.freelancer_avatar} alt={proposal.freelancer_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (proposal.freelancer_name || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{proposal.freelancer_name || 'Фрилансер'}</h3>
                              {proposal.freelancer_rating !== undefined && proposal.freelancer_rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-semibold">{proposal.freelancer_rating.toFixed(1)}</span>
                                </div>
                              )}
                              {proposal.completed_deals !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {proposal.completed_deals} сделок
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{proposal.freelancer_email}</p>
                          </div>
                          <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                            {proposal.status === 'accepted' ? 'Принят' :
                             proposal.status === 'rejected' ? 'Отклонен' :
                             proposal.status === 'withdrawn' ? 'Отозван' : 'Ожидает'}
                          </Badge>
                        </div>

                        <p className="text-sm mb-4 whitespace-pre-wrap">{proposal.message}</p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Icon name="DollarSign" size={16} className="text-green-600" />
                            <span className="font-semibold">₽{proposal.price.toLocaleString()}</span>
                          </div>
                          {proposal.delivery_time_days && (
                            <div className="flex items-center gap-2">
                              <Icon name="Clock" size={16} className="text-orange-600" />
                              <span>{proposal.delivery_time_days} дней</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" size={16} className="text-gray-600" />
                            <span>{new Date(proposal.created_at).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {proposal.status === 'pending' && (
                          <Button
                            onClick={() => handleAcceptProposal(proposal.id)}
                            disabled={acceptingProposalId === proposal.id}
                            size="sm"
                          >
                            {acceptingProposalId === proposal.id ? (
                              <Icon name="Loader2" className="animate-spin" size={16} />
                            ) : (
                              <>
                                <Icon name="Check" className="mr-2" size={16} />
                                Принять
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFreelancerId(proposal.freelancer_id)}
                        >
                          <Icon name="User" className="mr-2" size={16} />
                          Профиль
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedFreelancerId && (
        <FreelancerProfile
          freelancerId={selectedFreelancerId}
          onClose={() => setSelectedFreelancerId(null)}
        />
      )}
    </>
  );
};

