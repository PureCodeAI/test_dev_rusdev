import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presetColors?: string[];
}

const defaultPresetColors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
];

export const ColorPicker = ({ 
  label, 
  value, 
  onChange, 
  presetColors = defaultPresetColors 
}: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState(value || '#000000');

  const handleColorChange = (newColor: string) => {
    setHexValue(newColor);
    onChange(newColor);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(input)) {
      setHexValue(input);
      if (input.length === 7) {
        onChange(input);
      }
    }
  };

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
              style={{ backgroundColor: hexValue }}
            />
            <span className="text-sm">{hexValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-2">Выбор цвета</Label>
              <Input
                type="color"
                value={hexValue}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 cursor-pointer"
              />
            </div>
            <div>
              <Label className="text-xs mb-2">HEX код</Label>
              <Input
                type="text"
                value={hexValue}
                onChange={handleHexInput}
                placeholder="#000000"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-2">Быстрый выбор</Label>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
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

