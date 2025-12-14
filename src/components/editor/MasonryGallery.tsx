import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface MasonryGalleryProps {
  images: string[];
  columns?: number;
  gap?: number;
  onImagesChange: (images: string[]) => void;
  className?: string;
}

export const MasonryGallery = ({ images, columns = 3, gap = 16, onImagesChange, className }: MasonryGalleryProps) => {
  const [heights, setHeights] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length > 0 && containerRef.current) {
      const imgElements = containerRef.current.querySelectorAll('img');
      const newHeights: number[] = [];
      
      imgElements.forEach((img) => {
        img.onload = () => {
          newHeights.push(img.naturalHeight);
          if (newHeights.length === images.length) {
            setHeights(newHeights);
          }
        };
      });
    }
  }, [images]);

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const newImages: string[] = [];
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            newImages.push(result);
            if (newImages.length === files.length) {
              onImagesChange([...images, ...newImages]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };
    input.click();
  };

  if (images.length === 0) {
    return (
      <div
        className={cn("w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border", className)}
        onClick={handleAddImage}
      >
        <Icon name="Image" size={48} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Добавьте изображения в Masonry галерею</p>
      </div>
    );
  }

  const columnHeights = new Array(columns).fill(0);
  const columnImages: string[][] = new Array(columns).fill(null).map(() => []);

  images.forEach((image, index) => {
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
    columnImages[shortestColumn].push(image);
    const height = heights[index] || 200;
    columnHeights[shortestColumn] += height + gap;
  });

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px` }}
    >
      {columnImages.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {column.map((image, imgIndex) => {
            const globalIndex = images.indexOf(image);
            return (
              <div key={globalIndex} className="relative group overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={`Изображение ${globalIndex + 1}`}
                  className="w-full h-auto object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      ))}
      <div
        className="border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-[200px]"
        onClick={handleAddImage}
      >
        <Icon name="Plus" size={32} className="text-muted-foreground" />
      </div>
    </div>
  );
};

