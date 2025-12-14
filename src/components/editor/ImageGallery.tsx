import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  columns?: number;
  onImagesChange: (images: string[]) => void;
  className?: string;
}

export const ImageGallery = ({ images, columns = 3, onImagesChange, className }: ImageGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

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
        <p className="text-sm text-muted-foreground">Добавьте изображения в галерею</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid gap-4", className, `grid-cols-${columns}`)}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg"
            onClick={() => handleImageClick(index)}
          >
            <img
              src={image}
              alt={`Изображение ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Icon name="Maximize" size={24} className="text-white opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        ))}
        <div
          className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={handleAddImage}
        >
          <Icon name="Plus" size={32} className="text-muted-foreground" />
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0">
          <div className="relative">
            <img
              src={images[selectedImageIndex]}
              alt={`Изображение ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                >
                  <Icon name="ChevronLeft" size={24} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                >
                  <Icon name="ChevronRight" size={24} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

