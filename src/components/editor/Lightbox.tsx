import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { ImageEditor } from './ImageEditor';
import { cn } from '@/lib/utils';

interface LightboxProps {
  thumbnailUrl?: string;
  fullImageUrl?: string;
  videoUrl?: string;
  title?: string;
  onThumbnailChange: (url: string) => void;
  onFullImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  onTitleChange: (title: string) => void;
  className?: string;
}

export const Lightbox = ({
  thumbnailUrl,
  fullImageUrl,
  videoUrl,
  title,
  onThumbnailChange,
  onFullImageChange,
  onVideoChange,
  onTitleChange,
  className
}: LightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="relative cursor-pointer group">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title || 'Изображение'}
                className="w-full h-auto rounded-lg transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <Icon name="Image" size={48} className="text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <Icon name="ZoomIn" size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-7xl w-full p-0">
          <div className="relative">
            {fullImageUrl && (
              <img
                src={fullImageUrl}
                alt={title || 'Изображение'}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            )}
            {videoUrl && (
              <video
                src={videoUrl}
                controls
                className="w-full h-auto max-h-[90vh]"
              />
            )}
            {title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">Миниатюра</label>
          <ImageEditor
            imageUrl={thumbnailUrl || null}
            onImageChange={onThumbnailChange}
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Полное изображение</label>
          <ImageEditor
            imageUrl={fullImageUrl || null}
            onImageChange={onFullImageChange}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};

