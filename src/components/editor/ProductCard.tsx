import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ImageEditor } from './ImageEditor';
import { InlineEditor } from './InlineEditor';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    inStock?: boolean;
    discount?: number;
    rating?: number;
    reviewsCount?: number;
  };
  onProductChange: (product: Record<string, unknown>) => void;
  onAddToCart?: () => void;
  className?: string;
}

export const ProductCard = ({ product, onProductChange, onAddToCart, className }: ProductCardProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: unknown) => {
    onProductChange({ ...product, [field]: value });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-square bg-muted">
        <ImageEditor
          imageUrl={product.image || null}
          onImageChange={(url) => handleFieldChange('image', url)}
          className="w-full h-full"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
            -{product.discount}%
          </div>
        )}
      </div>
      <div className="p-6">
        <InlineEditor
          value={product.name}
          onChange={(value) => handleFieldChange('name', value)}
          placeholder="Название товара"
          className="text-2xl font-bold mb-2"
          tag="h2"
          isEditing={editingField === 'name'}
          onEditStart={() => setEditingField('name')}
          onEditEnd={() => setEditingField(null)}
        />
        {product.rating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= product.rating! ? "Star" : "Star"}
                  size={16}
                  className={cn(star <= product.rating! ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")}
                />
              ))}
            </div>
            {product.reviewsCount && (
              <span className="text-sm text-muted-foreground">({product.reviewsCount})</span>
            )}
          </div>
        )}
        <InlineEditor
          value={product.description || ''}
          onChange={(value) => handleFieldChange('description', value)}
          placeholder="Описание товара"
          className="text-muted-foreground mb-4"
          tag="p"
          isEditing={editingField === 'description'}
          onEditStart={() => setEditingField('description')}
          onEditEnd={() => setEditingField(null)}
        />
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.discount ? (
              <div>
                <span className="text-3xl font-bold">{product.price * (1 - product.discount / 100)} ₽</span>
                <span className="text-lg text-muted-foreground line-through ml-2">{product.price} ₽</span>
              </div>
            ) : (
              <span className="text-3xl font-bold">{product.price} ₽</span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-sm text-muted-foreground">Нет в наличии</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={onAddToCart}
            disabled={!product.inStock}
          >
            <Icon name="ShoppingCart" size={16} className="mr-2" />
            В корзину
          </Button>
          <Button variant="outline" size="icon">
            <Icon name="Heart" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

