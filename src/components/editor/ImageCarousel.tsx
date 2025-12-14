import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  autoplay?: boolean;
  interval?: number;
  onImagesChange: (images: string[]) => void;
  className?: string;
}

export const ImageCarousel = ({ images, autoplay = false, interval = 3000, onImagesChange, className }: ImageCarouselProps) => {
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
        <p className="text-sm text-muted-foreground">Добавьте изображения в карусель</p>
      </div>
    );
  }

  return (
    <Carousel
      className={cn("w-full", className)}
      opts={{
        align: "start",
        loop: true,
        ...(autoplay && { autoplay: { delay: interval } })
      }}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <img
                src={image}
                alt={`Слайд ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

