import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { InlineEditor } from './InlineEditor';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface AccordionItemData {
  id: string;
  title: string;
  content: string;
}

interface AccordionBlockProps {
  items: AccordionItemData[];
  onItemsChange: (items: AccordionItemData[]) => void;
  type?: 'single' | 'multiple';
  className?: string;
}

export const AccordionBlock = ({
  items,
  onItemsChange,
  type = 'single',
  className
}: AccordionBlockProps) => {
  const handleAddItem = () => {
    const newItem: AccordionItemData = {
      id: `item-${Date.now()}`,
      title: 'Новый пункт',
      content: 'Содержимое пункта'
    };
    onItemsChange([...items, newItem]);
  };

  const handleItemChange = (itemId: string, field: 'title' | 'content', value: string) => {
    onItemsChange(
      items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Accordion type={type} className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>
              <InlineEditor
                value={item.title}
                onChange={(value) => handleItemChange(item.id, 'title', value)}
                placeholder="Заголовок"
                className="inline"
                tag="span"
              />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <InlineEditor
                    value={item.content}
                    onChange={(value) => handleItemChange(item.id, 'content', value)}
                    placeholder="Содержимое"
                    className="min-h-[50px]"
                    tag="div"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  className="flex-shrink-0"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button onClick={handleAddItem} variant="outline" size="sm">
        <Icon name="Plus" size={16} className="mr-2" />
        Добавить пункт
      </Button>
    </div>
  );
};

