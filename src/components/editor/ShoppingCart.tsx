import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  onItemsChange: (items: CartItem[]) => void;
  onCheckout?: () => void;
  className?: string;
}

export const ShoppingCart = ({ items, onItemsChange, onCheckout, className }: ShoppingCartProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (itemId: string, delta: number) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    onItemsChange(newItems);
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-12 text-muted-foreground", className)}>
        <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 opacity-50" />
        <p>Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Package" size={24} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{item.name}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <Icon name="Minus" size={14} />
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <Icon name="Plus" size={14} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{item.price * item.quantity} ₽</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Итого:</span>
          <span className="text-2xl font-bold">{total} ₽</span>
        </div>
        {onCheckout && (
          <Button className="w-full" onClick={onCheckout}>
            Оформить заказ
          </Button>
        )}
      </Card>
    </div>
  );
};

