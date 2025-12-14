import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  inStock?: boolean;
  discount?: number;
}

interface ProductCatalogProps {
  products: Product[];
  columns?: number;
  onProductsChange: (products: Product[]) => void;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export const ProductCatalog = ({
  products,
  columns = 3,
  onProductsChange,
  onAddToCart,
  className
}: ProductCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: 'Новый товар',
      price: 0,
      inStock: true
    };
    onProductsChange([...products, newProduct]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAddProduct} size="sm">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить товар
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Package" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Нет товаров</p>
        </div>
      ) : (
        <div className={cn("grid gap-6", `grid-cols-${columns}`)}>
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Image" size={48} className="text-muted-foreground" />
                  </div>
                )}
                {product.discount && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-semibold">
                    -{product.discount}%
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    {product.discount ? (
                      <div>
                        <span className="text-lg font-bold">{product.price * (1 - product.discount / 100)} ₽</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">{product.price} ₽</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">{product.price} ₽</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddToCart?.(product.id)}
                    disabled={!product.inStock}
                  >
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    {product.inStock ? 'В корзину' : 'Нет в наличии'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

