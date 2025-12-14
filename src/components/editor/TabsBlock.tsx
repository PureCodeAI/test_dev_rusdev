import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InlineEditor } from './InlineEditor';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface TabItemData {
  id: string;
  label: string;
  content: string;
}

interface TabsBlockProps {
  items: TabItemData[];
  onItemsChange: (items: TabItemData[]) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const TabsBlock = ({
  items,
  onItemsChange,
  orientation = 'horizontal',
  className
}: TabsBlockProps) => {
  const [activeTab, setActiveTab] = useState(items[0]?.id || '');

  const handleAddTab = () => {
    const newTab: TabItemData = {
      id: `tab-${Date.now()}`,
      label: 'Новая вкладка',
      content: 'Содержимое вкладки'
    };
    onItemsChange([...items, newTab]);
    setActiveTab(newTab.id);
  };

  const handleTabChange = (tabId: string, field: 'label' | 'content', value: string) => {
    onItemsChange(
      items.map(tab =>
        tab.id === tabId ? { ...tab, [field]: value } : tab
      )
    );
  };

  const handleRemoveTab = (tabId: string) => {
    const newItems = items.filter(tab => tab.id !== tabId);
    onItemsChange(newItems);
    if (activeTab === tabId && newItems.length > 0) {
      setActiveTab(newItems[0].id);
    }
  };

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Button onClick={handleAddTab}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить вкладку
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} orientation={orientation}>
        <TabsList className={orientation === 'vertical' ? 'flex-col h-auto' : ''}>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <TabsTrigger value={item.id}>
                <InlineEditor
                  value={item.label}
                  onChange={(value) => handleTabChange(item.id, 'label', value)}
                  placeholder="Вкладка"
                  className="inline"
                  tag="span"
                />
              </TabsTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveTab(item.id)}
                className="h-8 w-8"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          ))}
        </TabsList>
        {items.map((item) => (
          <TabsContent key={item.id} value={item.id}>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <InlineEditor
                  value={item.content}
                  onChange={(value) => handleTabChange(item.id, 'content', value)}
                  placeholder="Содержимое вкладки"
                  className="min-h-[100px]"
                  tag="div"
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <Button onClick={handleAddTab} variant="outline" size="sm">
        <Icon name="Plus" size={16} className="mr-2" />
        Добавить вкладку
      </Button>
    </div>
  );
};

