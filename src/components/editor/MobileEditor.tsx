import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTouchGestures } from '@/hooks/useTouchGestures';

interface MobileEditorProps {
  leftPanelContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
  canvasContent: React.ReactNode;
  onLeftPanelToggle?: (open: boolean) => void;
  onRightPanelToggle?: (open: boolean) => void;
}

export const MobileEditor = ({
  leftPanelContent,
  rightPanelContent,
  canvasContent,
  onLeftPanelToggle,
  onRightPanelToggle
}: MobileEditorProps) => {
  const isMobile = useIsMobile();
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  useEffect(() => {
    if (onLeftPanelToggle) {
      onLeftPanelToggle(leftPanelOpen);
    }
  }, [leftPanelOpen, onLeftPanelToggle]);

  useEffect(() => {
    if (onRightPanelToggle) {
      onRightPanelToggle(rightPanelOpen);
    }
  }, [rightPanelOpen, onRightPanelToggle]);

  const touchGestures = useTouchGestures({
    onSwipeRight: () => {
      if (!leftPanelOpen) {
        setLeftPanelOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (leftPanelOpen) {
        setLeftPanelOpen(false);
      }
      if (rightPanelOpen) {
        setRightPanelOpen(false);
      }
    }
  });

  if (!isMobile) {
    return <>{canvasContent}</>;
  }

  return (
    <div className="h-full flex flex-col relative" {...touchGestures}>
      <div className="flex-1 overflow-hidden relative">
        {canvasContent}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
              variant="default"
            >
              <Icon name="Layout" size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Блоки и слои</h3>
            </div>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4">
                {leftPanelContent}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
              variant="default"
            >
              <Icon name="Settings" size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Свойства</h3>
            </div>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4">
                {rightPanelContent}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

