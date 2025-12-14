import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface GridSettingsProps {
  enabled: boolean;
  size: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onSizeChange: (size: number) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onSnapToObjectsChange: (snap: boolean) => void;
}

export const GridSettings = ({
  enabled,
  size,
  snapToGrid,
  snapToObjects,
  onEnabledChange,
  onSizeChange,
  onSnapToGridChange,
  onSnapToObjectsChange
}: GridSettingsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          title="Настройки сетки"
        >
          <Icon name="Grid3x3" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="grid-enabled">Показать сетку</Label>
            <Switch
              id="grid-enabled"
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
          </div>
          
          {enabled && (
            <>
              <div>
                <Label className="text-xs mb-2 block">Размер сетки (px)</Label>
                <Input
                  type="number"
                  min="5"
                  max="100"
                  step="5"
                  value={size}
                  onChange={(e) => onSizeChange(parseInt(e.target.value) || 20)}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-grid" className="text-sm">Привязка к сетке</Label>
                  <Switch
                    id="snap-grid"
                    checked={snapToGrid}
                    onCheckedChange={onSnapToGridChange}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-objects" className="text-sm">Привязка к объектам</Label>
                  <Switch
                    id="snap-objects"
                    checked={snapToObjects}
                    onCheckedChange={onSnapToObjectsChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

