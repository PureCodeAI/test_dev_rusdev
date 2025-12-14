import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { ProductCardPreview } from '@/components/marketplace/ProductCardPreview';
import { ProductCardPreviewCompact } from '@/components/marketplace/ProductCardPreviewCompact';

interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  item_type: string;
  item_subtype?: string;
  price: number;
  rating: number;
  sales_count: number;
  preview_image?: string;
  screenshots?: string[];
  cover_image_url?: string;
  gallery_images?: string[];
  delivery_type?: 'manual' | 'auto' | 'repeatable';
  auto_delivery_content?: string;
  attached_file_url?: string;
  attached_file_name?: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  seller_id: number;
  created_at: string;
}

const Marketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [myProducts, setMyProducts] = useState<MarketplaceItem[]>([]);
  const [purchases, setPurchases] = useState<Array<Record<string, unknown>>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    myPurchases: 0,
    myProducts: 0,
    earned: 0,
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: 'site_templates',
    item_type: 'template',
    item_subtype: 'template',
    price: 0,
    domain_name: '',
    hosting_expires_at: '',
    screenshots: [] as File[],
    coverImage: null as File | null,
    attachedFile: null as File | null,
    deliveryType: 'manual' as 'manual' | 'auto' | 'repeatable',
    autoDeliveryContent: '',
    galleryImages: [] as File[],
  });

  const categories = [
    { id: 'all', name: 'Все категории' },
    { id: 'site_templates', name: 'Шаблоны сайтов' },
    { id: 'bot_templates', name: 'Шаблоны ботов' },
    { id: 'projects', name: 'Проекты' },
    { id: 'domains', name: 'Домены' },
    { id: 'hosting', name: 'Хостинг' },
    { id: 'scripts', name: 'Скрипты' },
    { id: 'extensions', name: 'Расширения' },
  ];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = user?.id;
      if (!userId) {
        toast({
          title: 'Ошибка',
          description: 'Необходима авторизация для загрузки данных',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Загружаем товары каталога
      const params = new URLSearchParams();
      params.append('type', 'marketplace');
      params.append('action', 'list');
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const itemsResponse = await fetch(`${API_ENDPOINTS.marketplace}?${params.toString()}`);
      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        setProducts(items.filter((item: MarketplaceItem) => item.moderation_status === 'approved'));
        setStats(prev => ({ ...prev, totalProducts: items.length }));
      }

      // Загружаем мои товары
      const myItemsParams = new URLSearchParams();
      myItemsParams.append('type', 'marketplace');
      myItemsParams.append('action', 'list');
      myItemsParams.append('seller_id', String(userId));
      const myItemsResponse = await fetch(`${API_ENDPOINTS.marketplace}?${myItemsParams.toString()}`);
      if (myItemsResponse.ok) {
        const myItems = await myItemsResponse.json();
        setMyProducts(myItems);
        setStats(prev => ({ ...prev, myProducts: myItems.length }));
      }

      // Загружаем покупки
      const purchasesParams = new URLSearchParams();
      purchasesParams.append('type', 'marketplace');
      purchasesParams.append('action', 'purchases');
      purchasesParams.append('buyer_id', String(userId));
      const purchasesResponse = await fetch(`${API_ENDPOINTS.marketplace}?${purchasesParams.toString()}`);
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);
        setStats(prev => ({ ...prev, myPurchases: purchasesData.length }));
      }

      // Загружаем статистику заработка
      const earningsParams = new URLSearchParams();
      earningsParams.append('type', 'marketplace');
      earningsParams.append('action', 'earnings');
      earningsParams.append('seller_id', String(userId));
      const earningsResponse = await fetch(`${API_ENDPOINTS.marketplace}?${earningsParams.toString()}`);
      if (earningsResponse.ok) {
        const earnings = await earningsResponse.json();
        setStats(prev => ({ ...prev, earned: earnings.total || 0 }));
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedCategory, searchQuery, toast]);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, loadData]);

  const handleAddProduct = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Загружаем обложку товара
      let coverImageUrl: string | null = null;
      if (newProduct.coverImage) {
        const coverFormData = new FormData();
        coverFormData.append('file', newProduct.coverImage);
        coverFormData.append('type', 'marketplace_cover');

        const coverUploadResponse = await fetch(API_ENDPOINTS.fileUpload, {
          method: 'POST',
          headers: { 'X-User-Id': String(userId) },
          body: coverFormData,
        });

        if (coverUploadResponse.ok) {
          const coverData = await coverUploadResponse.json();
          coverImageUrl = coverData.url;
        }
      }

      // Загружаем скриншоты (галерея)
      const galleryImageUrls: string[] = [];
      for (const file of newProduct.galleryImages) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'marketplace_screenshot');

        const uploadResponse = await fetch(API_ENDPOINTS.fileUpload, {
          method: 'POST',
          headers: { 'X-User-Id': String(userId) },
          body: formData,
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          galleryImageUrls.push(data.url);
        }
      }

      // Загружаем прикрепленный файл (для автовыдачи) - файл может быть загружен для автовыдачи
      let attachedFileUrl: string | null = null;
      let attachedFileName: string | null = null;
      if (newProduct.deliveryType === 'auto' || newProduct.deliveryType === 'repeatable') {
        if (newProduct.attachedFile) {
          const fileFormData = new FormData();
          fileFormData.append('file', newProduct.attachedFile);
          fileFormData.append('type', 'marketplace_attachment');

          const fileUploadResponse = await fetch(API_ENDPOINTS.fileUpload, {
            method: 'POST',
            headers: { 'X-User-Id': String(userId) },
            body: fileFormData,
          });

          if (fileUploadResponse.ok) {
            const fileData = await fileUploadResponse.json();
            attachedFileUrl = fileData.url;
            attachedFileName = newProduct.attachedFile.name;
          } else {
            const errorData = await fileUploadResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Не удалось загрузить файл для автовыдачи');
          }
        }
        // Если нет файла, но есть контент - это тоже допустимо (например, только ключи)
      }

      const response = await fetch(`${API_ENDPOINTS.marketplace}?type=marketplace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          seller_id: userId,
          title: newProduct.title,
          description: newProduct.description,
          category: newProduct.category,
          item_type: newProduct.item_type,
          item_subtype: newProduct.item_subtype,
          price: newProduct.price,
          domain_name: newProduct.domain_name || null,
          hosting_expires_at: newProduct.hosting_expires_at || null,
          cover_image_url: coverImageUrl,
          gallery_images: galleryImageUrls,
          delivery_type: newProduct.deliveryType,
          auto_delivery_content: (newProduct.deliveryType === 'auto' || newProduct.deliveryType === 'repeatable') 
            ? (newProduct.autoDeliveryContent?.trim() || '') 
            : null,
          attached_file_url: attachedFileUrl,
          attached_file_name: attachedFileName,
          moderation_status: 'pending',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create product');
      }

      toast({
        title: 'Успешно',
        description: 'Товар отправлен на модерацию',
      });

      setShowAddDialog(false);
      setNewProduct({
        title: '',
        description: '',
        category: 'site_templates',
        item_type: 'template',
        item_subtype: 'template',
        price: 0,
        domain_name: '',
        hosting_expires_at: '',
        screenshots: [],
        coverImage: null,
        attachedFile: null,
        deliveryType: 'manual',
        autoDeliveryContent: '',
        galleryImages: [],
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать товар',
        variant: 'destructive',
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handlePurchase = async (itemId: number) => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_ENDPOINTS.marketplace}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          buyer_id: userId,
          item_id: itemId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Purchase failed');
      }

      const purchaseData = await response.json();
      
      // Если товар с автовыдачей, показываем выданный контент
      if (purchaseData.delivered_content || purchaseData.delivered_file_url) {
        let message = 'Товар успешно приобретен!\n\n';
        if (purchaseData.delivered_content) {
          message += `Выданный контент:\n${purchaseData.delivered_content}\n\n`;
        }
        if (purchaseData.delivered_file_url) {
          message += `Файл доступен по ссылке: ${purchaseData.delivered_file_url}`;
        }
        
        toast({
          title: 'Товар выдан',
          description: message,
          duration: 10000,
        });
      } else {
        toast({
          title: 'Успешно',
          description: 'Покупка оформлена. Товар будет выдан продавцом вручную.',
        });
      }
      
      // Если товар с автовыдачей, показываем выданное содержимое
      if (purchaseData.delivered_content || purchaseData.delivered_file_url) {
        let message = 'Товар приобретен и выдан!';
        if (purchaseData.delivered_content) {
          message += `\n\nВыданное содержимое:\n${purchaseData.delivered_content}`;
        }
        if (purchaseData.delivered_file_url) {
          message += `\n\nФайл: ${purchaseData.delivered_file_url}`;
        }
        toast({
          title: 'Успешно',
          description: message,
        });
      } else {
        toast({
          title: 'Успешно',
          description: 'Товар приобретен. Продавец выдаст его вручную.',
        });
      }

      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось приобрести товар',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Маркетплейс</h1>
            <p className="text-muted-foreground">Готовые решения для вашего бизнеса</p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="Store" size={24} className="text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalProducts}</div>
              <div className="text-sm text-muted-foreground">Товаров в каталоге</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="ShoppingCart" size={24} className="text-secondary" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.myPurchases}</div>
              <div className="text-sm text-muted-foreground">Моих покупок</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="Upload" size={24} className="text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.myProducts}</div>
              <div className="text-sm text-muted-foreground">Моих товаров</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon name="DollarSign" size={24} className="text-orange-500" />
              </div>
              <div className="text-3xl font-bold mb-1">₽{stats.earned.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Заработано</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="catalog">
          <TabsList>
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="my-purchases">Мои покупки</TabsTrigger>
            <TabsTrigger value="my-products">Мои товары</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle>Все товары</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск..."
                      className="w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={32} />
                    <p className="text-muted-foreground">Загрузка...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Store" className="mx-auto mb-4 opacity-50" size={48} />
                    <p className="text-muted-foreground">Товары не найдены</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCardPreviewCompact
                        key={product.id}
                        title={product.title}
                        description={product.description}
                        price={product.price}
                        category={product.category}
                        coverImageUrl={product.cover_image_url || product.preview_image}
                        deliveryType={product.delivery_type}
                        rating={product.rating}
                        salesCount={product.sales_count}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-purchases" className="space-y-6">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Пока нет покупок</h3>
                  <p className="text-muted-foreground mb-6">
                    Приобретите готовые решения, чтобы ускорить развитие бизнеса
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const catalogTab = document.querySelector('[value="catalog"]') as HTMLElement;
                      if (catalogTab) catalogTab.click();
                    }}
                  >
                    Смотреть каталог
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((purchase) => {
                  const purchaseId = typeof purchase.id === 'number' ? purchase.id : Number(purchase.id) || 0;
                  const purchaseItem = purchase.item as Record<string, unknown> | undefined;
                  const purchaseTitle = purchaseItem ? String(purchaseItem.title || '') : '';
                  const purchaseDate = String(purchase.purchased_at || '');
                  const purchasePrice = Number(purchase.price || 0);
                  return (
                    <Card key={purchaseId}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{purchaseTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Куплено: {purchaseDate ? new Date(purchaseDate).toLocaleDateString('ru-RU') : 'Не указано'}
                        </p>
                        <div className="text-xl font-bold">₽{purchasePrice.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-products" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Plus" className="mr-2" size={18} />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Добавить товар</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о товаре. После модерации он будет опубликован.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Форма */}
                    <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Название</Label>
                      <Input
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        placeholder="Название товара"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Подробное описание товара"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Категория</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c.id !== 'all').map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Тип товара</Label>
                        <Select
                          value={newProduct.item_subtype}
                          onValueChange={(value) => setNewProduct({ ...newProduct, item_subtype: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="template">Шаблон</SelectItem>
                            <SelectItem value="project">Проект</SelectItem>
                            <SelectItem value="domain">Домен</SelectItem>
                            <SelectItem value="hosting">Хостинг</SelectItem>
                            <SelectItem value="script">Скрипт</SelectItem>
                            <SelectItem value="extension">Расширение</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {(newProduct.item_subtype === 'domain' || newProduct.item_subtype === 'hosting') && (
                      <div className="space-y-2">
                        <Label>
                          {newProduct.item_subtype === 'domain' ? 'Домен' : 'Дата окончания хостинга'}
                        </Label>
                        {newProduct.item_subtype === 'domain' ? (
                          <Input
                            value={newProduct.domain_name}
                            onChange={(e) => setNewProduct({ ...newProduct, domain_name: e.target.value })}
                            placeholder="example.com"
                          />
                        ) : (
                          <Input
                            type="date"
                            value={newProduct.hosting_expires_at}
                            onChange={(e) => setNewProduct({ ...newProduct, hosting_expires_at: e.target.value })}
                          />
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Цена (₽)</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Обложка товара (фото)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setNewProduct({ ...newProduct, coverImage: file || null });
                        }}
                      />
                      {newProduct.coverImage && (
                        <p className="text-sm text-muted-foreground">
                          Выбран файл: {newProduct.coverImage.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Галерея изображений</Label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setNewProduct({ ...newProduct, galleryImages: files });
                        }}
                      />
                      {newProduct.galleryImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newProduct.galleryImages.map((file, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Скриншоты (до 5)</Label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setNewProduct({ ...newProduct, screenshots: files.slice(0, 5) });
                        }}
                      />
                      {newProduct.screenshots.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {newProduct.screenshots.map((file, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Прикрепленный файл/архив (сайт, проект и т.д.)</Label>
                      <Input
                        type="file"
                        accept=".zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setNewProduct({ ...newProduct, attachedFile: file || null });
                        }}
                      />
                      {newProduct.attachedFile && (
                        <p className="text-sm text-muted-foreground">
                          Выбран файл: {newProduct.attachedFile.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label>Тип выдачи товара</Label>
                      <Select
                        value={newProduct.deliveryType}
                        onValueChange={(value: 'manual' | 'auto' | 'repeatable') => 
                          setNewProduct({ ...newProduct, deliveryType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Ручная выдача</SelectItem>
                          <SelectItem value="auto">Автовыдача (одноразовые товары)</SelectItem>
                          <SelectItem value="repeatable">Повторная выдача (один товар для всех)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {newProduct.deliveryType === 'manual' && 'Вы будете выдавать товар вручную после покупки'}
                        {newProduct.deliveryType === 'auto' && 'Товар будет автоматически выдан покупателю после оплаты (каждый покупатель получит уникальный товар)'}
                        {newProduct.deliveryType === 'repeatable' && 'Один и тот же товар будет выдан всем покупателям (например, один ключ, один файл)'}
                      </p>
                    </div>

                    {(newProduct.deliveryType === 'auto' || newProduct.deliveryType === 'repeatable') && (
                      <div className="space-y-2">
                        <Label>Содержимое для автовыдачи</Label>
                        <Textarea
                          value={newProduct.autoDeliveryContent}
                          onChange={(e) => setNewProduct({ ...newProduct, autoDeliveryContent: e.target.value })}
                          placeholder={
                            newProduct.deliveryType === 'auto' 
                              ? 'Введите ключи или данные (каждый на новой строке). Каждый покупатель получит уникальный товар.'
                              : 'Введите ключ, данные аккаунта, ссылку на файл и т.д. Этот товар будет выдан всем покупателям.'
                          }
                          rows={6}
                        />
                        <p className="text-sm text-muted-foreground">
                          {newProduct.deliveryType === 'auto' 
                            ? 'Для автовыдачи: каждый ключ/данные на новой строке. Система будет выдавать их по очереди.'
                            : 'Для повторной выдачи: один товар, который будет выдан всем покупателям (например, один ключ активации, один файл).'}
                        </p>
                      </div>
                    )}

                    <Button onClick={handleAddProduct} className="w-full">
                      Отправить на модерацию
                    </Button>
                    </div>
                    
                    {/* Превью карточки */}
                    <div className="sticky top-4 h-fit">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">Превью карточки:</div>
                      <ProductCardPreview
                        title={newProduct.title}
                        description={newProduct.description}
                        price={newProduct.price}
                        category={newProduct.category}
                        coverImageFile={newProduct.coverImage}
                        deliveryType={newProduct.deliveryType}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {myProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Загрузите свой товар</h3>
                  <p className="text-muted-foreground mb-6">
                    Продавайте готовые шаблоны, скрипты, проекты, домены и хостинг
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myProducts.map((product) => (
                  <ProductCardPreviewCompact
                    key={product.id}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    category={product.category}
                    coverImageUrl={product.cover_image_url || product.preview_image}
                    deliveryType={product.delivery_type}
                    rating={product.rating}
                    salesCount={product.sales_count}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;
