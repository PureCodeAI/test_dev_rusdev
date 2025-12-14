import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';
import { cn } from '@/lib/utils';

interface EffectsEditorProps {
  styles: Record<string, unknown>;
  onStylesChange: (styles: Record<string, unknown>) => void;
}

export const EffectsEditor = ({ styles, onStylesChange }: EffectsEditorProps) => {
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

  const parseBoxShadow = (shadow: string) => {
    if (!shadow || shadow === 'none') {
      return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', inset: false };
    }

    const inset = shadow.includes('inset');
    const parts = shadow.replace(/inset\s*/g, '').trim().split(/\s+/);
    
    return {
      x: parseInt(parts[0]) || 0,
      y: parseInt(parts[1]) || 0,
      blur: parseInt(parts[2]) || 0,
      spread: parseInt(parts[3]) || 0,
      color: parts[4] || '#000000',
      inset
    };
  };

  const parseTextShadow = (shadow: string) => {
    if (!shadow || shadow === 'none') {
      return { x: 0, y: 0, blur: 0, color: '#000000' };
    }

    const parts = shadow.trim().split(/\s+/);
    
    return {
      x: parseInt(parts[0]) || 0,
      y: parseInt(parts[1]) || 0,
      blur: parseInt(parts[2]) || 0,
      color: parts[3] || '#000000'
    };
  };

  const updateBoxShadow = (key: string, value: number | string | boolean) => {
    const current = parseBoxShadow(getStyleValue('boxShadow', '') as string);
    const updated = { ...current, [key]: value };
    
    const parts = [
      updated.inset ? 'inset' : '',
      `${updated.x}px`,
      `${updated.y}px`,
      `${updated.blur}px`,
      `${updated.spread}px`,
      updated.color
    ].filter(Boolean);
    
    updateStyle('boxShadow', parts.join(' ') || 'none');
  };

  const updateTextShadow = (key: string, value: number | string) => {
    const current = parseTextShadow(getStyleValue('textShadow', '') as string);
    const updated = { ...current, [key]: value };
    
    const parts = [
      `${updated.x}px`,
      `${updated.y}px`,
      `${updated.blur}px`,
      updated.color
    ];
    
    updateStyle('textShadow', parts.join(' ') || 'none');
  };

  const parseFilter = (filter: string) => {
    if (!filter || filter === 'none') {
      return { blur: 0, brightness: 100, contrast: 100, saturate: 100, hue: 0, grayscale: 0, sepia: 0 };
    }

    const blurMatch = filter.match(/blur\((\d+)px\)/);
    const brightnessMatch = filter.match(/brightness\((\d+)%\)/);
    const contrastMatch = filter.match(/contrast\((\d+)%\)/);
    const saturateMatch = filter.match(/saturate\((\d+)%\)/);
    const hueMatch = filter.match(/hue-rotate\((\d+)deg\)/);
    const grayscaleMatch = filter.match(/grayscale\((\d+)%\)/);
    const sepiaMatch = filter.match(/sepia\((\d+)%\)/);

    return {
      blur: blurMatch ? parseInt(blurMatch[1]) : 0,
      brightness: brightnessMatch ? parseInt(brightnessMatch[1]) : 100,
      contrast: contrastMatch ? parseInt(contrastMatch[1]) : 100,
      saturate: saturateMatch ? parseInt(saturateMatch[1]) : 100,
      hue: hueMatch ? parseInt(hueMatch[1]) : 0,
      grayscale: grayscaleMatch ? parseInt(grayscaleMatch[1]) : 0,
      sepia: sepiaMatch ? parseInt(sepiaMatch[1]) : 0
    };
  };

  const updateFilter = (key: string, value: number) => {
    const current = parseFilter(getStyleValue('filter', '') as string);
    const updated = { ...current, [key]: value };
    
    const filters: string[] = [];
    if (updated.blur > 0) filters.push(`blur(${updated.blur}px)`);
    if (updated.brightness !== 100) filters.push(`brightness(${updated.brightness}%)`);
    if (updated.contrast !== 100) filters.push(`contrast(${updated.contrast}%)`);
    if (updated.saturate !== 100) filters.push(`saturate(${updated.saturate}%)`);
    if (updated.hue !== 0) filters.push(`hue-rotate(${updated.hue}deg)`);
    if (updated.grayscale > 0) filters.push(`grayscale(${updated.grayscale}%)`);
    if (updated.sepia > 0) filters.push(`sepia(${updated.sepia}%)`);
    
    updateStyle('filter', filters.length > 0 ? filters.join(' ') : 'none');
  };

  const parseBorder = (border: string) => {
    if (!border || border === 'none') {
      return { width: 0, style: 'solid', color: '#000000' };
    }

    const parts = border.split(/\s+/);
    return {
      width: parseInt(parts[0]) || 0,
      style: parts[1] || 'solid',
      color: parts[2] || '#000000'
    };
  };

  const updateBorder = (key: string, value: string | number) => {
    const current = parseBorder(getStyleValue('border', '') as string);
    const updated = { ...current, [key]: value };
    
    if (updated.width === 0) {
      updateStyle('border', 'none');
    } else {
      updateStyle('border', `${updated.width}px ${updated.style} ${updated.color}`);
    }
  };

  const parseOutline = (outline: string) => {
    if (!outline || outline === 'none') {
      return { width: 0, style: 'solid', color: '#000000', offset: 0 };
    }

    const parts = outline.split(/\s+/);
    return {
      width: parseInt(parts[0]) || 0,
      style: parts[1] || 'solid',
      color: parts[2] || '#000000',
      offset: parseInt(parts[3]) || 0
    };
  };

  const updateOutline = (key: string, value: string | number) => {
    const current = parseOutline(getStyleValue('outline', '') as string);
    const updated = { ...current, [key]: value };
    
    if (updated.width === 0) {
      updateStyle('outline', 'none');
    } else {
      updateStyle('outline', `${updated.width}px ${updated.style} ${updated.color}`);
      if (updated.offset !== 0) {
        updateStyle('outlineOffset', `${updated.offset}px`);
      }
    }
  };

  const boxShadow = parseBoxShadow(getStyleValue('boxShadow', '') as string);
  const textShadow = parseTextShadow(getStyleValue('textShadow', '') as string);
  const filter = parseFilter(getStyleValue('filter', '') as string);
  const border = parseBorder(getStyleValue('border', '') as string);
  const outline = parseOutline(getStyleValue('outline', '') as string);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold mb-3 block">Размытие</Label>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">Blur: {filter.blur}px</Label>
          </div>
          <Slider
            value={[filter.blur]}
            onValueChange={(vals) => updateFilter('blur', vals[0])}
            min={0}
            max={50}
            step={1}
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Тени</Label>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Box Shadow</Label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1">X: {boxShadow.x}px</Label>
                  <Slider
                    value={[boxShadow.x]}
                    onValueChange={(vals) => updateBoxShadow('x', vals[0])}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1">Y: {boxShadow.y}px</Label>
                  <Slider
                    value={[boxShadow.y]}
                    onValueChange={(vals) => updateBoxShadow('y', vals[0])}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1">Blur: {boxShadow.blur}px</Label>
                <Slider
                  value={[boxShadow.blur]}
                  onValueChange={(vals) => updateBoxShadow('blur', vals[0])}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Spread: {boxShadow.spread}px</Label>
                <Slider
                  value={[boxShadow.spread]}
                  onValueChange={(vals) => updateBoxShadow('spread', vals[0])}
                  min={-20}
                  max={20}
                  step={1}
                />
              </div>
              <ColorPicker
                label="Цвет тени"
                value={boxShadow.color}
                onChange={(value) => updateBoxShadow('color', value)}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={boxShadow.inset}
                  onChange={(e) => updateBoxShadow('inset', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-xs">Внутренняя тень</Label>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Text Shadow</Label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1">X: {textShadow.x}px</Label>
                  <Slider
                    value={[textShadow.x]}
                    onValueChange={(vals) => updateTextShadow('x', vals[0])}
                    min={-20}
                    max={20}
                    step={1}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1">Y: {textShadow.y}px</Label>
                  <Slider
                    value={[textShadow.y]}
                    onValueChange={(vals) => updateTextShadow('y', vals[0])}
                    min={-20}
                    max={20}
                    step={1}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1">Blur: {textShadow.blur}px</Label>
                <Slider
                  value={[textShadow.blur]}
                  onValueChange={(vals) => updateTextShadow('blur', vals[0])}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
              <ColorPicker
                label="Цвет тени"
                value={textShadow.color}
                onChange={(value) => updateTextShadow('color', value)}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Границы</Label>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Border</Label>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1">Ширина: {border.width}px</Label>
                <Slider
                  value={[border.width]}
                  onValueChange={(vals) => updateBorder('width', vals[0])}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Стиль</Label>
                <Select
                  value={border.style}
                  onValueChange={(value) => updateBorder('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="groove">Groove</SelectItem>
                    <SelectItem value="ridge">Ridge</SelectItem>
                    <SelectItem value="inset">Inset</SelectItem>
                    <SelectItem value="outset">Outset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ColorPicker
                label="Цвет границы"
                value={border.color}
                onChange={(value) => updateBorder('color', value)}
              />
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Outline</Label>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1">Ширина: {outline.width}px</Label>
                <Slider
                  value={[outline.width]}
                  onValueChange={(vals) => updateOutline('width', vals[0])}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Стиль</Label>
                <Select
                  value={outline.style}
                  onValueChange={(value) => updateOutline('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ColorPicker
                label="Цвет обводки"
                value={outline.color}
                onChange={(value) => updateOutline('color', value)}
              />
              <div>
                <Label className="text-xs mb-1">Offset: {outline.offset}px</Label>
                <Slider
                  value={[outline.offset]}
                  onValueChange={(vals) => updateOutline('offset', vals[0])}
                  min={-10}
                  max={10}
                  step={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Фильтры</Label>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Brightness: {filter.brightness}%</Label>
            </div>
            <Slider
              value={[filter.brightness]}
              onValueChange={(vals) => updateFilter('brightness', vals[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Contrast: {filter.contrast}%</Label>
            </div>
            <Slider
              value={[filter.contrast]}
              onValueChange={(vals) => updateFilter('contrast', vals[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Saturate: {filter.saturate}%</Label>
            </div>
            <Slider
              value={[filter.saturate]}
              onValueChange={(vals) => updateFilter('saturate', vals[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Hue Rotate: {filter.hue}°</Label>
            </div>
            <Slider
              value={[filter.hue]}
              onValueChange={(vals) => updateFilter('hue', vals[0])}
              min={0}
              max={360}
              step={1}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Grayscale: {filter.grayscale}%</Label>
            </div>
            <Slider
              value={[filter.grayscale]}
              onValueChange={(vals) => updateFilter('grayscale', vals[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Sepia: {filter.sepia}%</Label>
            </div>
            <Slider
              value={[filter.sepia]}
              onValueChange={(vals) => updateFilter('sepia', vals[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

