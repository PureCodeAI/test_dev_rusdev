import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { InlineEditor } from './InlineEditor';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface ModalBlockProps {
  triggerText: string;
  title: string;
  description?: string;
  content: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onTriggerTextChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onContentChange: (content: string) => void;
  className?: string;
}

export const ModalBlock = ({
  triggerText,
  title,
  description,
  content,
  size = 'md',
  onTriggerTextChange,
  onTitleChange,
  onDescriptionChange,
  onContentChange,
  className
}: ModalBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <InlineEditor
              value={triggerText}
              onChange={onTriggerTextChange}
              placeholder="Открыть модальное окно"
              className="inline"
              tag="span"
            />
          </Button>
        </DialogTrigger>
        <DialogContent className={cn(sizeClasses[size])}>
          <DialogHeader>
            <DialogTitle>
              <InlineEditor
                value={title}
                onChange={onTitleChange}
                placeholder="Заголовок"
                className="inline"
                tag="span"
              />
            </DialogTitle>
            {description && (
              <DialogDescription>
                <InlineEditor
                  value={description}
                  onChange={onDescriptionChange}
                  placeholder="Описание"
                  className="inline"
                  tag="span"
                />
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">
            <InlineEditor
              value={content}
              onChange={onContentChange}
              placeholder="Содержимое модального окна"
              className="min-h-[100px]"
              tag="div"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Закрыть
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

