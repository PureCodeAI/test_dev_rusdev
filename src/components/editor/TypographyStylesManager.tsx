import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from './ColorPicker';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface TypographyStyle {
  id: string;
  name: string;
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'custom';
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

const defaultStyles: TypographyStyle[] = [
  {
    id: 'h1',
    name: 'Заголовок 1',
    tag: 'h1',
    fontFamily: 'Inter',
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    color: '#0f172a',
    textTransform: 'none',
    textAlign: 'left'
  },
  {
    id: 'h2',
    name: 'Заголовок 2',
    tag: 'h2',
    fontFamily: 'Inter',
    fontSize: '36px',
    fontWeight: '700',
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
    color: '#0f172a',
    textTransform: 'none',
    textAlign: 'left'
  },
  {
    id: 'h3',
    name: 'Заголовок 3',
    tag: 'h3',
    fontFamily: 'Inter',
    fontSize: '28px',
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '0',
    color: '#0f172a',
    textTransform: 'none',
    textAlign: 'left'
  },
  {
    id: 'h4',
    name: 'Заголовок 4',
    tag: 'h4',
    fontFamily: 'Inter',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '0',
    color: '#0f172a',
    textTransform: 'none',
    textAlign: 'left'
  },
  {
    id: 'h5',
    name: 'Заголовок 5',
    tag: 'h5',
    fontFamily: 'Inter',
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '0',
    color: '#0f172a',
    textTransform: 'none',
    textAlign: 'left'
  },
  {
    id: 'h6',
    name: 'Заголовок 6',
    tag: 'h6',
    fontFamily: 'Inter',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '0',
    color: '#0f172a',
    textTransform: 'none',
    textAlign: 'left'
  },
  {
    id: 'body',
    name: 'Основной текст',
    tag: 'p',
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '0',
    color: '#475569',
    textTransform: 'none',
    textAlign: 'left'
  },
  {
    id: 'caption',
    name: 'Подпись',
    tag: 'span',
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0',
    color: '#64748b',
    textTransform: 'none',
    textAlign: 'left'
  }
];

const defaultFonts = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Oswald', 'Source Sans Pro', 'Playfair Display',
  'Merriweather', 'Ubuntu', 'Nunito', 'Crimson Text', 'Lora'
];

const fontWeights = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' }
];

interface TypographyStylesManagerProps {
  selectedStyleId?: string;
  customStyles?: TypographyStyle[];
  onStyleSelect: (style: TypographyStyle) => void;
  onStyleSave?: (style: TypographyStyle) => void;
  onStyleDelete?: (styleId: string) => void;
  onApplyStyle?: (style: TypographyStyle) => void;
  className?: string;
}

export const TypographyStylesManager = ({
  selectedStyleId,
  customStyles = [],
  onStyleSelect,
  onStyleSave,
  onStyleDelete,
  onApplyStyle,
  className
}: TypographyStylesManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingStyle, setEditingStyle] = useState<TypographyStyle | null>(null);
  const [newStyle, setNewStyle] = useState<TypographyStyle>({
    id: '',
    name: 'Новый стиль',
    tag: 'custom',
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '0',
    color: '#0f172a',
    textTransform: 'none',
    textAlign: 'left'
  });

  const allStyles = [...defaultStyles, ...customStyles];

  const handleCreateStyle = () => {
    if (newStyle.name.trim() && onStyleSave) {
      const styleToSave = {
        ...newStyle,
        id: `custom-${Date.now()}`
      };
      onStyleSave(styleToSave);
      setNewStyle({
        id: '',
        name: 'Новый стиль',
        tag: 'custom',
        fontFamily: 'Inter',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.6',
        letterSpacing: '0',
        color: '#0f172a',
        textTransform: 'none',
        textAlign: 'left'
      });
      setIsCreating(false);
    }
  };

  const handleEditStyle = (style: TypographyStyle) => {
    setEditingStyle(style);
    setNewStyle(style);
    setIsCreating(true);
  };

  const parseSize = (size: string) => {
    const match = size.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] };
    }
    return { value: 16, unit: 'px' };
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        {allStyles.map((style) => (
          <Card
            key={style.id}
            className={cn(
              "p-3 cursor-pointer transition-all hover:ring-2 hover:ring-primary",
              selectedStyleId === style.id && "ring-2 ring-primary"
            )}
            onClick={() => onStyleSelect(style)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{style.name}</span>
                <span className="text-xs text-muted-foreground">({style.tag})</span>
              </div>
              <div className="flex items-center gap-1">
                {customStyles.some(s => s.id === style.id) && onStyleDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStyleDelete(style.id);
                    }}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                )}
                {customStyles.some(s => s.id === style.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStyle(style);
                    }}
                  >
                    <Icon name="Edit" size={14} />
                  </Button>
                )}
                {onApplyStyle && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyStyle(style);
                    }}
                  >
                    <Icon name="Check" size={14} />
                  </Button>
                )}
              </div>
            </div>
            <div
              className="text-sm"
              style={{
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                lineHeight: style.lineHeight,
                letterSpacing: style.letterSpacing,
                color: style.color,
                textTransform: style.textTransform,
                textAlign: style.textAlign
              }}
            >
              Пример текста в этом стиле
            </div>
          </Card>
        ))}
      </div>

      {isCreating ? (
        <Card className="p-4 space-y-4">
          <div>
            <Label>Название стиля</Label>
            <Input
              value={newStyle.name}
              onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Тег</Label>
            <Select
              value={newStyle.tag}
              onValueChange={(value) => setNewStyle({ ...newStyle, tag: value as any })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
                <SelectItem value="h4">H4</SelectItem>
                <SelectItem value="h5">H5</SelectItem>
                <SelectItem value="h6">H6</SelectItem>
                <SelectItem value="p">P (параграф)</SelectItem>
                <SelectItem value="span">Span</SelectItem>
                <SelectItem value="custom">Кастомный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Шрифт</Label>
              <Select
                value={newStyle.fontFamily}
                onValueChange={(value) => setNewStyle({ ...newStyle, fontFamily: value })}
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
              <Label>Размер: {newStyle.fontSize}</Label>
              <div className="flex gap-2 mt-2">
                <Slider
                  value={[parseSize(newStyle.fontSize).value]}
                  onValueChange={(vals) => setNewStyle({
                    ...newStyle,
                    fontSize: `${vals[0]}px`
                  })}
                  min={10}
                  max={72}
                  step={1}
                  className="flex-1"
                />
                <Input
                  value={newStyle.fontSize}
                  onChange={(e) => setNewStyle({ ...newStyle, fontSize: e.target.value })}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Толщина</Label>
              <Select
                value={newStyle.fontWeight}
                onValueChange={(value) => setNewStyle({ ...newStyle, fontWeight: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((fw) => (
                    <SelectItem key={fw.value} value={fw.value}>
                      {fw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Высота строки: {newStyle.lineHeight}</Label>
              <Slider
                value={[parseFloat(newStyle.lineHeight)]}
                onValueChange={(vals) => setNewStyle({
                  ...newStyle,
                  lineHeight: String(vals[0])
                })}
                min={1}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label>Межбуквенное расстояние: {newStyle.letterSpacing}em</Label>
            <Slider
              value={[parseFloat(newStyle.letterSpacing) || 0]}
              onValueChange={(vals) => setNewStyle({
                ...newStyle,
                letterSpacing: `${vals[0]}em`
              })}
              min={-0.1}
              max={0.2}
              step={0.01}
              className="mt-2"
            />
          </div>
          <div>
            <ColorPicker
              label="Цвет текста"
              value={newStyle.color}
              onChange={(value) => setNewStyle({ ...newStyle, color: value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Трансформация</Label>
              <Select
                value={newStyle.textTransform || 'none'}
                onValueChange={(value) => setNewStyle({ ...newStyle, textTransform: value as any })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  <SelectItem value="uppercase">UPPERCASE</SelectItem>
                  <SelectItem value="lowercase">lowercase</SelectItem>
                  <SelectItem value="capitalize">Capitalize</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Выравнивание</Label>
              <Select
                value={newStyle.textAlign || 'left'}
                onValueChange={(value) => setNewStyle({ ...newStyle, textAlign: value as any })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Слева</SelectItem>
                  <SelectItem value="center">По центру</SelectItem>
                  <SelectItem value="right">Справа</SelectItem>
                  <SelectItem value="justify">По ширине</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateStyle} size="sm">
              {editingStyle ? 'Сохранить изменения' : 'Сохранить'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setEditingStyle(null);
              }}
            >
              Отмена
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setIsCreating(true);
            setEditingStyle(null);
          }}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Создать стиль
        </Button>
      )}
    </div>
  );
};

