import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { FreelancerProfile } from '@/components/exchange/FreelancerProfile';
import { OrderProposals } from '@/components/exchange/OrderProposals';
import { OrderDetails } from '@/components/exchange/OrderDetails';
import { OrderCardPreviewCompact } from '@/components/exchange/OrderCardPreviewCompact';
import { OrderCardPreviewFull } from '@/components/exchange/OrderCardPreviewFull';

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
  responses_count?: number;
  proposals_count?: number;
  views_count?: number;
  client_rating?: number;
  max_proposals?: number | null;
}

interface ExchangeProposal {
  id: number;
  order_id: number;
  freelancer_id: number;
  price: number;
  currency: string;
  delivery_time_days: number | null;
  message: string;
  status: string;
  created_at: string;
}

const orderFormSchema = z.object({
  title: z.string().min(5, 'Минимум 5 символов').max(255, 'Максимум 255 символов'),
  category: z.string().min(1, 'Выберите категорию'),
  description: z.string().min(20, 'Минимум 20 символов').max(10000, 'Максимум 10000 символов'),
  budget_min: z.coerce.number().min(0, 'Минимум 0').max(100000000, 'Максимум 100,000,000').optional().nullable(),
  budget_max: z.coerce.number().min(0, 'Минимум 0').max(100000000, 'Максимум 100,000,000').optional().nullable(),
  deadline_days: z.coerce.number().min(1, 'Минимум 1 день').max(365, 'Максимум 365 дней').optional().nullable(),
  required_skills: z.string().min(1, 'Укажите хотя бы один навык').max(500, 'Максимум 500 символов'),
  max_proposals: z.coerce.number().min(1, 'Минимум 1').max(1000, 'Максимум 1000').optional().nullable(),
}).refine((data) => {
  if (data.budget_min !== null && data.budget_min !== undefined && 
      data.budget_max !== null && data.budget_max !== undefined) {
    return data.budget_max >= data.budget_min;
  }
  return true;
}, {
  message: 'Максимальный бюджет должен быть больше или равен минимальному',
  path: ['budget_max'],
});

const proposalFormSchema = z.object({
  price: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || val === 0) return undefined;
      const num = typeof val === 'number' ? val : Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().min(1, 'Укажите цену').max(100000000, 'Максимум 100,000,000')
  ),
  message: z.string().min(10, 'Минимум 10 символов').max(5000, 'Максимум 5000 символов'),
  delivery_time_days: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().min(1, 'Минимум 1 день').max(365, 'Максимум 365 дней').nullable().optional()
  ),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;
type ProposalFormValues = z.infer<typeof proposalFormSchema>;

const categoryMap: Record<string, string> = {
  'site_development': 'Сайты',
  'bot_development': 'Боты',
  'design': 'Дизайн',
  'content': 'Контент',
  'marketing': 'Реклама',
  'consulting': 'Консалтинг',
  'other': 'Другое',
};

const categoryMapping: Record<string, string> = {
  'Сайты': 'site_development',
  'Боты': 'bot_development',
  'Реклама': 'marketing',
  'Дизайн': 'design',
  'Контент': 'content',
};

const Exchange = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id ? Number(user.id) : null;
  const userType = user?.userType ?? null;
  
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [myOrders, setMyOrders] = useState<ExchangeOrder[]>([]);
  const [myProposals, setMyProposals] = useState<ExchangeProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);
  const [loadingMyProposals, setLoadingMyProposals] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [editingOrder, setEditingOrder] = useState<ExchangeOrder | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<number | null>(null);
  const [viewingProposals, setViewingProposals] = useState(false);
  const [viewingOrderDetails, setViewingOrderDetails] = useState(false);
  const ordersRef = useRef<ExchangeOrder[]>([]);

  const orderForm = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      budget_min: null,
      budget_max: null,
      deadline_days: null,
      required_skills: '',
      max_proposals: null,
    },
  });

  const proposalForm = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      price: 0 as unknown as number,
      message: '',
      delivery_time_days: null,
    },
  });

  const buildApiUrl = useCallback((params: Record<string, string | number | null | undefined>): string => {
    const baseUrl = API_ENDPOINTS.exchange.startsWith('http') 
      ? API_ENDPOINTS.exchange 
      : `${window.location.origin}${API_ENDPOINTS.exchange}`;
    
    const url = new URL(baseUrl);
    // Убеждаемся, что type всегда присутствует
    if (!params.type) {
      url.searchParams.append('type', 'exchange');
    }
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && key !== 'path') {
        url.searchParams.append(key, String(value));
      }
    });
    
    // Если есть path, добавляем его как action
    if (params.path) {
      const pathStr = String(params.path);
      if (pathStr === '/proposals') {
        url.searchParams.append('action', 'proposals');
      }
    }
    
    return url.toString();
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const url = buildApiUrl({ type: 'exchange', status: 'open' });
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      // Используем proposals_count из ответа API, если доступен
      const ordersWithResponses = data.map((order: ExchangeOrder) => ({
        ...order,
        responses_count: order.proposals_count || order.responses_count || 0,
        attachments: Array.isArray(order.attachments)
          ? order.attachments
          : typeof order.attachments === 'string'
            ? (() => {
                try {
                  return JSON.parse(order.attachments || '[]');
                } catch {
                  return [];
                }
              })()
            : [],
        required_skills: Array.isArray(order.required_skills)
          ? order.required_skills
          : typeof order.required_skills === 'string'
            ? (() => {
                try {
                  return JSON.parse(order.required_skills || '[]');
                } catch {
                  return [];
                }
              })()
            : [],
      }));
      
      setOrders(ordersWithResponses);
      ordersRef.current = ordersWithResponses;
    } catch (error) {
      logger.error('Error loading orders', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заказы',
        variant: 'destructive',
      });
      setOrders([]);
      ordersRef.current = [];
    } finally {
      setLoading(false);
    }
  }, [buildApiUrl, toast]);

  const loadMyOrders = useCallback(async () => {
    if (!userId) {
      setMyOrders([]);
      return;
    }
    
    try {
      setLoadingMyOrders(true);
      const currentOrders = ordersRef.current.length > 0 ? ordersRef.current : null;
      
      let allOrders: ExchangeOrder[] = [];
      
      if (currentOrders) {
        allOrders = currentOrders;
      } else {
        const url = buildApiUrl({ type: 'exchange', status: 'open' });
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fetchedOrders = await response.json();
        if (Array.isArray(fetchedOrders)) {
          allOrders = fetchedOrders.map((order: ExchangeOrder) => ({
            ...order,
            attachments: Array.isArray(order.attachments)
              ? order.attachments
              : typeof order.attachments === 'string'
                ? (() => {
                try {
                  return JSON.parse(order.attachments || '[]');
                } catch {
                  return [];
                }
              })()
                : [],
            required_skills: Array.isArray(order.required_skills)
              ? order.required_skills
              : typeof order.required_skills === 'string'
                ? (() => {
                try {
                  return JSON.parse(order.required_skills || '[]');
                } catch {
                  return [];
                }
              })()
                : [],
          }));
        }
      }
      
      const filtered = allOrders.filter((order: ExchangeOrder) => order.client_id === userId);
      setMyOrders(filtered);
    } catch (error) {
      logger.error('Error loading my orders', error instanceof Error ? error : new Error(String(error)), { userId });
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить ваши заказы',
        variant: 'destructive',
      });
      setMyOrders([]);
    } finally {
      setLoadingMyOrders(false);
    }
  }, [userId, buildApiUrl, toast]);

  const loadMyProposals = useCallback(async () => {
    if (!userId) {
      setMyProposals([]);
      return;
    }
    
    try {
      setLoadingMyProposals(true);
      const allOrders = ordersRef.current.length > 0 ? ordersRef.current : [];
      
      if (allOrders.length === 0) {
        const url = buildApiUrl({ type: 'exchange', status: 'open' });
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fetchedOrders = await response.json();
        if (Array.isArray(fetchedOrders)) {
          allOrders.push(...fetchedOrders);
        }
      }

      if (allOrders.length === 0) {
        setMyProposals([]);
        return;
      }

      const orderIds = allOrders.map((order: ExchangeOrder) => order.id);
      const proposalPromises = orderIds.map(async (orderId: number) => {
        try {
          const proposalsUrl = buildApiUrl({ 
            type: 'exchange', 
            path: '/proposals', 
            order_id: orderId 
          });
          const proposalsResponse = await fetch(proposalsUrl);
          if (proposalsResponse.ok) {
            const proposals = await proposalsResponse.json();
            if (Array.isArray(proposals)) {
              return proposals.filter((p: ExchangeProposal) => p.freelancer_id === userId);
            }
          }
        } catch (error) {
          logger.error(`Error loading proposals for order ${orderId}`, error instanceof Error ? error : new Error(String(error)), { orderId });
        }
        return [];
      });
      
      const proposalArrays = await Promise.all(proposalPromises);
      setMyProposals(proposalArrays.flat());
    } catch (error) {
      logger.error('Error loading my proposals', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить ваши отклики',
        variant: 'destructive',
      });
      setMyProposals([]);
    } finally {
      setLoadingMyProposals(false);
    }
  }, [userId, buildApiUrl, toast]);

  useEffect(() => {
    if (userId) {
      loadOrders();
      loadMyOrders();
      loadMyProposals();
    } else {
      setLoading(false);
      setMyOrders([]);
      setMyProposals([]);
    }
  }, [userId, loadOrders, loadMyOrders, loadMyProposals]);

  const handleEditOrder = (order: ExchangeOrder) => {
    setEditingOrder(order);
    // Вычисляем количество дней до дедлайна
    const deadlineDays = order.deadline 
      ? Math.ceil((new Date(order.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    orderForm.reset({
      title: order.title,
      category: categoryMap[order.category] || 'Другое',
      description: order.description,
      budget_min: order.budget_min,
      budget_max: order.budget_max,
      deadline_days: deadlineDays && deadlineDays > 0 ? deadlineDays : null,
      required_skills: Array.isArray(order.required_skills) ? order.required_skills.join(', ') : '',
    });
    setEditOrderDialogOpen(true);
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'Необходима авторизация',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      const url = buildApiUrl({ type: 'exchange', order_id: orderId, user_id: userId });
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Заказ удален',
        });
        await Promise.all([loadOrders(), loadMyOrders()]);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка удаления заказа');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить заказ',
        variant: 'destructive',
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const onUpdateOrder = async (values: OrderFormValues) => {
    if (!userId || !editingOrder) {
      toast({
        title: 'Ошибка',
        description: 'Необходима авторизация',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdatingOrder(true);
      const skillsArray = values.required_skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const deadline = values.deadline_days && values.deadline_days > 0
        ? (() => {
            const today = new Date();
            const deadlineDate = new Date(today);
            deadlineDate.setDate(today.getDate() + values.deadline_days);
            const year = deadlineDate.getFullYear();
            const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
            const day = String(deadlineDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()
        : null;

      // Загружаем файлы если есть
      let coverImageUrl: string | null = editingOrder.cover_image_url || null;
      const attachments: string[] = Array.isArray(editingOrder.attachments) ? [...editingOrder.attachments] : [];

      if (coverImageFile) {
        const formData = new FormData();
        formData.append('file', coverImageFile);
        formData.append('type', 'exchange_cover');
        const uploadResponse = await fetch(API_ENDPOINTS.fileUpload, {
          method: 'POST',
          headers: { 'X-User-Id': String(userId) },
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          coverImageUrl = uploadData.url;
        }
      }

      if (attachmentFile) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        formData.append('type', 'exchange_attachment');
        const uploadResponse = await fetch(API_ENDPOINTS.fileUpload, {
          method: 'POST',
          headers: { 'X-User-Id': String(userId) },
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          attachments.push(uploadData.url);
        }
      }

      const url = buildApiUrl({ type: 'exchange' });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          order_id: editingOrder.id,
          title: values.title.trim(),
          description: values.description.trim(),
          category: categoryMapping[values.category] || 'other',
          budget_min: values.budget_min || null,
          budget_max: values.budget_max || null,
          required_skills: skillsArray,
          deadline: deadline,
          cover_image_url: coverImageUrl,
          attachments: attachments,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        toast({
          title: 'Успешно',
          description: 'Заказ успешно обновлен',
        });
        setEditOrderDialogOpen(false);
        setEditingOrder(null);
        orderForm.reset();
        setCoverImageFile(null);
        setAttachmentFile(null);
        // Обновляем заказы
        await Promise.all([loadOrders(), loadMyOrders()]);
        // Обновляем состояние заказа, если он открыт в деталях
        if (viewingOrderDetails && selectedOrderId === editingOrder.id) {
          // Переоткрываем с обновленными данными
          setTimeout(() => {
            setSelectedOrderId(null);
            setTimeout(() => {
              setSelectedOrderId(updatedOrder.id || editingOrder.id);
              setViewingOrderDetails(true);
            }, 50);
          }, 50);
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка обновления заказа');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить заказ',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrder(false);
    }
  };

  const onCreateOrder = async (values: OrderFormValues) => {
    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'Необходима авторизация',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingOrder(true);
      const skillsArray = values.required_skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const deadline = values.deadline_days && values.deadline_days > 0
        ? (() => {
            const today = new Date();
            const deadlineDate = new Date(today);
            deadlineDate.setDate(today.getDate() + values.deadline_days);
            const year = deadlineDate.getFullYear();
            const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
            const day = String(deadlineDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()
        : null;

      // Загружаем файлы если есть
      let coverImageUrl: string | null = null;
      const attachments: string[] = [];

      if (coverImageFile) {
        const formData = new FormData();
        formData.append('file', coverImageFile);
        formData.append('type', 'exchange_cover');
        const uploadResponse = await fetch(API_ENDPOINTS.fileUpload, {
          method: 'POST',
          headers: { 'X-User-Id': String(userId) },
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          coverImageUrl = uploadData.url;
        }
      }

      if (attachmentFile) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        formData.append('type', 'exchange_attachment');
        const uploadResponse = await fetch(API_ENDPOINTS.fileUpload, {
          method: 'POST',
          headers: { 'X-User-Id': String(userId) },
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          attachments.push(uploadData.url);
        }
      }

      const url = buildApiUrl({ type: 'exchange' });
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: userId,
          title: values.title.trim(),
          description: values.description.trim(),
          category: categoryMapping[values.category] || 'other',
          budget_min: values.budget_min || null,
          budget_max: values.budget_max || null,
          required_skills: skillsArray,
          deadline: deadline,
          cover_image_url: coverImageUrl,
          attachments: attachments,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Заказ успешно размещен',
        });
        setCreateOrderDialogOpen(false);
        orderForm.reset();
        setCoverImageFile(null);
        setAttachmentFile(null);
        await Promise.all([loadOrders(), loadMyOrders()]);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка создания заказа');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать заказ',
        variant: 'destructive',
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  const onSubmitProposal = async (values: ProposalFormValues) => {
    if (!userId || !selectedOrderId) return;

    try {
      setSubmittingProposal(true);
      const url = buildApiUrl({ type: 'exchange', path: '/proposals' });
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: selectedOrderId,
          freelancer_id: userId,
          price: values.price,
          message: (() => {
            const trimmed = values.message.trim();
            const maxLength = 5000;
            if (trimmed.length > maxLength) {
              setTimeout(() => {
                toast({
                  title: 'Внимание',
                  description: 'Сообщение было обрезано до 5000 символов',
                  variant: 'default',
                });
              }, 0);
              return trimmed.slice(0, maxLength);
            }
            return trimmed;
          })(),
          delivery_time_days: values.delivery_time_days || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Отклик отправлен',
        });
        setProposalDialogOpen(false);
        proposalForm.reset();
        await Promise.all([loadOrders(), loadMyProposals()]);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка отправки отклика');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить отклик',
        variant: 'destructive',
      });
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleProposalClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setProposalDialogOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      if (orders.length === 0) {
        loadOrders();
      }
    } else if (value === 'my-orders') {
      if (myOrders.length === 0) {
        loadMyOrders();
      }
    } else if (value === 'my-responses') {
      if (myProposals.length === 0) {
        loadMyProposals();
      }
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery && selectedCategory === 'all') {
      return orders;
    }
    return orders.filter(order => {
      const matchesSearch = !searchQuery || 
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || order.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [orders, searchQuery, selectedCategory]);

  const totalResponses = orders.reduce((sum, order) => sum + (order.responses_count || 0), 0);
  const totalInProgress = myOrders
    .filter(order => order.status === 'in_progress')
    .length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Биржа фриланса</h1>
            <p className="text-muted-foreground">Найдите исполнителя или возьмите заказ</p>
          </div>
          {userId && (userType !== 'freelancer' || !userType) && (
            <Dialog open={createOrderDialogOpen} onOpenChange={setCreateOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" className="mr-2" size={18} />
                  Разместить заказ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Разместить заказ</DialogTitle>
                <DialogDescription>Опишите задачу и получите отклики от исполнителей</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Форма */}
                <div>
                  <Form {...orderForm}>
                    <form onSubmit={orderForm.handleSubmit(onCreateOrder)} className="space-y-4 mt-4">
                  <FormField
                    control={orderForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название задачи</FormLabel>
                        <FormControl>
                          <Input placeholder="Например: Создать лендинг для услуг" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Категория</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Сайты">Сайты</SelectItem>
                            <SelectItem value="Боты">Боты</SelectItem>
                            <SelectItem value="Реклама">Реклама</SelectItem>
                            <SelectItem value="Дизайн">Дизайн</SelectItem>
                            <SelectItem value="Контент">Контент</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание задачи</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Подробно опишите, что нужно сделать"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={orderForm.control}
                      name="budget_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Бюджет от (₽)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="От" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  field.onChange(null);
                                } else {
                                  const num = Number(value);
                                  field.onChange(isNaN(num) ? null : num);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orderForm.control}
                      name="budget_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Бюджет до (₽)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="До" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  field.onChange(null);
                                } else {
                                  const num = Number(value);
                                  field.onChange(isNaN(num) ? null : num);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={orderForm.control}
                    name="deadline_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Срок выполнения (дней)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="7" 
                            {...field} 
                            value={field.value ?? ''} 
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(null);
                              } else {
                                const num = Number(value);
                                field.onChange(isNaN(num) ? null : num);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="required_skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Требуемые навыки</FormLabel>
                        <FormControl>
                          <Input placeholder="React, Tailwind, Figma" {...field} />
                        </FormControl>
                        <FormDescription>Укажите через запятую</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="max_proposals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Максимум откликов (необязательно)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Неограниченно" 
                            {...field} 
                            value={field.value ?? ''} 
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(null);
                              } else {
                                const num = Number(value);
                                field.onChange(isNaN(num) ? null : num);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>Оставьте пустым для неограниченного количества откликов</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label>Обложка заказа (фото)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setCoverImageFile(file || null);
                        }}
                        className="mt-2"
                      />
                      {coverImageFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Выбран файл: {coverImageFile.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Прикрепленный архив/файл</Label>
                      <Input
                        type="file"
                        accept=".zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setAttachmentFile(file || null);
                        }}
                        className="mt-2"
                      />
                      {attachmentFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Выбран файл: {attachmentFile.name}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateOrderDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={creatingOrder}>
                      {creatingOrder ? 'Создание...' : 'Опубликовать заказ'}
                    </Button>
                  </div>
                    </form>
                  </Form>
                </div>
                
                {/* Превью карточки */}
                <div className="sticky top-4 h-fit space-y-6">
                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">Превью в списке:</div>
                    <OrderCardPreviewCompact
                      title={orderForm.watch('title') || ''}
                      description={orderForm.watch('description') || ''}
                      budgetMin={orderForm.watch('budget_min') || null}
                      budgetMax={orderForm.watch('budget_max') || null}
                      category={orderForm.watch('category') || 'other'}
                      coverImageFile={coverImageFile}
                      deadline={orderForm.watch('deadline_days') ? (() => {
                        const today = new Date();
                        const deadlineDate = new Date(today);
                        deadlineDate.setDate(today.getDate() + (orderForm.watch('deadline_days') || 0));
                        return deadlineDate.toISOString().split('T')[0];
                      })() : null}
                    />
                  </div>
                  
                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">Превью карточки:</div>
                    <OrderCardPreviewFull
                      title={orderForm.watch('title') || ''}
                      description={orderForm.watch('description') || ''}
                      budgetMin={orderForm.watch('budget_min') || null}
                      budgetMax={orderForm.watch('budget_max') || null}
                      category={orderForm.watch('category') || 'other'}
                      coverImageFile={coverImageFile}
                      deadline={orderForm.watch('deadline_days') ? (() => {
                        const today = new Date();
                        const deadlineDate = new Date(today);
                        deadlineDate.setDate(today.getDate() + (orderForm.watch('deadline_days') || 0));
                        return deadlineDate.toISOString().split('T')[0];
                      })() : null}
                      requiredSkills={orderForm.watch('required_skills') 
                        ? orderForm.watch('required_skills').split(',').map((s: string) => s.trim()).filter(Boolean)
                        : []}
                      attachments={attachmentFile ? [URL.createObjectURL(attachmentFile)] : []}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Edit Order Dialog */}
        {userId && (
          <Dialog open={editOrderDialogOpen} onOpenChange={setEditOrderDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактировать заказ</DialogTitle>
                <DialogDescription>Обновите информацию о заказе</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Форма */}
                <div>
              <Form {...orderForm}>
                <form onSubmit={orderForm.handleSubmit(onUpdateOrder)} className="space-y-4 mt-4">
                  <FormField
                    control={orderForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название задачи</FormLabel>
                        <FormControl>
                          <Input placeholder="Например: Создать лендинг для услуг" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Категория</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Сайты">Сайты</SelectItem>
                            <SelectItem value="Боты">Боты</SelectItem>
                            <SelectItem value="Реклама">Реклама</SelectItem>
                            <SelectItem value="Дизайн">Дизайн</SelectItem>
                            <SelectItem value="Контент">Контент</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание задачи</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Подробно опишите, что нужно сделать"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={orderForm.control}
                      name="budget_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Бюджет от (₽)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="От" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  field.onChange(null);
                                } else {
                                  const num = Number(value);
                                  field.onChange(isNaN(num) ? null : num);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orderForm.control}
                      name="budget_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Бюджет до (₽)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="До" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  field.onChange(null);
                                } else {
                                  const num = Number(value);
                                  field.onChange(isNaN(num) ? null : num);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={orderForm.control}
                    name="deadline_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Срок выполнения (дней)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="7" 
                            {...field} 
                            value={field.value ?? ''} 
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(null);
                              } else {
                                const num = Number(value);
                                field.onChange(isNaN(num) ? null : num);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="required_skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Требуемые навыки</FormLabel>
                        <FormControl>
                          <Input placeholder="React, Tailwind, Figma" {...field} />
                        </FormControl>
                        <FormDescription>Укажите через запятую</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label>Обложка заказа (фото)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setCoverImageFile(file || null);
                        }}
                        className="mt-2"
                      />
                      {coverImageFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Выбран файл: {coverImageFile.name}
                        </p>
                      )}
                      {editingOrder?.cover_image_url && !coverImageFile && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">Текущая обложка:</p>
                          <img
                            src={editingOrder.cover_image_url.startsWith('http') ? editingOrder.cover_image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${editingOrder.cover_image_url}`}
                            alt="Текущая обложка"
                            className="w-32 h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Прикрепленный архив/файл</Label>
                      <Input
                        type="file"
                        accept=".zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setAttachmentFile(file || null);
                        }}
                        className="mt-2"
                      />
                      {attachmentFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Выбран файл: {attachmentFile.name}
                        </p>
                      )}
                      {editingOrder?.attachments && editingOrder.attachments.length > 0 && !attachmentFile && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">Текущие вложения ({editingOrder.attachments.length}):</p>
                          <div className="space-y-1">
                            {editingOrder.attachments.map((url: string, index: number) => {
                              const fullUrl = url.startsWith('http') 
                                ? url 
                                : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${url}`;
                              const fileName = url.split('/').pop() || `Файл ${index + 1}`;
                              return (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Icon name="Paperclip" size={14} />
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
                    </div>

                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditOrderDialogOpen(false);
                        setEditingOrder(null);
                        orderForm.reset();
                        setCoverImageFile(null);
                        setAttachmentFile(null);
                      }}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={updatingOrder}>
                      {updatingOrder ? 'Обновление...' : 'Сохранить изменения'}
                    </Button>
                  </div>
                </form>
              </Form>
                </div>
                
                {/* Превью карточки */}
                <div className="sticky top-4 h-fit space-y-6">
                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">Превью в списке:</div>
                    <OrderCardPreviewCompact
                      title={orderForm.watch('title') || editingOrder?.title || ''}
                      description={orderForm.watch('description') || editingOrder?.description || ''}
                      budgetMin={orderForm.watch('budget_min') || editingOrder?.budget_min || null}
                      budgetMax={orderForm.watch('budget_max') || editingOrder?.budget_max || null}
                      category={orderForm.watch('category') ? (categoryMap[categoryMapping[orderForm.watch('category')] || orderForm.watch('category')] || orderForm.watch('category')) : (editingOrder?.category ? (categoryMap[editingOrder.category] || editingOrder.category) : 'other')}
                      coverImageFile={coverImageFile}
                      coverImageUrl={!coverImageFile && editingOrder?.cover_image_url ? editingOrder.cover_image_url : null}
                      deadline={orderForm.watch('deadline_days') ? (() => {
                        const today = new Date();
                        const deadlineDate = new Date(today);
                        deadlineDate.setDate(today.getDate() + (orderForm.watch('deadline_days') || 0));
                        return deadlineDate.toISOString().split('T')[0];
                      })() : editingOrder?.deadline || null}
                    />
                  </div>
                  
                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">Превью карточки:</div>
                    <OrderCardPreviewFull
                      title={orderForm.watch('title') || editingOrder?.title || ''}
                      description={orderForm.watch('description') || editingOrder?.description || ''}
                      budgetMin={orderForm.watch('budget_min') || editingOrder?.budget_min || null}
                      budgetMax={orderForm.watch('budget_max') || editingOrder?.budget_max || null}
                      category={orderForm.watch('category') ? (categoryMap[categoryMapping[orderForm.watch('category')] || orderForm.watch('category')] || orderForm.watch('category')) : (editingOrder?.category ? (categoryMap[editingOrder.category] || editingOrder.category) : 'other')}
                      coverImageFile={coverImageFile}
                      coverImageUrl={!coverImageFile && editingOrder?.cover_image_url ? editingOrder.cover_image_url : null}
                      deadline={orderForm.watch('deadline_days') ? (() => {
                        const today = new Date();
                        const deadlineDate = new Date(today);
                        deadlineDate.setDate(today.getDate() + (orderForm.watch('deadline_days') || 0));
                        return deadlineDate.toISOString().split('T')[0];
                      })() : editingOrder?.deadline || null}
                      requiredSkills={orderForm.watch('required_skills') 
                        ? orderForm.watch('required_skills').split(',').map((s: string) => s.trim()).filter(Boolean)
                        : editingOrder?.required_skills || []}
                      attachments={attachmentFile 
                        ? [URL.createObjectURL(attachmentFile)]
                        : editingOrder?.attachments || []}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="Briefcase" size={24} className="text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">{filteredOrders.length}</div>
              <div className="text-sm text-muted-foreground">Активных заказов</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="Users" size={24} className="text-secondary" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalResponses}</div>
              <div className="text-sm text-muted-foreground">Откликов</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="Clock" size={24} className="text-orange-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{myOrders.length}</div>
              <div className="text-sm text-muted-foreground">Мои заказы</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="DollarSign" size={24} className="text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalInProgress}</div>
              <div className="text-sm text-muted-foreground">В работе</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">Все заказы</TabsTrigger>
            <TabsTrigger value="my-orders">Мои заказы</TabsTrigger>
            <TabsTrigger value="my-responses">Мои отклики</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle>Доступные заказы</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск..."
                      className="w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        <SelectItem value="site_development">Сайты</SelectItem>
                        <SelectItem value="bot_development">Боты</SelectItem>
                        <SelectItem value="design">Дизайн</SelectItem>
                        <SelectItem value="content">Контент</SelectItem>
                        <SelectItem value="marketing">Реклама</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
                    Загрузка заказов...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Briefcase" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Нет доступных заказов</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || selectedCategory !== 'all' 
                        ? 'Попробуйте изменить параметры поиска'
                        : 'Заказы появятся здесь, когда их разместят'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="relative cursor-pointer" onClick={() => {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/eb54716a-3ea1-4cc4-9ffc-4c79b3e95ef8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Exchange.tsx:1545',message:'Order card clicked',data:{orderId:order.id,hasCoverImage:!!order.cover_image_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                        // #endregion
                        setSelectedOrderId(order.id);
                        setViewingOrderDetails(true);
                      }}>
                        <OrderCardPreviewCompact
                          title={order.title}
                          description={order.description}
                          budgetMin={order.budget_min}
                          budgetMax={order.budget_max}
                          category={order.category}
                          coverImageUrl={order.cover_image_url}
                          deadline={order.deadline}
                          proposalsCount={order.proposals_count || order.responses_count}
                          viewsCount={order.views_count}
                          clientRating={order.client_rating}
                        />
                        <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {userType === 'freelancer' && (
                            <Button
                              onClick={() => handleProposalClick(order.id)}
                              disabled={order.client_id === userId}
                              title={order.client_id === userId ? 'Это ваш заказ' : 'Откликнуться на заказ'}
                            >
                              <Icon name="Send" className="mr-2" size={16} />
                              Откликнуться
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setViewingOrderDetails(true);
                            }}
                          >
                            <Icon name="Eye" className="mr-2" size={16} />
                            Просмотр
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-orders" className="space-y-4">
            {loadingMyOrders ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
                Загрузка...
              </div>
            ) : myOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="Briefcase" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">У вас пока нет заказов</h3>
                  <p className="text-muted-foreground mb-6">
                    Разместите первый заказ, чтобы найти исполнителя
                  </p>
                  <Button onClick={() => setCreateOrderDialogOpen(true)}>Разместить заказ</Button>
                </CardContent>
              </Card>
            ) : (
              myOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{order.title}</h3>
                          <Badge>
                            {order.status === 'in_progress' ? 'В работе' : 
                             order.status === 'completed' ? 'Завершен' :
                             order.status === 'cancelled' ? 'Отменен' :
                             order.status === 'dispute' ? 'Спор' : 'Открыт'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{order.description}</p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Icon name="DollarSign" size={16} className="text-green-600" />
                            <span className="font-semibold">
                              {order.budget_min && order.budget_max
                                ? `₽${order.budget_min.toLocaleString()} - ₽${order.budget_max.toLocaleString()}`
                                : order.budget_min
                                ? `от ₽${order.budget_min.toLocaleString()}`
                                : order.budget_max
                                ? `до ₽${order.budget_max.toLocaleString()}`
                                : 'По договоренности'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Shield" size={16} className="text-blue-600" />
                            <span>Escrow защита</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setViewingProposals(true);
                            }}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Icon name="Users" size={16} />
                            <span className="font-semibold">{order.proposals_count || order.responses_count || 0} откликов</span>
                            {order.max_proposals && (
                              <span className="text-xs text-muted-foreground">/ {order.max_proposals} макс.</span>
                            )}
                          </button>
                          {order.views_count !== undefined && order.views_count > 0 && (
                            <div className="flex items-center gap-2">
                              <Icon name="Eye" size={16} className="text-gray-600" />
                              <span>{order.views_count} просмотров</span>
                            </div>
                          )}
                          {order.client_rating !== undefined && order.client_rating > 0 && (
                            <div className="flex items-center gap-2">
                              <Icon name="Star" size={16} className="text-yellow-600 fill-yellow-600" />
                              <span className="font-semibold">{order.client_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {order.status === 'open' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOrder(order)}
                              disabled={deletingOrderId === order.id}
                            >
                              <Icon name="Edit" className="mr-2" size={16} />
                              Редактировать
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deletingOrderId === order.id}
                            >
                              {deletingOrderId === order.id ? (
                                <Icon name="Loader2" className="animate-spin" size={16} />
                              ) : (
                                <>
                                  <Icon name="Trash2" className="mr-2" size={16} />
                                  Удалить
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/dashboard/support?create_from_order=${order.id}`);
                          }}
                          title="Создать тикет поддержки по этому заказу"
                        >
                          <Icon name="MessageSquare" className="mr-2" size={16} />
                          Поддержка
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Открыть детали заказа в модальном окне
                            setSelectedOrderId(order.id);
                            setViewingProposals(true);
                          }}
                        >
                          <Icon name="Eye" className="mr-2" size={16} />
                          Просмотр
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="my-responses">
            {loadingMyProposals ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
                Загрузка...
              </div>
            ) : myProposals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="Send" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Пока нет откликов</h3>
                  <p className="text-muted-foreground mb-6">
                    Откликайтесь на заказы, чтобы зарабатывать на своих навыках
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabChange('all')}
                  >
                    Смотреть все заказы
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myProposals.map((proposal) => {
                  const order = orders.find(o => o.id === proposal.order_id);
                  return (
                    <Card key={proposal.id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{order?.title || 'Заказ #' + proposal.order_id}</h3>
                              <Badge>
                                {proposal.status === 'accepted' ? 'Принят' :
                                 proposal.status === 'rejected' ? 'Отклонен' :
                                 proposal.status === 'withdrawn' ? 'Отозван' : 'Ожидает'}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">{proposal.message}</p>
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
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFreelancerId(proposal.freelancer_id)}
                          >
                            <Icon name="User" className="mr-2" size={16} />
                            Профиль
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Escrow-система</CardTitle>
            <CardDescription>Безопасные сделки с гарантией оплаты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-border rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Lock" className="text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Защита средств</h4>
                <p className="text-sm text-muted-foreground">
                  Деньги хранятся на платформе до завершения работы
                </p>
              </div>

              <div className="text-center p-6 border border-border rounded-lg">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Shield" className="text-secondary" />
                </div>
                <h4 className="font-semibold mb-2">Арбитраж</h4>
                <p className="text-sm text-muted-foreground">
                  Решаем споры справедливо с помощью экспертов
                </p>
              </div>

              <div className="text-center p-6 border border-border rounded-lg">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Star" className="text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Рейтинг</h4>
                <p className="text-sm text-muted-foreground">
                  Отзывы и оценки помогают выбрать исполнителя
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Откликнуться на заказ</DialogTitle>
            <DialogDescription>Предложите свою цену и сроки выполнения</DialogDescription>
          </DialogHeader>
          <Form {...proposalForm}>
            <form onSubmit={proposalForm.handleSubmit(onSubmitProposal)} className="space-y-4 mt-4">
              <FormField
                control={proposalForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ваша цена (₽)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10000" 
                        {...field} 
                        value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''} 
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          if (value === '') {
                            field.onChange(null);
                          } else {
                            const num = Number(value);
                            if (!isNaN(num) && num > 0) {
                              field.onChange(num);
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={proposalForm.control}
                name="delivery_time_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Срок выполнения (дней)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="7" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            field.onChange(null);
                          } else {
                            const num = Number(value);
                            field.onChange(isNaN(num) ? null : num);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={proposalForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сообщение</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Расскажите, почему вы подходите для этого заказа"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProposalDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={submittingProposal}>
                  {submittingProposal ? 'Отправка...' : 'Отправить отклик'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Freelancer Profile Dialog */}
      {selectedFreelancerId && (
        <FreelancerProfile
          freelancerId={selectedFreelancerId}
          onClose={() => setSelectedFreelancerId(null)}
        />
      )}

      {/* Order Proposals Dialog */}
      {viewingProposals && selectedOrderId && (
        <OrderProposals
          orderId={selectedOrderId}
          onClose={() => {
            setViewingProposals(false);
            setSelectedOrderId(null);
          }}
          onProposalAccepted={() => {
            loadMyOrders();
            loadOrders();
          }}
        />
      )}

      {/* Order Details Dialog */}
      {viewingOrderDetails && selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => {
            setViewingOrderDetails(false);
            setSelectedOrderId(null);
          }}
          onEdit={(order) => {
            handleEditOrder(order);
            setViewingOrderDetails(false);
          }}
          onDelete={(orderId) => {
            handleDeleteOrder(orderId);
            setViewingOrderDetails(false);
            loadMyOrders();
            loadOrders();
          }}
          onProposalClick={handleProposalClick}
        />
      )}
    </DashboardLayout>
  );
};

export default Exchange;
