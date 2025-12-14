import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';
import { GradientEditor } from './GradientEditor';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface BackgroundEditorProps {
  styles: Record<string, unknown>;
  onStylesChange: (styles: Record<string, unknown>) => void;
}

export const BackgroundEditor = ({ styles, onStylesChange }: BackgroundEditorProps) => {
  const [backgroundType, setBackgroundType] = useState<'color' | 'image' | 'video' | 'gradient'>('color');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const updateStyle = (key: string, value: unknown) => {
    const newStyles = { ...styles, [key]: value };
    onStylesChange(newStyles);
  };

  const getStyleValue = (key: string, defaultValue: string | number = '') => {
    return styles[key] as string || defaultValue;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateStyle('backgroundImage', `url(${result})`);
        setBackgroundType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateStyle('backgroundVideo', result);
        setBackgroundType('video');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    if (url) {
      updateStyle('backgroundImage', `url(${url})`);
      setBackgroundType('image');
    } else {
      updateStyle('backgroundImage', '');
    }
  };

  const handleVideoUrlChange = (url: string) => {
    updateStyle('backgroundVideo', url);
    if (url) {
      setBackgroundType('video');
    }
  };

  const currentBackgroundImage = getStyleValue('backgroundImage', '') as string;
  const currentBackgroundVideo = getStyleValue('backgroundVideo', '') as string;
  const currentBackgroundGradient = getStyleValue('backgroundGradient', '') as string;

  if (currentBackgroundImage && currentBackgroundImage.includes('url(')) {
    if (backgroundType !== 'image') setBackgroundType('image');
  } else if (currentBackgroundVideo) {
    if (backgroundType !== 'video') setBackgroundType('video');
  } else if (currentBackgroundGradient) {
    if (backgroundType !== 'gradient') setBackgroundType('gradient');
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold mb-3 block">Тип фона</Label>
        <Select
          value={backgroundType}
          onValueChange={(value) => {
            setBackgroundType(value as 'color' | 'image' | 'video' | 'gradient');
            if (value === 'color') {
              updateStyle('backgroundImage', '');
              updateStyle('backgroundVideo', '');
              updateStyle('backgroundGradient', '');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="color">Цвет</SelectItem>
            <SelectItem value="image">Изображение</SelectItem>
            <SelectItem value="video">Видео</SelectItem>
            <SelectItem value="gradient">Градиент</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {backgroundType === 'color' && (
        <div>
          <ColorPicker
            label="Цвет фона"
            value={getStyleValue('backgroundColor', '#ffffff') as string}
            onChange={(value) => updateStyle('backgroundColor', value)}
          />
        </div>
      )}

      {backgroundType === 'image' && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">Изображение</Label>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="URL изображения"
                value={currentBackgroundImage.replace(/url\(|\)/g, '')}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="mb-2"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить изображение
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {currentBackgroundImage && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-2 block">Размер: {getStyleValue('backgroundSize', 'cover')}</Label>
                <Select
                  value={getStyleValue('backgroundSize', 'cover') as string}
                  onValueChange={(value) => updateStyle('backgroundSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="100% 100%">100% 100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Позиция: {getStyleValue('backgroundPosition', 'center')}</Label>
                <Select
                  value={getStyleValue('backgroundPosition', 'center') as string}
                  onValueChange={(value) => updateStyle('backgroundPosition', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Центр</SelectItem>
                    <SelectItem value="top">Верх</SelectItem>
                    <SelectItem value="bottom">Низ</SelectItem>
                    <SelectItem value="left">Слева</SelectItem>
                    <SelectItem value="right">Справа</SelectItem>
                    <SelectItem value="top left">Верх слева</SelectItem>
                    <SelectItem value="top right">Верх справа</SelectItem>
                    <SelectItem value="bottom left">Низ слева</SelectItem>
                    <SelectItem value="bottom right">Низ справа</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Повторение: {getStyleValue('backgroundRepeat', 'no-repeat')}</Label>
                <Select
                  value={getStyleValue('backgroundRepeat', 'no-repeat') as string}
                  onValueChange={(value) => updateStyle('backgroundRepeat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-repeat">Не повторять</SelectItem>
                    <SelectItem value="repeat">Повторять</SelectItem>
                    <SelectItem value="repeat-x">Повторять по X</SelectItem>
                    <SelectItem value="repeat-y">Повторять по Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={getStyleValue('backgroundAttachment', 'scroll') === 'fixed'}
                  onChange={(e) => updateStyle('backgroundAttachment', e.target.checked ? 'fixed' : 'scroll')}
                  className="rounded"
                />
                <Label className="text-xs">Фиксированный фон (fixed)</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!getStyleValue('backgroundParallax', false)}
                  onChange={(e) => updateStyle('backgroundParallax', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-xs">Параллакс эффект</Label>
              </div>

              {getStyleValue('backgroundParallax', false) && (
                <div>
                  <Label className="text-xs mb-2 block">Скорость параллакса: {getStyleValue('backgroundParallaxSpeed', 0.5)}</Label>
                  <Slider
                    value={[getStyleValue('backgroundParallaxSpeed', 0.5) as number]}
                    onValueChange={(vals) => updateStyle('backgroundParallaxSpeed', vals[0])}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {backgroundType === 'video' && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">Видео</Label>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="URL видео (YouTube, Vimeo или прямой URL)"
                value={currentBackgroundVideo}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className="mb-2"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => videoInputRef.current?.click()}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить видео
              </Button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>
          </div>

          {currentBackgroundVideo && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={getStyleValue('backgroundVideoAutoplay', true) as boolean}
                  onChange={(e) => updateStyle('backgroundVideoAutoplay', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-xs">Автозапуск</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={getStyleValue('backgroundVideoLoop', true) as boolean}
                  onChange={(e) => updateStyle('backgroundVideoLoop', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-xs">Зациклить</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={getStyleValue('backgroundVideoMuted', true) as boolean}
                  onChange={(e) => updateStyle('backgroundVideoMuted', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-xs">Без звука</Label>
              </div>
            </div>
          )}
        </div>
      )}

      {backgroundType === 'gradient' && (
        <div>
          <GradientEditor
            label="Градиент фона"
            value={currentBackgroundGradient}
            onChange={(value) => {
              updateStyle('backgroundGradient', value);
              updateStyle('backgroundImage', value);
            }}
          />
        </div>
      )}

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Overlay (наложение)</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!getStyleValue('backgroundOverlay', false)}
              onChange={(e) => updateStyle('backgroundOverlay', e.target.checked)}
              className="rounded"
            />
            <Label className="text-xs">Включить overlay</Label>
          </div>

          {getStyleValue('backgroundOverlay', false) && (
            <>
              <ColorPicker
                label="Цвет overlay"
                value={getStyleValue('backgroundOverlayColor', '#000000') as string}
                onChange={(value) => updateStyle('backgroundOverlayColor', value)}
              />
              <div>
                <Label className="text-xs mb-2 block">Прозрачность: {Math.round((getStyleValue('backgroundOverlayOpacity', 0.5) as number) * 100)}%</Label>
                <Slider
                  value={[(getStyleValue('backgroundOverlayOpacity', 0.5) as number) * 100]}
                  onValueChange={(vals) => updateStyle('backgroundOverlayOpacity', vals[0] / 100)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

