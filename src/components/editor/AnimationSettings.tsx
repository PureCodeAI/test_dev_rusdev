import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AnimationType } from './ScrollAnimation';

interface AnimationSettingsProps {
  animationType: AnimationType;
  delay: number;
  duration: number;
  threshold: number;
  hoverEffects: {
    scale?: number;
    shadow?: boolean;
    colorChange?: string;
  };
  onAnimationTypeChange: (type: AnimationType) => void;
  onDelayChange: (delay: number) => void;
  onDurationChange: (duration: number) => void;
  onThresholdChange: (threshold: number) => void;
  onHoverEffectsChange: (effects: { scale?: number; shadow?: boolean; colorChange?: string }) => void;
}

export const AnimationSettings = ({
  animationType,
  delay,
  duration,
  threshold,
  hoverEffects,
  onAnimationTypeChange,
  onDelayChange,
  onDurationChange,
  onThresholdChange,
  onHoverEffectsChange
}: AnimationSettingsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold mb-3 block">Тип анимации</Label>
        <Select value={animationType} onValueChange={(value) => onAnimationTypeChange(value as AnimationType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Без анимации</SelectItem>
            <SelectItem value="fadeIn">Fade In (появление)</SelectItem>
            <SelectItem value="slideIn">Slide In (слайд снизу)</SelectItem>
            <SelectItem value="slideInLeft">Slide In Left (слайд слева)</SelectItem>
            <SelectItem value="slideInRight">Slide In Right (слайд справа)</SelectItem>
            <SelectItem value="zoomIn">Zoom In (увеличение)</SelectItem>
            <SelectItem value="rotate">Rotate (вращение)</SelectItem>
            <SelectItem value="bounce">Bounce (отскок)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Параметры анимации</Label>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Задержка: {delay}ms</Label>
            </div>
            <Slider
              value={[delay]}
              onValueChange={(vals) => onDelayChange(vals[0])}
              min={0}
              max={2000}
              step={100}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Длительность: {duration}ms</Label>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(vals) => onDurationChange(vals[0])}
              min={100}
              max={3000}
              step={100}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Порог видимости: {Math.round(threshold * 100)}%</Label>
            </div>
            <Slider
              value={[threshold]}
              onValueChange={(vals) => onThresholdChange(vals[0])}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Hover эффекты</Label>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Масштаб: {hoverEffects.scale || 1}x</Label>
            </div>
            <Slider
              value={[hoverEffects.scale || 1]}
              onValueChange={(vals) => onHoverEffectsChange({ ...hoverEffects, scale: vals[0] })}
              min={1}
              max={1.5}
              step={0.05}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Тень при наведении</Label>
            <input
              type="checkbox"
              checked={hoverEffects.shadow || false}
              onChange={(e) => onHoverEffectsChange({ ...hoverEffects, shadow: e.target.checked })}
              className="h-4 w-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

