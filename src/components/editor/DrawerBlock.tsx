import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { InlineEditor } from './InlineEditor';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface DrawerBlockProps {
  triggerText: string;
  title: string;
  description?: string;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  onTriggerTextChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onContentChange: (content: string) => void;
  className?: string;
}

export const DrawerBlock = ({
  triggerText,
  title,
  description,
  content,
  side = 'right',
  onTriggerTextChange,
  onTitleChange,
  onDescriptionChange,
  onContentChange,
  className
}: DrawerBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button>
            <InlineEditor
              value={triggerText}
              onChange={onTriggerTextChange}
              placeholder="Открыть боковую панель"
              className="inline"
              tag="span"
            />
          </Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>
              <InlineEditor
                value={title}
                onChange={onTitleChange}
                placeholder="Заголовок"
                className="inline"
                tag="span"
              />
            </SheetTitle>
            {description && (
              <SheetDescription>
                <InlineEditor
                  value={description}
                  onChange={onDescriptionChange}
                  placeholder="Описание"
                  className="inline"
                  tag="span"
                />
              </SheetDescription>
            )}
          </SheetHeader>
          <div className="py-4">
            <InlineEditor
              value={content}
              onChange={onContentChange}
              placeholder="Содержимое боковой панели"
              className="min-h-[100px]"
              tag="div"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

