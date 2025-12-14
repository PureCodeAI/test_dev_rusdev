import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { ColorPaletteManager, ColorPalette } from './ColorPaletteManager';
import { FontPairManager, FontPair } from './FontPairManager';
import { TypographyStylesManager, TypographyStyle } from './TypographyStylesManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeManagerProps {
  currentTheme: ThemeMode;
  currentPalette?: ColorPalette;
  customPalettes?: ColorPalette[];
  currentFontPair?: FontPair;
  customFontPairs?: FontPair[];
  customTypographyStyles?: TypographyStyle[];
  onThemeChange: (theme: ThemeMode) => void;
  onPaletteSelect: (palette: ColorPalette) => void;
  onPaletteSave?: (palette: ColorPalette) => void;
  onPaletteDelete?: (paletteId: string) => void;
  onFontPairSelect?: (pair: FontPair) => void;
  onFontPairSave?: (pair: FontPair) => void;
  onFontPairDelete?: (pairId: string) => void;
  onTypographyStyleSelect?: (style: TypographyStyle) => void;
  onTypographyStyleSave?: (style: TypographyStyle) => void;
  onTypographyStyleDelete?: (styleId: string) => void;
  onApplyTypographyStyle?: (style: TypographyStyle) => void;
  onApplyToSite?: () => void;
  className?: string;
}

export const ThemeManager = ({
  currentTheme,
  currentPalette,
  customPalettes = [],
  currentFontPair,
  customFontPairs = [],
  customTypographyStyles = [],
  onThemeChange,
  onPaletteSelect,
  onPaletteSave,
  onPaletteDelete,
  onFontPairSelect,
  onFontPairSave,
  onFontPairDelete,
  onTypographyStyleSelect,
  onTypographyStyleSave,
  onTypographyStyleDelete,
  onApplyTypographyStyle,
  onApplyToSite,
  className
}: ThemeManagerProps) => {
  const [showPaletteManager, setShowPaletteManager] = useState(false);

  const applyPaletteToCSS = (palette: ColorPalette) => {
    const root = document.documentElement;
    const colors = palette.colors;
    
    const hslToCSS = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hslToCSS(colors.primary));
    root.style.setProperty('--secondary', hslToCSS(colors.secondary));
    root.style.setProperty('--accent', hslToCSS(colors.accent));
    root.style.setProperty('--background', hslToCSS(colors.background));
    root.style.setProperty('--foreground', hslToCSS(colors.foreground));
    root.style.setProperty('--muted', hslToCSS(colors.muted));
    root.style.setProperty('--border', hslToCSS(colors.border));
  };

  const handlePaletteSelect = (palette: ColorPalette) => {
    onPaletteSelect(palette);
    applyPaletteToCSS(palette);
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onThemeChange(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-xs font-semibold mb-3 block">Тема оформления</Label>
        <Select value={currentTheme} onValueChange={(value) => handleThemeChange(value as ThemeMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">
              <div className="flex items-center gap-2">
                <Icon name="Sun" size={16} />
                Светлая
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center gap-2">
                <Icon name="Moon" size={16} />
                Темная
              </div>
            </SelectItem>
            <SelectItem value="auto">
              <div className="flex items-center gap-2">
                <Icon name="Monitor" size={16} />
                Автоматически
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="palette" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="palette">Палитры</TabsTrigger>
          <TabsTrigger value="fonts">Шрифты</TabsTrigger>
          <TabsTrigger value="styles">Стили</TabsTrigger>
        </TabsList>

        <TabsContent value="palette" className="space-y-4 mt-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-semibold">Цветовая палитра</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaletteManager(!showPaletteManager)}
              >
                <Icon name={showPaletteManager ? "ChevronUp" : "ChevronDown"} size={16} />
              </Button>
            </div>
            {showPaletteManager && (
              <ColorPaletteManager
                selectedPaletteId={currentPalette?.id}
                customPalettes={customPalettes}
                onPaletteSelect={handlePaletteSelect}
                onPaletteSave={onPaletteSave}
                onPaletteDelete={onPaletteDelete}
              />
            )}
            {currentPalette && !showPaletteManager && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{currentPalette.name}</span>
                  <div className="flex gap-1">
                    <div
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: currentPalette.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: currentPalette.colors.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: currentPalette.colors.accent }}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fonts" className="space-y-4 mt-4">
          {onFontPairSelect && (
            <FontPairManager
              selectedPairId={currentFontPair?.id}
              customPairs={customFontPairs}
              onPairSelect={onFontPairSelect}
              onPairSave={onFontPairSave}
              onPairDelete={onFontPairDelete}
              onApplyToSite={onApplyToSite}
            />
          )}
        </TabsContent>

        <TabsContent value="styles" className="space-y-4 mt-4">
          {onTypographyStyleSelect && (
            <TypographyStylesManager
              customStyles={customTypographyStyles}
              onStyleSelect={onTypographyStyleSelect}
              onStyleSave={onTypographyStyleSave}
              onStyleDelete={onTypographyStyleDelete}
              onApplyStyle={onApplyTypographyStyle}
            />
          )}
        </TabsContent>
      </Tabs>

      {onApplyToSite && (
        <Button
          className="w-full"
          onClick={() => {
            if (currentPalette) {
              applyPaletteToCSS(currentPalette);
            }
            onApplyToSite();
          }}
        >
          <Icon name="Check" size={16} className="mr-2" />
          Применить ко всему сайту
        </Button>
      )}
    </div>
  );
};

