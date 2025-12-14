import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { InlineEditor } from './InlineEditor';
import { ImageEditor } from './ImageEditor';
import { ImageGallery } from './ImageGallery';
import { ImageCarousel } from './ImageCarousel';
import { MasonryGallery } from './MasonryGallery';
import { ParallaxImage } from './ParallaxImage';
import { VideoPlayer } from './VideoPlayer';
import { FormBuilder, FormField } from './FormBuilder';
import { ProductCatalog, Product } from './ProductCatalog';
import { ProductCard } from './ProductCard';
import { ShoppingCart, CartItem } from './ShoppingCart';
import { CheckoutForm } from './CheckoutForm';
import { PricingTable, PricingPlan } from './PricingTable';
import { CountdownTimer } from './CountdownTimer';
import { ScrollAnimation, AnimationType } from './ScrollAnimation';
import { ModalBlock } from './ModalBlock';
import { DrawerBlock } from './DrawerBlock';
import { Lightbox } from './Lightbox';
import { AccordionBlock, AccordionItemData } from './AccordionBlock';
import { TabsBlock, TabItemData } from './TabsBlock';
import { StickyNavigation, NavItem } from './StickyNavigation';
import { MapBlock } from './MapBlock';
import { BlockContextMenu } from './BlockContextMenu';
import { BlockControls } from './BlockControls';
import { CodeBlock } from './CodeBlock';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import React from 'react';

interface BlockRendererProps {
  block: {
    id: number;
    type: string;
    content: Record<string, unknown>;
    styles: Record<string, unknown>;
    position: number;
    visible?: boolean;
    locked?: boolean;
    animation?: {
      type?: 'fadeIn' | 'slideIn' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'rotate' | 'bounce' | 'none';
      delay?: number;
      duration?: number;
      threshold?: number;
    };
    hoverEffects?: {
      scale?: number;
      shadow?: boolean;
      colorChange?: string;
    };
  };
  isSelected: boolean;
  isMultiSelected?: boolean;
  onSelect: (isMultiSelect?: boolean) => void;
  onDelete: () => void;
  onContentChange: (content: Record<string, unknown>) => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canPaste?: boolean;
  totalBlocks: number;
  blockIndex: number;
}

export const BlockRenderer = ({ 
  block, 
  isSelected, 
  isMultiSelected = false,
  onSelect, 
  onDelete, 
  onContentChange,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onCopy,
  onPaste,
  canMoveUp = false,
  canMoveDown = false,
  canPaste = false,
  totalBlocks,
  blockIndex
}: BlockRendererProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BLOCK_MOVE',
    item: { blockId: block.id, blockIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleContentChange = (field: string, value: string) => {
    onContentChange({
      ...block.content,
      [field]: value
    });
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div>
            <InlineEditor
              value={String(block.content.title || '')}
              onChange={(value) => handleContentChange('title', value)}
              placeholder="Заголовок блока"
              className="text-3xl font-bold mb-4"
              tag="h2"
              isEditing={editingField === 'title'}
              onEditStart={() => setEditingField('title')}
              onEditEnd={() => setEditingField(null)}
            />
            <InlineEditor
              value={String(block.content.text || '')}
              onChange={(value) => handleContentChange('text', value)}
              placeholder="Текст блока. Кликните для редактирования."
              className="text-muted-foreground"
              tag="p"
              isEditing={editingField === 'text'}
              onEditStart={() => setEditingField('text')}
              onEditEnd={() => setEditingField(null)}
            />
            <ImageEditor
              imageUrl={block.content.imageUrl as string || null}
              onImageChange={(url) => handleContentChange('imageUrl', url)}
              className="w-full"
            />
            <Button size="lg">
              <InlineEditor
                value={String(block.content.text || '')}
                onChange={(value) => handleContentChange('text', value)}
                placeholder="Кнопка"
                className="inline"
                tag="span"
                isEditing={editingField === 'button-text'}
                onEditStart={() => setEditingField('button-text')}
                onEditEnd={() => setEditingField(null)}
              />
            </Button>
          </div>
        );

      case 'contact-form':
      case 'subscribe-form':
      case 'login-form':
      case 'register-form':
      case 'search-form':
      case 'filter-form':
      case 'booking-form':
      case 'appointment-form':
      case 'quote-form':
      case 'survey-form':
      case 'feedback-form':
      case 'application-form':
      case 'order-form':
      case 'download-form':
        return (
          <FormBuilder
            fields={(block.content.fields as FormField[]) || [
              { id: 'name', type: 'text', label: 'Имя', required: true },
              { id: 'email', type: 'email', label: 'Email', required: true }
            ]}
            onSubmit={(data) => {
              handleContentChange('formData', data);
            }}
          />
        );

      case 'lightbox':
        return (
          <div className="p-8">
            <ImageGallery
              images={(block.content.images as string[]) || []}
              columns={Number(block.content.columns) || 3}
              onImagesChange={(images) => handleContentChange('images', images)}
            />
          </div>
        );

      case 'gallery-masonry':
        return (
          <div className="p-8">
            <MasonryGallery
              images={(block.content.images as string[]) || []}
              columns={Number(block.content.columns) || 3}
              onImagesChange={(images) => handleContentChange('images', images)}
            />
          </div>
        );

      case 'carousel':
      case 'slider':
        return (
          <div className="p-8">
            <ImageCarousel
              images={(block.content.images as string[]) || []}
              autoplay={block.content.autoplay as boolean || false}
              interval={Number(block.content.interval) || 3000}
              onImagesChange={(images) => handleContentChange('images', images)}
            />
          </div>
        );

      case 'parallax':
        return (
          <div className="p-8">
            <ParallaxImage
              imageUrl={block.content.imageUrl as string || null}
              speed={Number(block.content.speed) || 0.5}
              onImageChange={(url) => handleContentChange('imageUrl', url)}
            />
            <VideoPlayer
              videoUrl={block.content.videoUrl as string || null}
              videoType={(block.content.videoType as 'youtube' | 'vimeo' | 'file') || 'file'}
              autoplay={block.content.autoplay as boolean || false}
              controls={block.content.controls as boolean ?? true}
              loop={block.content.loop as boolean || false}
              muted={block.content.muted as boolean || false}
              onVideoChange={(url) => handleContentChange('videoUrl', url)}
              onTypeChange={(type) => handleContentChange('videoType', type)}
            />
          </div>
        );

      case 'video-youtube':
        return (
          <div className="p-8">
            <VideoPlayer
              videoUrl={block.content.videoUrl as string || null}
              videoType="youtube"
              autoplay={block.content.autoplay as boolean || false}
              controls={block.content.controls as boolean ?? true}
              loop={block.content.loop as boolean || false}
              muted={block.content.muted as boolean || false}
              onVideoChange={(url) => handleContentChange('videoUrl', url)}
              onTypeChange={(type) => handleContentChange('videoType', type)}
            />
          </div>
        );

      case 'video-vimeo':
        return (
          <div className="p-8">
            <VideoPlayer
              videoUrl={block.content.videoUrl as string || null}
              videoType="vimeo"
              autoplay={block.content.autoplay as boolean || false}
              controls={block.content.controls as boolean ?? true}
              loop={block.content.loop as boolean || false}
              muted={block.content.muted as boolean || false}
              onVideoChange={(url) => handleContentChange('videoUrl', url)}
              onTypeChange={(type) => handleContentChange('videoType', type)}
            />
          </div>
        );

      case 'video-background':
        return (
          <div className="p-8 relative min-h-[400px] overflow-hidden">
            <VideoPlayer
              videoUrl={block.content.videoUrl as string || null}
              videoType={(block.content.videoType as 'youtube' | 'vimeo' | 'file') || 'file'}
              autoplay={true}
              controls={false}
              loop={true}
              muted={true}
              onVideoChange={(url) => handleContentChange('videoUrl', url)}
              onTypeChange={(type) => handleContentChange('videoType', type)}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <div className="text-white text-center">
                <h2 className="text-3xl font-bold mb-4">Контент поверх видео</h2>
                <p className="text-lg">Редактируйте этот текст</p>
              </div>
            </div>
          </div>
        );

      case 'google-map':
      case 'yandex-map':
        return (
          <div className="p-8">
            <MapBlock
              mapType={(block.content.mapType as 'google' | 'yandex') || 'google'}
              center={(block.content.center as { lat: number; lng: number }) || { lat: 55.7558, lng: 37.6173 }}
              zoom={Number(block.content.zoom) || 10}
              markers={(block.content.markers as Array<{ id: string; lat: number; lng: number; title: string; description?: string }>) || []}
              onMapTypeChange={(type) => handleContentChange('mapType', type)}
              onCenterChange={(center) => handleContentChange('center', center)}
              onZoomChange={(zoom) => handleContentChange('zoom', zoom)}
              onMarkersChange={(markers) => handleContentChange('markers', markers)}
            />
          </div>
        );

      case 'pricing-card':
        return (
          <div className="p-8">
            <PricingTable
              plans={(block.content.plans as PricingPlan[]) || [
                { id: '1', name: 'Базовый', price: 1000, period: 'month', features: ['Функция 1', 'Функция 2'] },
                { id: '2', name: 'Стандарт', price: 2000, period: 'month', features: ['Функция 1', 'Функция 2', 'Функция 3'], popular: true },
                { id: '3', name: 'Премиум', price: 3000, period: 'month', features: ['Все функции'] }
              ]}
              onPlansChange={(plans) => handleContentChange('plans', plans)}
              columns={Number(block.content.columns) || 3}
            />
          </div>
        );

      case 'product-grid':
        return (
          <div className="p-8">
            <ProductCatalog
              products={(block.content.products as Product[]) || []}
              columns={Number(block.content.columns) || 3}
              onProductsChange={(products) => handleContentChange('products', products)}
              onAddToCart={(productId) => {
                handleContentChange('cartAction', { type: 'add', productId });
              }}
            />
          </div>
        );

      case 'product-card':
      case 'product-details':
        return (
          <div className="p-8">
            <ProductCard
              product={(block.content.product as {
                id: string;
                name: string;
                price: number;
                image?: string;
                description?: string;
                inStock?: boolean;
                discount?: number;
                rating?: number;
                reviewsCount?: number;
              }) || {
                id: '1',
                name: 'Товар',
                price: 0,
                inStock: true
              }}
              onProductChange={(product) => handleContentChange('product', product)}
              onAddToCart={() => {
                const product = block.content.product as { id?: string } | undefined;
                handleContentChange('cartAction', { type: 'add', productId: product?.id });
              }}
            />
          </div>
        );

      case 'cart':
        return (
          <div className="p-8">
            <ShoppingCart
              items={(block.content.items as CartItem[]) || []}
              onItemsChange={(items) => handleContentChange('items', items)}
              onCheckout={() => {
                handleContentChange('checkoutAction', true);
              }}
            />
          </div>
        );

      case 'checkout':
        return (
          <div className="p-8">
            <CheckoutForm
              onComplete={(orderData) => {
                handleContentChange('orderData', orderData);
              }}
            />
          </div>
        );

      case 'countdown-timer':
        return (
          <div className="p-8">
            <CountdownTimer
              targetDate={block.content.targetDate as string || ''}
              onTargetDateChange={(date) => handleContentChange('targetDate', date)}
            />
          </div>
        );

      case 'section':
        return (
          <section className="p-8 min-h-[200px]">
            <div className="text-sm text-muted-foreground mb-2">Секция</div>
            <div className="text-xs text-muted-foreground">Перетащите блоки сюда</div>
          </section>
        );

      case 'container':
        return (
          <div className="container mx-auto px-4 py-8 min-h-[100px]">
            <div className="text-sm text-muted-foreground mb-2">Контейнер</div>
            <div className="text-xs text-muted-foreground">Перетащите блоки сюда</div>
          </div>
        );

      case 'row':
        return (
          <div className="flex flex-row gap-4 p-4 min-h-[100px] border-2 border-dashed border-muted">
            <div className="text-sm text-muted-foreground">Строка (Row)</div>
          </div>
        );

      case 'column':
        return (
          <div className="flex flex-col gap-4 p-4 min-h-[100px] border-2 border-dashed border-muted">
            <div className="text-sm text-muted-foreground">Колонка (Column)</div>
          </div>
        );

      case 'flex-container':
        return (
          <div className="flex gap-4 p-4 min-h-[100px] border-2 border-dashed border-muted">
            <div className="text-sm text-muted-foreground">Flex контейнер</div>
          </div>
        );

      case 'grid-container':
        return (
          <div className="grid grid-cols-3 gap-4 p-4 min-h-[100px] border-2 border-dashed border-muted">
            <div className="text-sm text-muted-foreground">Grid контейнер</div>
          </div>
        );

      case 'wrapper':
        return (
          <div className="p-4 min-h-[100px] border-2 border-dashed border-muted">
            <div className="text-sm text-muted-foreground">Обертка (Wrapper)</div>
          </div>
        );

      case 'header':
        return (
          <header className="p-6 bg-muted/50 border-b">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Шапка сайта</div>
              <nav className="flex gap-4">
                <a href="#" className="text-sm hover:text-primary">Главная</a>
                <a href="#" className="text-sm hover:text-primary">О нас</a>
                <a href="#" className="text-sm hover:text-primary">Контакты</a>
              </nav>
            </div>
          </header>
        );

      case 'footer':
        return (
          <footer className="p-8 bg-muted/50 border-t">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-2">О компании</h4>
                <p className="text-sm text-muted-foreground">Информация о компании</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Контакты</h4>
                <p className="text-sm text-muted-foreground">Email: info@example.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Соцсети</h4>
                <div className="flex gap-2">
                  <Icon name="Facebook" size={16} />
                  <Icon name="Twitter" size={16} />
                  <Icon name="Instagram" size={16} />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
              © 2024 Все права защищены
            </div>
          </footer>
        );

      case 'sidebar':
        return (
          <aside className="w-64 p-6 bg-muted/30 border-r min-h-[400px]">
            <h3 className="font-semibold mb-4">Боковая панель</h3>
            <nav className="space-y-2">
              <a href="#" className="block text-sm hover:text-primary">Пункт 1</a>
              <a href="#" className="block text-sm hover:text-primary">Пункт 2</a>
              <a href="#" className="block text-sm hover:text-primary">Пункт 3</a>
            </nav>
          </aside>
        );

      case 'navbar':
        return (
          <nav className="p-4 bg-background border-b">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Логотип</div>
              <div className="flex gap-6">
                <a href="#" className="text-sm hover:text-primary">Главная</a>
                <a href="#" className="text-sm hover:text-primary">Услуги</a>
                <a href="#" className="text-sm hover:text-primary">Портфолио</a>
                <a href="#" className="text-sm hover:text-primary">Контакты</a>
              </div>
            </div>
          </nav>
        );

      case 'breadcrumbs':
        return (
          <nav className="p-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <a href="#" className="hover:text-foreground">Главная</a>
              <Icon name="ChevronRight" size={14} />
              <a href="#" className="hover:text-foreground">Раздел</a>
              <Icon name="ChevronRight" size={14} />
              <span className="text-foreground">Текущая страница</span>
            </div>
          </nav>
        );

      case 'map':
      case 'google-map':
      case 'yandex-map':
        return (
          <div className="p-8">
            <MapBlock
              mapType={(block.content.mapType as 'google' | 'yandex') || 'google'}
              center={(block.content.center as { lat: number; lng: number }) || { lat: 55.7558, lng: 37.6173 }}
              zoom={Number(block.content.zoom) || 10}
              markers={(block.content.markers as Array<{ id: string; lat: number; lng: number; title: string; description?: string }>) || []}
              onMapTypeChange={(type) => handleContentChange('mapType', type)}
              onCenterChange={(center) => handleContentChange('center', center)}
              onZoomChange={(zoom) => handleContentChange('zoom', zoom)}
              onMarkersChange={(markers) => handleContentChange('markers', markers)}
            />
          </div>
        );

      case 'modal':
      case 'popup':
        return (
          <div className="p-8">
            <ModalBlock
              triggerText={block.content.triggerText as string || 'Открыть модальное окно'}
              title={block.content.title as string || 'Заголовок'}
              description={block.content.description as string}
              content={block.content.content as string || 'Содержимое'}
              size={(block.content.size as 'sm' | 'md' | 'lg' | 'xl' | 'full') || 'md'}
              onTriggerTextChange={(text) => handleContentChange('triggerText', text)}
              onTitleChange={(title) => handleContentChange('title', title)}
              onDescriptionChange={(description) => handleContentChange('description', description)}
              onContentChange={(content) => handleContentChange('content', content)}
            />
          </div>
        );

      case 'drawer':
      case 'sheet':
        return (
          <div className="p-8">
            <DrawerBlock
              triggerText={block.content.triggerText as string || 'Открыть боковую панель'}
              title={block.content.title as string || 'Заголовок'}
              description={block.content.description as string}
              content={block.content.content as string || 'Содержимое'}
              side={(block.content.side as 'top' | 'bottom' | 'left' | 'right') || 'right'}
              onTriggerTextChange={(text) => handleContentChange('triggerText', text)}
              onTitleChange={(title) => handleContentChange('title', title)}
              onDescriptionChange={(description) => handleContentChange('description', description)}
              onContentChange={(content) => handleContentChange('content', content)}
            />
          </div>
        );

      case 'lightbox':
        return (
          <div className="p-8">
            <Lightbox
              thumbnailUrl={block.content.thumbnailUrl as string}
              fullImageUrl={block.content.fullImageUrl as string}
              videoUrl={block.content.videoUrl as string}
              title={block.content.title as string}
              onThumbnailChange={(url) => handleContentChange('thumbnailUrl', url)}
              onFullImageChange={(url) => handleContentChange('fullImageUrl', url)}
              onVideoChange={(url) => handleContentChange('videoUrl', url)}
              onTitleChange={(title) => handleContentChange('title', title)}
            />
          </div>
        );

      case 'accordion':
        return (
          <div className="p-8">
            <AccordionBlock
              items={(block.content.items as AccordionItemData[]) || [
                { id: '1', title: 'Пункт 1', content: 'Содержимое пункта 1' },
                { id: '2', title: 'Пункт 2', content: 'Содержимое пункта 2' }
              ]}
              onItemsChange={(items) => handleContentChange('items', items)}
              type={(block.content.type as 'single' | 'multiple') || 'single'}
            />
          </div>
        );

      case 'tabs':
        return (
          <div className="p-8">
            <TabsBlock
              items={(block.content.items as TabItemData[]) || [
                { id: '1', label: 'Вкладка 1', content: 'Содержимое вкладки 1' },
                { id: '2', label: 'Вкладка 2', content: 'Содержимое вкладки 2' }
              ]}
              onItemsChange={(items) => handleContentChange('items', items)}
              orientation={(block.content.orientation as 'horizontal' | 'vertical') || 'horizontal'}
            />
          </div>
        );

      case 'sticky-nav':
      case 'sticky-navigation':
        return (
          <div className="p-8">
            <StickyNavigation
              logo={block.content.logo as string}
              logoText={block.content.logoText as string}
              items={(block.content.items as NavItem[]) || [
                { id: '1', label: 'Главная', href: '#' },
                { id: '2', label: 'О нас', href: '#about' },
                { id: '3', label: 'Контакты', href: '#contacts' }
              ]}
              onItemsChange={(items) => handleContentChange('items', items)}
              onLogoChange={(logo) => handleContentChange('logo', logo)}
              onLogoTextChange={(text) => handleContentChange('logoText', text)}
              sticky={block.content.sticky as boolean ?? true}
            />
          </div>
        );

      case 'html':
        return (
          <div className="p-4">
            <CodeBlock
              content={block.content}
              onContentChange={onContentChange}
              language="html"
              isEditing={isSelected}
            />
          </div>
        );

      case 'css':
        return (
          <div className="p-4">
            <CodeBlock
              content={block.content}
              onContentChange={onContentChange}
              language="css"
              isEditing={isSelected}
            />
          </div>
        );

      case 'javascript':
      case 'js':
        return (
          <div className="p-4">
            <CodeBlock
              content={block.content}
              onContentChange={onContentChange}
              language="javascript"
              isEditing={isSelected}
            />
          </div>
        );

      case 'code':
        return (
          <div className="p-4">
            <Card className="p-4 bg-muted">
              <pre className="text-sm font-mono overflow-x-auto">
                <code>{String(block.content.code || '')}</code>
              </pre>
            </Card>
          </div>
        );

      case 'iframe':
        return (
          <div className="p-4">
            <div className="border border-border rounded overflow-hidden">
              <iframe
                src={block.content.src as string || ''}
                width={block.content.width as string || '100%'}
                height={block.content.height as string || '400px'}
                frameBorder="0"
                allowFullScreen
                className="w-full"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const blockStyles: React.CSSProperties = {};
  
  if (block.styles) {
    Object.entries(block.styles).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const cssKey = key as keyof React.CSSProperties;
        blockStyles[cssKey] = String(value) as React.CSSProperties[keyof React.CSSProperties];
      }
    });
  }

  const isVisible = block.visible !== false;
  const isLocked = block.locked === true;

  if (!isVisible) {
    blockStyles.display = 'none';
  }

  const animationType = (block.animation?.type || 'none') as AnimationType;
  const animationDelay = block.animation?.delay || 0;
  const animationDuration = block.animation?.duration || 600;
  const animationThreshold = block.animation?.threshold || 0.1;

  const hoverEffects = block.hoverEffects || {};
  const hoverStyle: React.CSSProperties = {};
  if (hoverEffects.scale && hoverEffects.scale > 1) {
    hoverStyle.transform = `scale(${hoverEffects.scale})`;
  }
  if (hoverEffects.shadow) {
    hoverStyle.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
  }
  if (hoverEffects.colorChange) {
    hoverStyle.color = hoverEffects.colorChange;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) return;
    const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelect(isMultiSelect);
  };

  return (
    <BlockContextMenu
      onCopy={onCopy}
      onPaste={onPaste}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canPaste={canPaste}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <ScrollAnimation
        animationType={animationType}
        delay={animationDelay}
        duration={animationDuration}
        threshold={animationThreshold}
      >
        <div
          ref={isLocked ? undefined : drag}
          data-block-id={block.id}
          onClick={handleClick}
          className={`relative group transition-all ${
            isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          } ${
            isSelected || isMultiSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'
          } ${isDragging ? 'opacity-50' : ''}`}
          style={blockStyles}
          onMouseEnter={(e) => {
            if (Object.keys(hoverStyle).length > 0) {
              const target = e.currentTarget;
              if (hoverStyle.transform) {
                target.style.transform = hoverStyle.transform;
              }
              if (hoverStyle.boxShadow) {
                target.style.boxShadow = hoverStyle.boxShadow;
              }
              if (hoverStyle.color) {
                target.style.color = hoverStyle.color;
              }
            }
          }}
          onMouseLeave={(e) => {
            if (Object.keys(hoverStyle).length > 0) {
              const target = e.currentTarget;
              target.style.transform = '';
              target.style.boxShadow = '';
              target.style.color = '';
            }
          }}
        >
          {renderBlockContent()}
          
          {(isSelected || isMultiSelected) && (
            <BlockControls
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
          )}
          
          {(isSelected || isMultiSelected) && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
              {block.type}
            </div>
          )}
        </div>
      </ScrollAnimation>
    </BlockContextMenu>
  );
};