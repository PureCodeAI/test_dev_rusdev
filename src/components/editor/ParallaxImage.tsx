import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface ParallaxImageProps {
  imageUrl: string | null;
  speed?: number;
  onImageChange: (url: string) => void;
  className?: string;
}

export const ParallaxImage = ({ imageUrl, speed = 0.5, onImageChange, className }: ParallaxImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY;
        
        if (scrollPosition + windowHeight > elementTop && scrollPosition < elementTop + elementHeight) {
          const offset = (scrollPosition + windowHeight - elementTop) * speed;
          setScrollY(offset);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          onImageChange(result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!imageUrl) {
    return (
      <div
        className={cn("w-full h-96 bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border", className)}
        onClick={handleAddImage}
      >
        <Icon name="Image" size={48} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Добавьте изображение для параллакса</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-96 overflow-hidden", className)}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY}px)`,
          willChange: 'transform'
        }}
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

