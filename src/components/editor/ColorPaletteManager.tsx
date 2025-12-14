import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ColorPicker } from './ColorPicker';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
}

const defaultPalettes: ColorPalette[] = [
  {
    id: 'default',
    name: 'По умолчанию',
    colors: {
      primary: '#0ea5e9',
      secondary: '#a855f7',
      accent: '#0ea5e9',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#e2e8f0'
    }
  },
  {
    id: 'ocean',
    name: 'Океан',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#22d3ee',
      background: '#ffffff',
      foreground: '#0c4a6e',
      muted: '#e0f2fe',
      border: '#bae6fd'
    }
  },
  {
    id: 'forest',
    name: 'Лес',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      foreground: '#064e3b',
      muted: '#d1fae5',
      border: '#a7f3d0'
    }
  },
  {
    id: 'sunset',
    name: 'Закат',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
      background: '#ffffff',
      foreground: '#78350f',
      muted: '#fef3c7',
      border: '#fde68a'
    }
  },
  {
    id: 'rose',
    name: 'Роза',
    colors: {
      primary: '#e11d48',
      secondary: '#be123c',
      accent: '#fb7185',
      background: '#ffffff',
      foreground: '#881337',
      muted: '#ffe4e6',
      border: '#fecdd3'
    }
  },
  {
    id: 'dark',
    name: 'Темная',
    colors: {
      primary: '#0ea5e9',
      secondary: '#a855f7',
      accent: '#0ea5e9',
      background: '#1e293b',
      foreground: '#f8fafc',
      muted: '#334155',
      border: '#475569'
    }
  }
];

interface ColorPaletteManagerProps {
  selectedPaletteId?: string;
  customPalettes?: ColorPalette[];
  onPaletteSelect: (palette: ColorPalette) => void;
  onPaletteSave?: (palette: ColorPalette) => void;
  onPaletteDelete?: (paletteId: string) => void;
  className?: string;
}

export const ColorPaletteManager = ({
  selectedPaletteId,
  customPalettes = [],
  onPaletteSelect,
  onPaletteSave,
  onPaletteDelete,
  className
}: ColorPaletteManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPalette, setNewPalette] = useState<ColorPalette>({
    id: '',
    name: 'Новая палитра',
    colors: {
      primary: '#0ea5e9',
      secondary: '#a855f7',
      accent: '#0ea5e9',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#e2e8f0'
    }
  });

  const allPalettes = [...defaultPalettes, ...customPalettes];

  const handleCreatePalette = () => {
    if (newPalette.name.trim() && onPaletteSave) {
      const paletteToSave = {
        ...newPalette,
        id: `custom-${Date.now()}`
      };
      onPaletteSave(paletteToSave);
      setNewPalette({
        id: '',
        name: 'Новая палитра',
        colors: {
          primary: '#0ea5e9',
          secondary: '#a855f7',
          accent: '#0ea5e9',
          background: '#ffffff',
          foreground: '#0f172a',
          muted: '#f1f5f9',
          border: '#e2e8f0'
        }
      });
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3">
        {allPalettes.map((palette) => (
          <Card
            key={palette.id}
            className={cn(
              "p-3 cursor-pointer transition-all hover:ring-2 hover:ring-primary",
              selectedPaletteId === palette.id && "ring-2 ring-primary"
            )}
            onClick={() => onPaletteSelect(palette)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{palette.name}</span>
              {customPalettes.some(p => p.id === palette.id) && onPaletteDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPaletteDelete(palette.id);
                  }}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              )}
            </div>
            <div className="flex gap-1">
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: palette.colors.primary }}
                title="Primary"
              />
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: palette.colors.secondary }}
                title="Secondary"
              />
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: palette.colors.accent }}
                title="Accent"
              />
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: palette.colors.background }}
                title="Background"
              />
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: palette.colors.foreground }}
                title="Foreground"
              />
            </div>
          </Card>
        ))}
      </div>

      {isCreating ? (
        <Card className="p-4 space-y-4">
          <div>
            <Label>Название палитры</Label>
            <Input
              value={newPalette.name}
              onChange={(e) => setNewPalette({ ...newPalette, name: e.target.value })}
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Primary"
              value={newPalette.colors.primary}
              onChange={(value) => setNewPalette({
                ...newPalette,
                colors: { ...newPalette.colors, primary: value }
              })}
            />
            <ColorPicker
              label="Secondary"
              value={newPalette.colors.secondary}
              onChange={(value) => setNewPalette({
                ...newPalette,
                colors: { ...newPalette.colors, secondary: value }
              })}
            />
            <ColorPicker
              label="Accent"
              value={newPalette.colors.accent}
              onChange={(value) => setNewPalette({
                ...newPalette,
                colors: { ...newPalette.colors, accent: value }
              })}
            />
            <ColorPicker
              label="Background"
              value={newPalette.colors.background}
              onChange={(value) => setNewPalette({
                ...newPalette,
                colors: { ...newPalette.colors, background: value }
              })}
            />
            <ColorPicker
              label="Foreground"
              value={newPalette.colors.foreground}
              onChange={(value) => setNewPalette({
                ...newPalette,
                colors: { ...newPalette.colors, foreground: value }
              })}
            />
            <ColorPicker
              label="Muted"
              value={newPalette.colors.muted}
              onChange={(value) => setNewPalette({
                ...newPalette,
                colors: { ...newPalette.colors, muted: value }
              })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreatePalette} size="sm">
              Сохранить
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(false)}
            >
              Отмена
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Создать палитру
        </Button>
      )}
    </div>
  );
};

