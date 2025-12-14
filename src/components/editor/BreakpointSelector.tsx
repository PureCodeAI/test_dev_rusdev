import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { Breakpoint } from './ResponsiveEditor';

interface BreakpointSelectorProps {
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  onResizeViewport: (width: number) => void;
}

const BREAKPOINTS: Array<{ value: Breakpoint; label: string; width: number; icon: string }> = [
  { value: 'desktop-1920', label: 'Desktop 1920px', width: 1920, icon: 'Monitor' },
  { value: 'desktop-1440', label: 'Desktop 1440px', width: 1440, icon: 'Monitor' },
  { value: 'desktop-1280', label: 'Desktop 1280px', width: 1280, icon: 'Monitor' },
  { value: 'tablet-1024', label: 'Tablet 1024px', width: 1024, icon: 'Tablet' },
  { value: 'tablet-768', label: 'Tablet 768px', width: 768, icon: 'Tablet' },
  { value: 'mobile-480', label: 'Mobile 480px', width: 480, icon: 'Smartphone' },
  { value: 'mobile-375', label: 'Mobile 375px', width: 375, icon: 'Smartphone' }
];

export const BreakpointSelector = ({
  currentBreakpoint,
  onBreakpointChange,
  onResizeViewport
}: BreakpointSelectorProps) => {
  const current = BREAKPOINTS.find(bp => bp.value === currentBreakpoint) || BREAKPOINTS[0];

  const handleBreakpointChange = (breakpoint: Breakpoint) => {
    const bp = BREAKPOINTS.find(b => b.value === breakpoint);
    if (bp) {
      onBreakpointChange(breakpoint);
      onResizeViewport(bp.width);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Icon name={current.icon as any} size={16} />
          <span className="text-xs">{current.label}</span>
          <Icon name="ChevronDown" size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <div className="text-xs font-semibold mb-2">Выберите брейкпоинт</div>
          {BREAKPOINTS.map((bp) => (
            <Button
              key={bp.value}
              type="button"
              variant={currentBreakpoint === bp.value ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleBreakpointChange(bp.value)}
            >
              <Icon name={bp.icon as any} size={14} className="mr-2" />
              {bp.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

