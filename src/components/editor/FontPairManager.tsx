import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface FontPair {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
}

const defaultFonts = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Oswald', 'Source Sans Pro', 'Playfair Display',
  'Merriweather', 'Ubuntu', 'Nunito', 'Crimson Text', 'Lora',
  'Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Verdana'
];

const defaultPairs: FontPair[] = [
  {
    id: 'default',
    name: 'По умолчанию',
    headingFont: 'Inter',
    bodyFont: 'Inter'
  },
  {
    id: 'modern',
    name: 'Современный',
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans'
  },
  {
    id: 'elegant',
    name: 'Элегантный',
    headingFont: 'Playfair Display',
    bodyFont: 'Lora'
  },
  {
    id: 'minimal',
    name: 'Минималистичный',
    headingFont: 'Poppins',
    bodyFont: 'Inter'
  },
  {
    id: 'classic',
    name: 'Классический',
    headingFont: 'Merriweather',
    bodyFont: 'Source Sans Pro'
  },
  {
    id: 'bold',
    name: 'Жирный',
    headingFont: 'Oswald',
    bodyFont: 'Roboto'
  }
];

interface FontPairManagerProps {
  selectedPairId?: string;
  customPairs?: FontPair[];
  onPairSelect: (pair: FontPair) => void;
  onPairSave?: (pair: FontPair) => void;
  onPairDelete?: (pairId: string) => void;
  onApplyToSite?: () => void;
  className?: string;
}

export const FontPairManager = ({
  selectedPairId,
  customPairs = [],
  onPairSelect,
  onPairSave,
  onPairDelete,
  onApplyToSite,
  className
}: FontPairManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPair, setNewPair] = useState<FontPair>({
    id: '',
    name: 'Новая пара',
    headingFont: 'Inter',
    bodyFont: 'Inter'
  });

  const allPairs = [...defaultPairs, ...customPairs];

  const handleCreatePair = () => {
    if (newPair.name.trim() && onPairSave) {
      const pairToSave = {
        ...newPair,
        id: `custom-${Date.now()}`
      };
      onPairSave(pairToSave);
      setNewPair({
        id: '',
        name: 'Новая пара',
        headingFont: 'Inter',
        bodyFont: 'Inter'
      });
      setIsCreating(false);
    }
  };

  const applyPairToCSS = (pair: FontPair) => {
    const root = document.documentElement;
    root.style.setProperty('--font-heading', `"${pair.headingFont}", sans-serif`);
    root.style.setProperty('--font-body', `"${pair.bodyFont}", sans-serif`);
    
    const style = document.createElement('style');
    style.id = 'font-pair-styles';
    style.textContent = `
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
      body, p, span, div {
        font-family: var(--font-body);
      }
    `;
    const existingStyle = document.getElementById('font-pair-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 gap-3">
        {allPairs.map((pair) => (
          <Card
            key={pair.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary",
              selectedPairId === pair.id && "ring-2 ring-primary"
            )}
            onClick={() => {
              onPairSelect(pair);
              applyPairToCSS(pair);
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">{pair.name}</span>
              {customPairs.some(p => p.id === pair.id) && onPairDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPairDelete(pair.id);
                  }}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Заголовки:</span>
                <span className="text-sm font-semibold" style={{ fontFamily: pair.headingFont }}>
                  {pair.headingFont}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Текст:</span>
                <span className="text-sm" style={{ fontFamily: pair.bodyFont }}>
                  {pair.bodyFont}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isCreating ? (
        <Card className="p-4 space-y-4">
          <div>
            <Label>Название пары</Label>
            <Input
              value={newPair.name}
              onChange={(e) => setNewPair({ ...newPair, name: e.target.value })}
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Шрифт заголовков</Label>
              <Select
                value={newPair.headingFont}
                onValueChange={(value) => setNewPair({ ...newPair, headingFont: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultFonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Шрифт текста</Label>
              <Select
                value={newPair.bodyFont}
                onValueChange={(value) => setNewPair({ ...newPair, bodyFont: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultFonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreatePair} size="sm">
              Сохранить
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(false)}
            >
              Отмена
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Создать пару
        </Button>
      )}

      {onApplyToSite && (
        <Button
          className="w-full"
          onClick={() => {
            const selectedPair = allPairs.find(p => p.id === selectedPairId);
            if (selectedPair) {
              applyPairToCSS(selectedPair);
            }
            onApplyToSite();
          }}
        >
          <Icon name="Check" size={16} className="mr-2" />
          Применить ко всему сайту
        </Button>
      )}
    </div>
  );
};

