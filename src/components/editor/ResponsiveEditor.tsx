import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { 
  Breakpoint, 
  ResponsiveStyles, 
  BREAKPOINTS, 
  getDeviceFromBreakpoint, 
  getBreakpointStyles, 
  updateDeviceStyles,
  setDeviceVisibility,
  isHiddenOnDevice
} from '@/utils/responsiveUtils';

interface ResponsiveEditorProps {
  styles: Record<string, unknown>;
  responsiveStyles?: ResponsiveStyles;
  currentBreakpoint: Breakpoint;
  onStylesChange: (styles: Record<string, unknown>) => void;
  onResponsiveStylesChange: (responsiveStyles: ResponsiveStyles) => void;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
}

export { Breakpoint, ResponsiveStyles };

export const ResponsiveEditor = ({
  styles,
  responsiveStyles = {},
  currentBreakpoint,
  onStylesChange,
  onResponsiveStylesChange,
  onBreakpointChange
}: ResponsiveEditorProps) => {
  const [localStyles, setLocalStyles] = useState<Record<string, unknown>>(styles || {});
  const [hideOnDevices, setHideOnDevices] = useState({
    desktop: isHiddenOnDevice(styles, 'desktop'),
    tablet: isHiddenOnDevice(styles, 'tablet'),
    mobile: isHiddenOnDevice(styles, 'mobile')
  });

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

  const getCurrentDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    return getDeviceFromBreakpoint(currentBreakpoint);
  };

  const updateStyle = (key: string, value: unknown) => {
    const newStyles = { ...localStyles, [key]: value };
    setLocalStyles(newStyles);
    onStylesChange(newStyles);

    const device = getCurrentDevice();
    const newResponsiveStyles = updateDeviceStyles(responsiveStyles, device, { [key]: value });
    onResponsiveStylesChange(newResponsiveStyles);
  };

  const getStyleValue = (key: string, defaultValue: string = '') => {
    const deviceStyles = getBreakpointStyles(responsiveStyles, currentBreakpoint);
    return (deviceStyles[key] as string) || (localStyles[key] as string) || defaultValue;
  };

  const handleHideOnDevice = (device: 'desktop' | 'tablet' | 'mobile', hidden: boolean) => {
    const newHideOnDevices = { ...hideOnDevices, [device]: hidden };
    setHideOnDevices(newHideOnDevices);
    
    const newStyles = setDeviceVisibility(localStyles, device, hidden);
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold mb-3 block">Брейкпоинты</Label>
        <div className="grid grid-cols-2 gap-2">
          {BREAKPOINTS.filter(bp => bp.value !== 'custom').map((bp) => (
            <Button
              key={bp.value}
              type="button"
              variant={currentBreakpoint === bp.value ? 'default' : 'outline'}
              size="sm"
              className="text-xs justify-start"
              onClick={() => onBreakpointChange(bp.value)}
            >
              <Icon name={bp.device === 'desktop' ? 'Monitor' : bp.device === 'tablet' ? 'Tablet' : 'Smartphone'} size={14} className="mr-2" />
              {bp.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Видимость на устройствах</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Monitor" size={14} />
              <Label className="text-xs">Скрыть на Desktop</Label>
            </div>
            <Switch
              checked={hideOnDevices.desktop}
              onCheckedChange={(checked) => handleHideOnDevice('desktop', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Tablet" size={14} />
              <Label className="text-xs">Скрыть на Tablet</Label>
            </div>
            <Switch
              checked={hideOnDevices.tablet}
              onCheckedChange={(checked) => handleHideOnDevice('tablet', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Smartphone" size={14} />
              <Label className="text-xs">Скрыть на Mobile</Label>
            </div>
            <Switch
              checked={hideOnDevices.mobile}
              onCheckedChange={(checked) => handleHideOnDevice('mobile', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Адаптивные отступы</Label>
        <Tabs defaultValue="padding" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="padding" className="text-xs">Padding</TabsTrigger>
            <TabsTrigger value="margin" className="text-xs">Margin</TabsTrigger>
          </TabsList>
          <TabsContent value="padding" className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Top</Label>
                <Input
                  type="text"
                  value={getStyleValue('paddingTop', '0px')}
                  onChange={(e) => updateStyle('paddingTop', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Right</Label>
                <Input
                  type="text"
                  value={getStyleValue('paddingRight', '0px')}
                  onChange={(e) => updateStyle('paddingRight', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Bottom</Label>
                <Input
                  type="text"
                  value={getStyleValue('paddingBottom', '0px')}
                  onChange={(e) => updateStyle('paddingBottom', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Left</Label>
                <Input
                  type="text"
                  value={getStyleValue('paddingLeft', '0px')}
                  onChange={(e) => updateStyle('paddingLeft', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="margin" className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Top</Label>
                <Input
                  type="text"
                  value={getStyleValue('marginTop', '0px')}
                  onChange={(e) => updateStyle('marginTop', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Right</Label>
                <Input
                  type="text"
                  value={getStyleValue('marginRight', '0px')}
                  onChange={(e) => updateStyle('marginRight', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Bottom</Label>
                <Input
                  type="text"
                  value={getStyleValue('marginBottom', '0px')}
                  onChange={(e) => updateStyle('marginBottom', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Left</Label>
                <Input
                  type="text"
                  value={getStyleValue('marginLeft', '0px')}
                  onChange={(e) => updateStyle('marginLeft', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Адаптивные размеры</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs mb-1 block">Ширина</Label>
            <Input
              type="text"
              value={getStyleValue('width', 'auto')}
              onChange={(e) => updateStyle('width', e.target.value)}
              placeholder="auto"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Высота</Label>
            <Input
              type="text"
              value={getStyleValue('height', 'auto')}
              onChange={(e) => updateStyle('height', e.target.value)}
              placeholder="auto"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Адаптивная типографика</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs mb-1 block">Размер шрифта</Label>
            <Input
              type="text"
              value={getStyleValue('fontSize', '16px')}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              placeholder="16px"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Высота строки</Label>
            <Input
              type="text"
              value={getStyleValue('lineHeight', '1.5')}
              onChange={(e) => updateStyle('lineHeight', e.target.value)}
              placeholder="1.5"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Межбуквенное расстояние</Label>
            <Input
              type="text"
              value={getStyleValue('letterSpacing', '0px')}
              onChange={(e) => updateStyle('letterSpacing', e.target.value)}
              placeholder="0px"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

