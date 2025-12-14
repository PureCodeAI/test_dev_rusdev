import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { ColorPicker } from './ColorPicker';

interface GradientStop {
  color: string;
  position: number;
}

interface GradientEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const defaultGradients = [
  'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(90deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
  'radial-gradient(circle, #667eea 0%, #764ba2 100%)',
];

export const GradientEditor = ({ label, value, onChange }: GradientEditorProps) => {
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 }
  ]);

  const parseGradient = (gradientString: string) => {
    if (!gradientString || !gradientString.includes('gradient')) {
      return { type: 'linear', angle: 90, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] };
    }

    const isRadial = gradientString.includes('radial-gradient');
    const isConic = gradientString.includes('conic-gradient');
    const type = isConic ? 'conic' : isRadial ? 'radial' : 'linear';
    
    let parsedAngle = 90;
    if (!isRadial) {
      const angleMatch = gradientString.match(/(\d+)deg/);
      if (angleMatch) {
        parsedAngle = parseInt(angleMatch[1]);
      }
    }

    const stops: GradientStop[] = [];
    const stopMatches = gradientString.matchAll(/(#[0-9A-Fa-f]{6}|rgba?\([^)]+\))\s+(\d+)%/g);
    for (const match of stopMatches) {
      stops.push({ color: match[1], position: parseInt(match[2]) });
    }

    if (stops.length === 0) {
      stops.push({ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 });
    }

    return { type, angle: parsedAngle, stops };
  };

  const updateGradient = (newType?: 'linear' | 'radial' | 'conic', newAngle?: number, newStops?: GradientStop[]) => {
    const finalType = newType ?? gradientType;
    const finalAngle = newAngle ?? angle;
    const finalStops = newStops ?? stops;

    setGradientType(finalType);
    if (newAngle !== undefined) setAngle(finalAngle);
    if (newStops) setStops(finalStops);

    if (finalType === 'radial') {
      const gradient = `radial-gradient(circle, ${finalStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
      onChange(gradient);
    } else if (finalType === 'conic') {
      const gradient = `conic-gradient(from ${finalAngle}deg, ${finalStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
      onChange(gradient);
    } else {
      const gradient = `linear-gradient(${finalAngle}deg, ${finalStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
      onChange(gradient);
    }
  };

  const handleStopColorChange = (index: number, color: string) => {
    const newStops = [...stops];
    newStops[index].color = color;
    updateGradient(undefined, undefined, newStops);
  };

  const handleStopPositionChange = (index: number, position: number) => {
    const newStops = [...stops];
    newStops[index].position = position;
    updateGradient(undefined, undefined, newStops);
  };

  const handleAddStop = () => {
    const newStops = [...stops, { color: '#ffffff', position: 50 }];
    updateGradient(undefined, undefined, newStops);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length > 2) {
      const newStops = stops.filter((_, i) => i !== index);
      updateGradient(undefined, undefined, newStops);
    }
  };

  const handlePresetSelect = (preset: string) => {
    onChange(preset);
    const parsed = parseGradient(preset);
    setGradientType(parsed.type);
    setAngle(parsed.angle);
    setStops(parsed.stops);
  };

  const currentValue = value || 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
  const previewStyle = { background: currentValue };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start h-10"
          >
            <div 
              className="w-5 h-5 rounded border border-border mr-2"
              style={previewStyle}
            />
            <span className="text-sm truncate flex-1 text-left">Градиент</span>
            <Icon name="ChevronDown" size={16} className="ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-2">Тип градиента</Label>
              <Select
                value={gradientType}
                onValueChange={(val) => updateGradient(val as 'linear' | 'radial' | 'conic')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Линейный</SelectItem>
                  <SelectItem value="radial">Радиальный</SelectItem>
                  <SelectItem value="conic">Конусный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(gradientType === 'linear' || gradientType === 'conic') && (
              <div>
                <Label className="text-xs mb-2">Угол: {angle}°</Label>
                <Slider
                  value={[angle]}
                  onValueChange={(vals) => updateGradient(undefined, vals[0])}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Цветовые остановки</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddStop}
                  className="h-6 text-xs"
                >
                  <Icon name="Plus" size={12} className="mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ColorPicker
                      label=""
                      value={stop.color}
                      onChange={(color) => handleStopColorChange(index, color)}
                      presetColors={[]}
                    />
                    <div className="flex-1">
                      <Slider
                        value={[stop.position]}
                        onValueChange={(vals) => handleStopPositionChange(index, vals[0])}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        {stop.position}%
                      </div>
                    </div>
                    {stops.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStop(index)}
                        className="h-8 w-8"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2">Готовые градиенты</Label>
              <div className="grid grid-cols-2 gap-2">
                {defaultGradients.map((gradient, index) => (
                  <button
                    key={index}
                    type="button"
                    className="h-8 rounded border-2 border-border hover:scale-105 transition-transform"
                    style={{ background: gradient }}
                    onClick={() => handlePresetSelect(gradient)}
                    title={gradient}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

