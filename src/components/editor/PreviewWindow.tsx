import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PreviewWindowProps {
  isOpen: boolean;
  previewUrl?: string;
  onClose: () => void;
}

export const PreviewWindow = ({ isOpen, previewUrl, onClose }: PreviewWindowProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && previewUrl) {
      setIsLoading(true);
    }
  }, [isOpen, previewUrl]);

  if (!previewUrl) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Icon name="Eye" size={16} />
              <span className="font-semibold">Предпросмотр</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <Icon name="ExternalLink" size={14} className="mr-1" />
                Открыть в новой вкладке
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          </div>
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Loader2" size={24} className="animate-spin" />
                  <span className="text-sm text-muted-foreground">Загрузка предпросмотра...</span>
                </div>
              </div>
            )}
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              title="Preview"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

