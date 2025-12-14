import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type AnimationType = 'fadeIn' | 'slideIn' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'rotate' | 'bounce' | 'none';

interface ScrollAnimationProps {
  animationType: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
}

export const ScrollAnimation = ({
  animationType,
  delay = 0,
  duration = 600,
  threshold = 0.1,
  children,
  className
}: ScrollAnimationProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animationType === 'none') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [animationType, delay, threshold]);

  const getAnimationClasses = () => {
    if (!isVisible || animationType === 'none') return '';

    const baseClasses = 'transition-all';
    const animationClasses: Record<AnimationType, string> = {
      fadeIn: 'opacity-0 translate-y-4',
      slideIn: 'opacity-0 translate-y-8',
      slideInLeft: 'opacity-0 -translate-x-8',
      slideInRight: 'opacity-0 translate-x-8',
      zoomIn: 'opacity-0 scale-95',
      rotate: 'opacity-0 rotate-12',
      bounce: 'opacity-0 translate-y-4',
      none: ''
    };

    return animationClasses[animationType] || '';
  };

  const getVisibleClasses = () => {
    if (!isVisible || animationType === 'none') return 'opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0';

    const visibleClasses: Record<AnimationType, string> = {
      fadeIn: 'opacity-100 translate-y-0',
      slideIn: 'opacity-100 translate-y-0',
      slideInLeft: 'opacity-100 translate-x-0',
      slideInRight: 'opacity-100 translate-x-0',
      zoomIn: 'opacity-100 scale-100',
      rotate: 'opacity-100 rotate-0',
      bounce: 'opacity-100 translate-y-0',
      none: ''
    };

    return visibleClasses[animationType] || '';
  };

  const animationStyle: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'ease-out',
    transitionDelay: `${delay}ms`
  };

  return (
    <div
      ref={ref}
      className={cn(
        getAnimationClasses(),
        getVisibleClasses(),
        className
      )}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

