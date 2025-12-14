import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RichTextToolbarProps {
  position: { top: number; left: number };
  onFormat: (command: string, value?: string) => void;
}

export const RichTextToolbar = ({ position, onFormat }: RichTextToolbarProps) => {
  const handleFormat = (command: string, value?: string) => {
    onFormat(command, value);
  };

  const handleLink = () => {
    const url = prompt('Введите URL:');
    if (url) {
      handleFormat('createLink', url);
    }
  };

  return (
    <div
      className="fixed z-50 bg-popover border border-border rounded-md shadow-lg p-1 flex items-center gap-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat('bold')}
        title="Жирный (Ctrl+B)"
      >
        <Icon name="Bold" size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat('italic')}
        title="Курсив (Ctrl+I)"
      >
        <Icon name="Italic" size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat('underline')}
        title="Подчеркнутый (Ctrl+U)"
      >
        <Icon name="Underline" size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat('justifyLeft')}
        title="Выровнять по левому краю"
      >
        <Icon name="AlignLeft" size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat('justifyCenter')}
        title="Выровнять по центру"
      >
        <Icon name="AlignCenter" size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat('justifyRight')}
        title="Выровнять по правому краю"
      >
        <Icon name="AlignRight" size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Цвет текста"
          >
            <Icon name="Palette" size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <Label className="text-xs">Цвет текста</Label>
            <Input
              type="color"
              onChange={(e) => handleFormat('foreColor', e.target.value)}
              className="h-10"
            />
          </div>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleLink}
        title="Вставить ссылку"
      >
        <Icon name="Link" size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat('removeFormat')}
        title="Убрать форматирование"
      >
        <Icon name="RemoveFormatting" size={16} />
      </Button>
    </div>
  );
};

