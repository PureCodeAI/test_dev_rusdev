import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface TypographyEditorProps {
  styles: Record<string, unknown>;
  onStylesChange: (styles: Record<string, unknown>) => void;
}

const googleFonts = [
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

const fontSizes = [
  '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px'
];

export const TypographyEditor = ({ styles, onStylesChange }: TypographyEditorProps) => {
  const [localStyles, setLocalStyles] = useState<Record<string, unknown>>(styles || {});

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

  const updateStyle = (key: string, value: unknown) => {
    const newStyles = { ...localStyles, [key]: value };
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  const getStyleValue = (key: string, defaultValue: string | number = '') => {
    return localStyles[key] as string || defaultValue;
  };

  const parseSize = (size: string) => {
    const match = size.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] };
    }
    return { value: 16, unit: 'px' };
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-3 block">Шрифт</Label>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Семейство шрифта</Label>
              <Select
                value={getStyleValue('fontFamily', 'Inter') as string}
                onValueChange={(value) => updateStyle('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {googleFonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Размер шрифта</Label>
              <div className="flex gap-2">
                <Select
                  value={getStyleValue('fontSize', '16px') as string}
                  onValueChange={(value) => updateStyle('fontSize', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  value={getStyleValue('fontSize', '16px') as string}
                  onChange={(e) => updateStyle('fontSize', e.target.value)}
                  placeholder="16px"
                  className="w-24"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Толщина шрифта</Label>
              <Select
                value={getStyleValue('fontWeight', '400') as string}
                onValueChange={(value) => updateStyle('fontWeight', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Выравнивание и стиль</Label>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Выравнивание текста</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'left', icon: 'AlignLeft' },
                  { value: 'center', icon: 'AlignCenter' },
                  { value: 'right', icon: 'AlignRight' },
                  { value: 'justify', icon: 'AlignJustify' }
                ].map((align) => (
                  <button
                    key={align.value}
                    type="button"
                    className={`h-9 rounded border transition-colors ${
                      getStyleValue('textAlign', 'left') === align.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => updateStyle('textAlign', align.value)}
                    title={align.value}
                  >
                    <span className="text-xs">{align.value}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs mb-1 block">Стиль текста</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 h-9 rounded border text-xs font-bold transition-colors ${
                      getStyleValue('fontStyle', 'normal') === 'italic'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => updateStyle('fontStyle', getStyleValue('fontStyle', 'normal') === 'italic' ? 'normal' : 'italic')}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-9 rounded border text-xs underline transition-colors ${
                      getStyleValue('textDecoration', 'none') === 'underline'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => updateStyle('textDecoration', getStyleValue('textDecoration', 'none') === 'underline' ? 'none' : 'underline')}
                  >
                    U
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-9 rounded border text-xs line-through transition-colors ${
                      getStyleValue('textDecoration', 'none') === 'line-through'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => updateStyle('textDecoration', getStyleValue('textDecoration', 'none') === 'line-through' ? 'none' : 'line-through')}
                  >
                    S
                  </button>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Трансформация текста</Label>
              <Select
                value={getStyleValue('textTransform', 'none') as string}
                onValueChange={(value) => updateStyle('textTransform', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Обычный</SelectItem>
                  <SelectItem value="uppercase">ВЕРХНИЙ РЕГИСТР</SelectItem>
                  <SelectItem value="lowercase">нижний регистр</SelectItem>
                  <SelectItem value="capitalize">Заглавные Буквы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Интервалы</Label>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Высота строки: {getStyleValue('lineHeight', '1.5')}</Label>
              </div>
              <div className="flex gap-2">
                <Slider
                  value={[parseFloat(getStyleValue('lineHeight', '1.5') as string) || 1.5]}
                  onValueChange={(vals) => updateStyle('lineHeight', vals[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <Input
                  type="text"
                  value={getStyleValue('lineHeight', '1.5') as string}
                  onChange={(e) => updateStyle('lineHeight', e.target.value)}
                  className="w-20"
                  placeholder="1.5"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Межбуквенное расстояние: {getStyleValue('letterSpacing', '0px')}</Label>
              </div>
              <div className="flex gap-2">
                <Slider
                  value={[parseFloat((getStyleValue('letterSpacing', '0px') as string).replace(/[^0-9.-]/g, '')) || 0]}
                  onValueChange={(vals) => updateStyle('letterSpacing', `${vals[0]}px`)}
                  min={-5}
                  max={20}
                  step={0.1}
                  className="flex-1"
                />
                <Input
                  type="text"
                  value={getStyleValue('letterSpacing', '0px') as string}
                  onChange={(e) => updateStyle('letterSpacing', e.target.value)}
                  className="w-20"
                  placeholder="0px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

