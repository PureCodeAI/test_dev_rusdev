import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = user?.id ? String(user.id) : null;
  const [filter, setFilter] = useState('all');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [_editingProduct, setEditingProduct] = useState<string | null>(null);
  const [_loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    price: '',
    priceCurrency: 'rub',
    priceWB: '',
    priceOzon: '',
    cost: '',
    photos: [] as File[]
  });
  const [connectedMarketplaces, setConnectedMarketplaces] = useState<Array<{
    id: string;
    name: string;
    connected: boolean;
  }>>([]);
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    price: number;
    photo: string;
    status: string;
    statusColor: string;
    views: number;
    purchases: number;
    reviews: { count: number; rating: number };
    marketplaces: string[];
  }>>([]);
  const [packages, setPackages] = useState<Array<{
    id: string;
    name: string;
    price: number;
    popular?: boolean;
    features: string[];
  }>>([]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=products&action=list&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.product_id),
            name: String(item.name || item.title || 'Товар'),
            price: Number(item.price || 0),
            photo: String(item.photo || item.image || '📦'),
            status: String(item.status || 'active'),
            statusColor: String(item.status) === 'active' ? 'bg-green-100 text-green-800' :
                        String(item.status) === 'moderation' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800',
            views: Number(item.views || 0),
            purchases: Number(item.purchases || item.sales || 0),
            reviews: {
              count: Number(item.reviews_count || 0),
              rating: Number(item.rating || 0)
            },
            marketplaces: Array.isArray(item.marketplaces) ? item.marketplaces.map((m: unknown) => String(m)) : []
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading products', error instanceof Error ? error : new Error(String(error || 'Unknown error')), { userId });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadMarketplaceConnections = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.integrations}?type=marketplace&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setConnectedMarketplaces(data.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.marketplace_id),
            name: String(item.marketplace_name || item.name || ''),
            connected: Boolean(item.is_connected || item.connected || false)
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading marketplace connections', error instanceof Error ? error : new Error(String(error)), { userId });
      setConnectedMarketplaces([
        { id: 'wb', name: 'Wildberries', connected: false },
        { id: 'ozon', name: 'Ozon', connected: false },
        { id: 'yandex', name: 'Яндекс.Маркет', connected: false }
      ]);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadProducts();
      loadPackages();
      loadMarketplaceConnections();
    }
  }, [userId, loadProducts, loadMarketplaceConnections]);

  const loadPackages = async () => {
    try {
      const defaultPackages = [
        {
          id: '1',
          name: 'Базовый',
          price: 2990,
          popular: false,
          features: [
            'Размещение 5 товаров',
            'Базовая оптимизация',
            'Поддержка 1 месяц'
          ]
        },
        {
          id: '2',
          name: 'Стандарт',
          price: 7990,
          popular: true,
          features: [
            'Размещение 20 товаров',
            'Полная оптимизация',
            'Интеграция с маркетплейсами',
            'Поддержка 3 месяца',
            'Аналитика продаж'
          ]
        },
        {
          id: '3',
          name: 'Премиум',
          price: 14990,
          popular: false,
          features: [
            'Неограниченное количество товаров',
            'Профессиональная оптимизация',
            'Все маркетплейсы',
            'Поддержка 6 месяцев',
            'Расширенная аналитика',
            'Персональный менеджер',
            'Автоматическое обновление цен'
          ]
        }
      ];
      setPackages(defaultPackages);
    } catch (error) {
      logger.error('Error loading packages', error instanceof Error ? error : new Error(String(error || 'Unknown error')));
      setPackages([]);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля (название и цена)",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userId || '');
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('tags', productForm.tags);
      formData.append('price', productForm.price);
      formData.append('price_currency', productForm.priceCurrency);
      formData.append('price_wb', productForm.priceWB);
      formData.append('price_ozon', productForm.priceOzon);
      formData.append('cost', productForm.cost);
      
      productForm.photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      const response = await fetch(`${API_ENDPOINTS.blocks}?type=products&action=create`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Товар сохранен",
        });
        setAddProductOpen(false);
        setProductForm({
          name: '',
          description: '',
          category: '',
          tags: '',
          price: '',
          priceCurrency: 'rub',
          priceWB: '',
          priceOzon: '',
          cost: '',
          photos: []
        });
        loadProducts();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      logger.error('Error saving product', error instanceof Error ? error : new Error(String(error)), { userId, productName: productForm.name });
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить товар",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId);
    navigate(`/dashboard/products/edit/${productId}`);
  };

  const handleViewProductStats = (productId: string) => {
    navigate(`/dashboard/products/stats/${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=products&action=delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: userId
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Товар удален",
        });
        loadProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      logger.error('Error deleting product', error instanceof Error ? error : new Error(String(error)), { userId, productId });
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };


  const handleConnectMarketplace = async (marketplaceId: string, marketplaceName: string) => {
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Необходима авторизация",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.integrations}?type=marketplace&action=connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          marketplace_id: marketplaceId,
          marketplace_name: marketplaceName
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Подключение к ${marketplaceName} инициировано`,
        });
        loadMarketplaceConnections();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to connect marketplace');
      }
    } catch (error) {
      logger.error('Error connecting marketplace', error instanceof Error ? error : new Error(String(error)), { userId, marketplaceId, marketplaceName });
      toast({
        title: "Ошибка",
        description: `Не удалось подключить ${marketplaceName}`,
        variant: "destructive",
      });
    }
  };

  const getMarketplaceStatus = (marketplaceId: string): boolean => {
    const marketplace = connectedMarketplaces.find(m => m.id === marketplaceId);
    return marketplace?.connected || false;
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'marketplaces') return p.marketplaces.length > 0;
    if (filter === 'site') return p.marketplaces.length === 0;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Мои товары</h1>
            <p className="text-muted-foreground">Управление каталогом товаров</p>
          </div>
          <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить товар</DialogTitle>
                <DialogDescription>Заполните информацию о товаре</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="main">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="main">Основное</TabsTrigger>
                  <TabsTrigger value="photos">Фото</TabsTrigger>
                  <TabsTrigger value="prices">Цены</TabsTrigger>
                  <TabsTrigger value="marketplaces">Маркетплейсы</TabsTrigger>
                </TabsList>

                <TabsContent value="main" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Название товара</Label>
                    <Input 
                      placeholder="Например: Органический кофе Арабика" 
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Описание</Label>
                    <textarea
                      className="w-full p-3 border border-border rounded-md resize-none"
                      rows={5}
                      placeholder="Подробное описание товара..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Продукты питания</SelectItem>
                        <SelectItem value="drinks">Напитки</SelectItem>
                        <SelectItem value="accessories">Аксессуары</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Теги</Label>
                    <Input 
                      placeholder="кофе, органический, премиум" 
                      value={productForm.tags}
                      onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Разделяйте теги запятой</p>
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Перетащите изображения или нажмите для выбора</p>
                    <p className="text-xs text-muted-foreground">До 10 фотографий, JPG или PNG, до 5 МБ каждое</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center relative group">
                        <Icon name="Image" size={32} className="text-muted-foreground" />
                        <button className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="prices" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Цена на сайте</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="1000" 
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      />
                      <Select 
                        value={productForm.priceCurrency} 
                        onValueChange={(value) => setProductForm({ ...productForm, priceCurrency: value })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rub">₽</SelectItem>
                          <SelectItem value="usd">$</SelectItem>
                          <SelectItem value="eur">€</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Цена на Wildberries</Label>
                    <Input 
                      type="number" 
                      placeholder="890" 
                      value={productForm.priceWB}
                      onChange={(e) => setProductForm({ ...productForm, priceWB: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">С учетом комиссии маркетплейса</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Цена на Ozon</Label>
                    <Input 
                      type="number" 
                      placeholder="920" 
                      value={productForm.priceOzon}
                      onChange={(e) => setProductForm({ ...productForm, priceOzon: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Себестоимость (опционально)</Label>
                    <Input 
                      type="number" 
                      placeholder="500" 
                      value={productForm.cost}
                      onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Для расчета прибыли</p>
                  </div>
                </TabsContent>

                <TabsContent value="marketplaces" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center">
                              <Icon name="ShoppingBag" className="text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold">Wildberries</div>
                              <div className={`text-xs ${getMarketplaceStatus('wb') ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {getMarketplaceStatus('wb') ? 'Подключен' : 'Не подключен'}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            variant={getMarketplaceStatus('wb') ? 'outline' : 'default'}
                            onClick={() => handleConnectMarketplace('wb', 'Wildberries')}
                            disabled={getMarketplaceStatus('wb')}
                          >
                            {getMarketplaceStatus('wb') ? 'Настроить' : 'Добавить'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                              <Icon name="ShoppingCart" className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold">Ozon</div>
                              <div className={`text-xs ${getMarketplaceStatus('ozon') ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {getMarketplaceStatus('ozon') ? 'Подключен' : 'Не подключен'}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            variant={getMarketplaceStatus('ozon') ? 'outline' : 'default'}
                            onClick={() => handleConnectMarketplace('ozon', 'Ozon')}
                            disabled={getMarketplaceStatus('ozon')}
                          >
                            {getMarketplaceStatus('ozon') ? 'Настроить' : 'Добавить'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center">
                              <Icon name="Store" className="text-red-600" />
                            </div>
                            <div>
                              <div className="font-semibold">Яндекс.Маркет</div>
                              <div className={`text-xs ${getMarketplaceStatus('yandex') ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {getMarketplaceStatus('yandex') ? 'Подключен' : 'Не подключен'}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            variant={getMarketplaceStatus('yandex') ? 'outline' : 'default'}
                            onClick={() => handleConnectMarketplace('yandex', 'Яндекс.Маркет')}
                            disabled={getMarketplaceStatus('yandex')}
                          >
                            {getMarketplaceStatus('yandex') ? 'Настроить' : 'Добавить'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Info" size={16} />
                      Автоматическое отслеживание
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      После подключения мы будем автоматически отслеживать продажи, отзывы и остатки на маркетплейсах
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleSaveProduct}>Сохранить</Button>
                <Button variant="outline" onClick={() => {
                  setAddProductOpen(false);
                  setProductForm({
                    name: '',
                    description: '',
                    category: '',
                    tags: '',
                    price: '',
                    priceCurrency: 'rub',
                    priceWB: '',
                    priceOzon: '',
                    cost: '',
                    photos: []
                  });
                }}>Отмена</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Все
          </Button>
          <Button
            variant={filter === 'marketplaces' ? 'default' : 'outline'}
            onClick={() => setFilter('marketplaces')}
          >
            На маркетплейсах
          </Button>
          <Button
            variant={filter === 'site' ? 'default' : 'outline'}
            onClick={() => setFilter('site')}
          >
            Только на сайте
          </Button>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-4xl flex-shrink-0">
                      {product.photo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                      <div className="text-2xl font-bold text-primary mb-2">₽{product.price}</div>
                      <Badge className={product.statusColor}>
                        {product.status === 'active' && 'Активен'}
                        {product.status === 'moderation' && 'На модерации'}
                        {product.status === 'hidden' && 'Скрыт'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Просмотры</div>
                      <div className="font-semibold">{product.views}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Покупки</div>
                      <div className="font-semibold">{product.purchases}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Отзывы</div>
                      <div className="font-semibold flex items-center gap-1">
                        {product.reviews.count}
                        <Icon name="Star" size={12} className="text-yellow-500 fill-yellow-500" />
                        {product.reviews.rating}
                      </div>
                    </div>
                  </div>

                  {product.marketplaces.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {product.marketplaces.includes('wb') && (
                        <Badge variant="outline" className="text-xs">WB</Badge>
                      )}
                      {product.marketplaces.includes('ozon') && (
                        <Badge variant="outline" className="text-xs">Ozon</Badge>
                      )}
                      {product.marketplaces.includes('yandex') && (
                        <Badge variant="outline" className="text-xs">Я.Маркет</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditProduct(product.id)}
                    >
                      <Icon name="Edit" className="mr-2" size={14} />
                      Редактировать
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewProductStats(product.id)}
                    >
                      <Icon name="BarChart3" size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Icon name="Package" size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">У вас пока нет товаров</h3>
              <p className="text-muted-foreground mb-6">Добавьте первый товар и начните продавать</p>
              <Button onClick={() => setAddProductOpen(true)}>
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить первый товар
              </Button>
            </div>
          </Card>
        )}

        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Услуги под ключ</CardTitle>
            <CardDescription>
              Профессиональные товароведы разместят и оптимизируют ваши товары на маркетплейсах
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${pkg.popular ? 'border-2 border-primary shadow-lg' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Популярный
                </div>
              )}
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <div className="text-3xl font-bold mt-2">₽{pkg.price.toLocaleString()}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pkg.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Icon name="Check" size={18} className="text-primary mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={pkg.popular ? 'default' : 'outline'}>
                  Заказать
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;
