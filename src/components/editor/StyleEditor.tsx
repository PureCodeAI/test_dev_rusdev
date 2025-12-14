import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from './ColorPicker';
import { GradientEditor } from './GradientEditor';
import { EffectsEditor } from './EffectsEditor';
import { BackgroundEditor } from './BackgroundEditor';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { getStyleValue as getStyleValueUtil, updateStyle as updateStyleUtil } from '@/utils/styleUtils';

interface StyleEditorProps {
  styles: Record<string, unknown>;
  onStylesChange: (styles: Record<string, unknown>) => void;
}

export const StyleEditor = ({ styles, onStylesChange }: StyleEditorProps) => {
  const [localStyles, setLocalStyles] = useState<Record<string, unknown>>(styles || {});

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

  const updateStyle = (key: string, value: unknown) => {
    const newStyles = updateStyleUtil(localStyles, key, value);
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  const getStyleValue = (key: string, defaultValue: string | number = '') => {
    return getStyleValueUtil(localStyles, key, defaultValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-3 block">Цвета</Label>
          <BackgroundEditor
            styles={localStyles}
            onStylesChange={onStylesChange}
          />
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Цвет текста</Label>
          <ColorPicker
            label="Цвет текста"
            value={getStyleValue('color', '#000000') as string}
            onChange={(value) => updateStyle('color', value)}
          />
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Прозрачность</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Opacity: {Math.round((getStyleValue('opacity', 1) as number) * 100)}%</Label>
            </div>
            <Slider
              value={[(getStyleValue('opacity', 1) as number) * 100]}
              onValueChange={(vals) => updateStyle('opacity', vals[0] / 100)}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Скругления</Label>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Border Radius: {getStyleValue('borderRadius', '0px')}</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={getStyleValue('borderRadius', '0px') as string}
                  onChange={(e) => updateStyle('borderRadius', e.target.value)}
                  placeholder="0px"
                  className="flex-1"
                />
                <Select
                  value={(getStyleValue('borderRadius', '0px') as string).replace(/[^a-z]/gi, '') || 'px'}
                  onValueChange={(unit) => {
                    const current = getStyleValue('borderRadius', '0px') as string;
                    const num = current.replace(/[^0-9.]/g, '') || '0';
                    updateStyle('borderRadius', `${num}${unit}`);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="px">px</SelectItem>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="rem">rem</SelectItem>
                    <SelectItem value="em">em</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Границы</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Ширина</Label>
                <Input
                  type="text"
                  value={getStyleValue('borderWidth', '0px') as string}
                  onChange={(e) => updateStyle('borderWidth', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Стиль</Label>
                <Select
                  value={getStyleValue('borderStyle', 'solid') as string}
                  onValueChange={(value) => updateStyle('borderStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет</SelectItem>
                    <SelectItem value="solid">Сплошная</SelectItem>
                    <SelectItem value="dashed">Пунктир</SelectItem>
                    <SelectItem value="dotted">Точки</SelectItem>
                    <SelectItem value="double">Двойная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ColorPicker
              label="Цвет границы"
              value={getStyleValue('borderColor', '#000000') as string}
              onChange={(value) => updateStyle('borderColor', value)}
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Эффекты</Label>
          <EffectsEditor
            styles={localStyles}
            onStylesChange={onStylesChange}
          />
        </div>
      </div>
    </div>
  );
};

