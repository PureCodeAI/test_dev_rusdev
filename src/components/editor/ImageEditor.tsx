import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ImageEditorProps {
  imageUrl: string | null;
  onImageChange: (url: string) => void;
  onCrop?: (cropData: { x: number; y: number; width: number; height: number }) => void;
  className?: string;
}

export const ImageEditor = ({ 
  imageUrl, 
  onImageChange, 
  onCrop,
  className = '' 
}: ImageEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCrop = () => {
    if (imageRef.current && onCrop) {
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();
      onCrop({
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const imageStyle: React.CSSProperties = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  };

  if (!imageUrl) {
    return (
      <div
        className={`w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed ${
          isDragging ? 'border-primary bg-primary/10' : 'border-border'
        } ${className}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <Icon name="Image" size={48} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Перетащите изображение или кликните для выбора
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        <img
          ref={imageRef}
          src={imageUrl}
          alt=""
          className="w-full h-auto rounded-lg"
          style={imageStyle}
          onClick={handleClick}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onImageChange('');
            }}
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Редактирование изображения</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt=""
                className="max-w-full max-h-96 rounded-lg"
                style={imageStyle}
              />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Яркость: {brightness}%</Label>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={(vals) => setBrightness(vals[0])}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Контраст: {contrast}%</Label>
                </div>
                <Slider
                  value={[contrast]}
                  onValueChange={(vals) => setContrast(vals[0])}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Насыщенность: {saturation}%</Label>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={(vals) => setSaturation(vals[0])}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                    setSaturation(100);
                  }}
                >
                  Сбросить
                </Button>
                <Button
                  onClick={handleCrop}
                >
                  <Icon name="Crop" size={16} className="mr-2" />
                  Обрезать
                </Button>
                <Button
                  onClick={() => {
                    const newUrl = imageUrl;
                    onImageChange(newUrl);
                    setIsEditing(false);
                  }}
                >
                  Применить
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

