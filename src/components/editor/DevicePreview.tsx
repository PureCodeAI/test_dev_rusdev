import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Device {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;
}

const DEVICES: Device[] = [
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', width: 393, height: 852, type: 'mobile', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, type: 'mobile', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15' },
  { id: 'samsung-galaxy-s21', name: 'Samsung Galaxy S21', width: 360, height: 800, type: 'mobile', userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36' },
  { id: 'ipad-pro', name: 'iPad Pro', width: 1024, height: 1366, type: 'tablet', userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15' },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, type: 'tablet', userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15' },
  { id: 'macbook-pro', name: 'MacBook Pro', width: 1440, height: 900, type: 'desktop' },
  { id: 'imac', name: 'iMac', width: 1920, height: 1080, type: 'desktop' },
  { id: 'desktop-1920', name: 'Desktop 1920x1080', width: 1920, height: 1080, type: 'desktop' },
  { id: 'desktop-1366', name: 'Desktop 1366x768', width: 1366, height: 768, type: 'desktop' },
];

interface DevicePreviewProps {
  previewUrl: string;
  onDeviceChange?: (device: Device) => void;
}

export const DevicePreview = ({ previewUrl, onDeviceChange }: DevicePreviewProps) => {
  const [selectedDevice, setSelectedDevice] = useState<Device>(DEVICES[0]);
  const [isRotated, setIsRotated] = useState(false);
  const [scale, setScale] = useState(1);

  const handleDeviceChange = (deviceId: string) => {
    const device = DEVICES.find(d => d.id === deviceId);
    if (device) {
      setSelectedDevice(device);
      setIsRotated(false);
      if (onDeviceChange) {
        onDeviceChange(device);
      }
    }
  };

  const handleRotate = () => {
    setIsRotated(!isRotated);
  };

  const getFrameDimensions = () => {
    if (isRotated) {
      return {
        width: selectedDevice.height,
        height: selectedDevice.width
      };
    }
    return {
      width: selectedDevice.width,
      height: selectedDevice.height
    };
  };

  const frameDimensions = getFrameDimensions();
  const maxWidth = window.innerWidth - 100;
  const maxHeight = window.innerHeight - 200;
  const scaleX = maxWidth / frameDimensions.width;
  const scaleY = maxHeight / frameDimensions.height;
  const autoScale = Math.min(scaleX, scaleY, 1);

  const finalScale = scale * autoScale;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedDevice.id} onValueChange={handleDeviceChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile" disabled>Мобильные</SelectItem>
              {DEVICES.filter(d => d.type === 'mobile').map(device => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} ({device.width}x{device.height})
                </SelectItem>
              ))}
              <SelectItem value="tablet" disabled>Планшеты</SelectItem>
              {DEVICES.filter(d => d.type === 'tablet').map(device => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} ({device.width}x{device.height})
                </SelectItem>
              ))}
              <SelectItem value="desktop" disabled>Десктопы</SelectItem>
              {DEVICES.filter(d => d.type === 'desktop').map(device => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} ({device.width}x{device.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">
            {frameDimensions.width} × {frameDimensions.height}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {selectedDevice.type === 'mobile' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <Icon name={isRotated ? "RotateCcw" : "RotateCw"} size={16} className="mr-2" />
              {isRotated ? 'Портрет' : 'Альбом'}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.max(0.25, scale - 0.25))}
              disabled={scale <= 0.25}
            >
              <Icon name="Minus" size={16} />
            </Button>
            <span className="text-sm w-16 text-center">{Math.round(finalScale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.min(2, scale + 0.25))}
              disabled={scale >= 2}
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-start bg-muted/50 p-8 rounded-lg overflow-auto" style={{ minHeight: '600px' }}>
        <div
          className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{
            width: `${frameDimensions.width}px`,
            height: `${frameDimensions.height}px`,
            transform: `scale(${finalScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.3s ease'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 flex items-center justify-center gap-2 z-10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-white font-medium">{selectedDevice.name}</span>
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            style={{
              marginTop: '32px',
              height: `calc(100% - 32px)`
            }}
            title={`Preview on ${selectedDevice.name}`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        </div>
      </div>
    </div>
  );
};

