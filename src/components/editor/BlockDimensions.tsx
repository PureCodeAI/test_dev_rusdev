import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface BlockDimensionsProps {
  styles: Record<string, unknown>;
  onStylesChange: (styles: Record<string, unknown>) => void;
}

export const BlockDimensions = ({ styles, onStylesChange }: BlockDimensionsProps) => {
  const [localStyles, setLocalStyles] = useState<Record<string, unknown>>(styles || {});
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    setLocalStyles(styles || {});
    const width = parseFloat((styles.width as string)?.replace(/[^0-9.]/g, '') || '0');
    const height = parseFloat((styles.height as string)?.replace(/[^0-9.]/g, '') || '0');
    if (width > 0 && height > 0) {
      setAspectRatio(width / height);
    }
  }, [styles]);

  const updateStyle = (key: string, value: unknown) => {
    const newStyles = { ...localStyles, [key]: value };
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  const getStyleValue = (key: string, defaultValue: string = '') => {
    return (localStyles[key] as string) || defaultValue;
  };

  const parseValue = (value: string) => {
    const match = value.match(/^(\d+(?:\.\d+)?)(px|%|rem|em|vw|vh)?$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || 'px' };
    }
    return { value: 0, unit: 'px' };
  };

  const handleWidthChange = (value: string) => {
    const parsed = parseValue(value);
    updateStyle('width', parsed.value > 0 ? `${parsed.value}${parsed.unit}` : value);
    
    if (maintainAspectRatio && parsed.value > 0) {
      const newHeight = parsed.value / aspectRatio;
      const heightUnit = parseValue(getStyleValue('height', '0px')).unit;
      updateStyle('height', `${newHeight}${heightUnit}`);
    }
  };

  const handleHeightChange = (value: string) => {
    const parsed = parseValue(value);
    updateStyle('height', parsed.value > 0 ? `${parsed.value}${parsed.unit}` : value);
    
    if (maintainAspectRatio && parsed.value > 0) {
      const newWidth = parsed.value * aspectRatio;
      const widthUnit = parseValue(getStyleValue('width', '0px')).unit;
      updateStyle('width', `${newWidth}${widthUnit}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-3 block">Позиция</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs mb-1 block">X (left)</Label>
              <Input
                type="text"
                value={getStyleValue('left', 'auto')}
                onChange={(e) => updateStyle('left', e.target.value)}
                placeholder="auto"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Y (top)</Label>
              <Input
                type="text"
                value={getStyleValue('top', 'auto')}
                onChange={(e) => updateStyle('top', e.target.value)}
                placeholder="auto"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Размеры</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Ширина (W)</Label>
                <Input
                  type="text"
                  value={getStyleValue('width', 'auto')}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  placeholder="auto"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Высота (H)</Label>
                <Input
                  type="text"
                  value={getStyleValue('height', 'auto')}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder="auto"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Сохранять пропорции</Label>
              <Switch
                checked={maintainAspectRatio}
                onCheckedChange={setMaintainAspectRatio}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Ограничения размеров</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Min ширина</Label>
                <Input
                  type="text"
                  value={getStyleValue('minWidth', '0px')}
                  onChange={(e) => updateStyle('minWidth', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Max ширина</Label>
                <Input
                  type="text"
                  value={getStyleValue('maxWidth', 'none')}
                  onChange={(e) => updateStyle('maxWidth', e.target.value)}
                  placeholder="none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Min высота</Label>
                <Input
                  type="text"
                  value={getStyleValue('minHeight', '0px')}
                  onChange={(e) => updateStyle('minHeight', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Max высота</Label>
                <Input
                  type="text"
                  value={getStyleValue('maxHeight', 'none')}
                  onChange={(e) => updateStyle('maxHeight', e.target.value)}
                  placeholder="none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

