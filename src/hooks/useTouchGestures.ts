import { useRef, useCallback } from 'react';

interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
}

interface UseTouchGesturesOptions extends TouchGestureHandlers {
  threshold?: number; // минимальное расстояние для свайпа (px)
  longPressDelay?: number; // задержка для long press (ms)
  doubleTapDelay?: number; // задержка между тапами для double tap (ms)
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onLongPress,
  onDoubleTap,
  threshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300
}: UseTouchGesturesOptions) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialDistanceRef = useRef<number | null>(null);

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          if (onLongPress) {
            onLongPress();
          }
        }, longPressDelay);
      }
    } else if (e.touches.length === 2 && onPinch) {
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
    }
  }, [onLongPress, onPinch, longPressDelay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (e.touches.length === 2 && onPinch && initialDistanceRef.current !== null) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistanceRef.current;
      onPinch(scale);
    }
  }, [onPinch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (e.changedTouches.length === 1 && touchStartRef.current) {
      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      if (touchStartRef.current && touchEndRef.current) {
        const dx = touchEndRef.current.x - touchStartRef.current.x;
        const dy = touchEndRef.current.y - touchStartRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const timeDiff = touchEndRef.current.time - touchStartRef.current.time;

        if (distance < 10 && timeDiff < 200) {
          const currentTime = Date.now();
          const timeSinceLastTap = currentTime - lastTapRef.current;
          
          if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
            onDoubleTap();
            lastTapRef.current = 0;
          } else {
            lastTapRef.current = currentTime;
          }
        } else if (distance > threshold && timeDiff < 300) {
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx > absDy) {
            if (dx > 0 && onSwipeRight) {
              onSwipeRight();
            } else if (dx < 0 && onSwipeLeft) {
              onSwipeLeft();
            }
          } else {
            if (dy > 0 && onSwipeDown) {
              onSwipeDown();
            } else if (dy < 0 && onSwipeUp) {
              onSwipeUp();
            }
          }
        }
      }

      touchStartRef.current = null;
      touchEndRef.current = null;
    }

    if (e.touches.length === 0) {
      initialDistanceRef.current = null;
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, threshold, doubleTapDelay]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

