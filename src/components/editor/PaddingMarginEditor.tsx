import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface PaddingMarginEditorProps {
  styles: Record<string, unknown>;
  onStylesChange: (styles: Record<string, unknown>) => void;
}

export const PaddingMarginEditor = ({ styles, onStylesChange }: PaddingMarginEditorProps) => {
  const [localStyles, setLocalStyles] = useState<Record<string, unknown>>(styles || {});
  const [linked, setLinked] = useState({ padding: true, margin: true });

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

  const updateStyle = (key: string, value: unknown) => {
    const newStyles = { ...localStyles, [key]: value };
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  const getStyleValue = (key: string, defaultValue: string = '0px') => {
    return (localStyles[key] as string) || defaultValue;
  };

  const updateSpacing = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const isLinked = linked[type];
    
    if (isLinked) {
      updateStyle(`${type}`, value);
      updateStyle(`${type}Top`, value);
      updateStyle(`${type}Right`, value);
      updateStyle(`${type}Bottom`, value);
      updateStyle(`${type}Left`, value);
    } else {
      updateStyle(`${type}${side.charAt(0).toUpperCase() + side.slice(1)}`, value);
    }
  };

  const getSpacingValue = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left') => {
    const isLinked = linked[type];
    if (isLinked) {
      return getStyleValue(`${type}`, '0px');
    }
    return getStyleValue(`${type}${side.charAt(0).toUpperCase() + side.slice(1)}`, '0px');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold">Отступы (Padding)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLinked({ ...linked, padding: !linked.padding })}
              className="h-6"
            >
              <Icon 
                name={linked.padding ? "Link" : "LinkOff"} 
                size={14}
                className={linked.padding ? "text-primary" : ""}
              />
            </Button>
          </div>
          {linked.padding ? (
            <div>
              <Input
                type="text"
                value={getStyleValue('padding', '0px')}
                onChange={(e) => updateSpacing('padding', 'top', e.target.value)}
                placeholder="0px"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Верх</Label>
                <Input
                  type="text"
                  value={getSpacingValue('padding', 'top')}
                  onChange={(e) => updateSpacing('padding', 'top', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Право</Label>
                <Input
                  type="text"
                  value={getSpacingValue('padding', 'right')}
                  onChange={(e) => updateSpacing('padding', 'right', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Низ</Label>
                <Input
                  type="text"
                  value={getSpacingValue('padding', 'bottom')}
                  onChange={(e) => updateSpacing('padding', 'bottom', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Лево</Label>
                <Input
                  type="text"
                  value={getSpacingValue('padding', 'left')}
                  onChange={(e) => updateSpacing('padding', 'left', e.target.value)}
                  placeholder="0px"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold">Внешние отступы (Margin)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLinked({ ...linked, margin: !linked.margin })}
              className="h-6"
            >
              <Icon 
                name={linked.margin ? "Link" : "LinkOff"} 
                size={14}
                className={linked.margin ? "text-primary" : ""}
              />
            </Button>
          </div>
          {linked.margin ? (
            <div>
              <Input
                type="text"
                value={getStyleValue('margin', '0px')}
                onChange={(e) => updateSpacing('margin', 'top', e.target.value)}
                placeholder="0px"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Верх</Label>
                <Input
                  type="text"
                  value={getSpacingValue('margin', 'top')}
                  onChange={(e) => updateSpacing('margin', 'top', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Право</Label>
                <Input
                  type="text"
                  value={getSpacingValue('margin', 'right')}
                  onChange={(e) => updateSpacing('margin', 'right', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Низ</Label>
                <Input
                  type="text"
                  value={getSpacingValue('margin', 'bottom')}
                  onChange={(e) => updateSpacing('margin', 'bottom', e.target.value)}
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Лево</Label>
                <Input
                  type="text"
                  value={getSpacingValue('margin', 'left')}
                  onChange={(e) => updateSpacing('margin', 'left', e.target.value)}
                  placeholder="0px"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Размеры</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Ширина</Label>
                <Input
                  type="text"
                  value={getStyleValue('width', 'auto')}
                  onChange={(e) => updateStyle('width', e.target.value)}
                  placeholder="auto"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Высота</Label>
                <Input
                  type="text"
                  value={getStyleValue('height', 'auto')}
                  onChange={(e) => updateStyle('height', e.target.value)}
                  placeholder="auto"
                />
              </div>
            </div>
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
            <div>
              <Label className="text-xs mb-1 block">Box Sizing</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={getStyleValue('boxSizing', 'content-box')}
                onChange={(e) => updateStyle('boxSizing', e.target.value)}
              >
                <option value="content-box">Content Box</option>
                <option value="border-box">Border Box</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

