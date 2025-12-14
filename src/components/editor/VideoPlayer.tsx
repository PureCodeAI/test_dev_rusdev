import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string | null;
  videoType?: 'youtube' | 'vimeo' | 'file';
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  onVideoChange: (url: string) => void;
  onTypeChange?: (type: 'youtube' | 'vimeo' | 'file') => void;
  className?: string;
}

export const VideoPlayer = ({
  videoUrl,
  videoType = 'file',
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  onVideoChange,
  onTypeChange,
  className
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAddVideo = () => {
    if (videoType === 'file') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            onVideoChange(result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  if (!videoUrl) {
    return (
      <div
        className={cn("w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border", className)}
        onClick={handleAddVideo}
      >
        <Icon name="Video" size={48} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Добавьте видео</p>
      </div>
    );
  }

  if (videoType === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    if (embedUrl) {
      return (
        <div className={cn("w-full aspect-video", className)}>
          <iframe
            src={`${embedUrl}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}`}
            className="w-full h-full rounded-lg"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (videoType === 'vimeo') {
    const embedUrl = getVimeoEmbedUrl(videoUrl);
    if (embedUrl) {
      return (
        <div className={cn("w-full aspect-video", className)}>
          <iframe
            src={`${embedUrl}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}`}
            className="w-full h-full rounded-lg"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      );
    }
  }

  return (
    <div className={cn("relative w-full aspect-video", className)}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full rounded-lg"
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};


