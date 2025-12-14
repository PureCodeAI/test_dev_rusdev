import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface MapBlockProps {
  mapType: 'google' | 'yandex';
  center: { lat: number; lng: number };
  zoom: number;
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
  }>;
  onMapTypeChange: (type: 'google' | 'yandex') => void;
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onZoomChange: (zoom: number) => void;
  onMarkersChange: (markers: Array<{ id: string; lat: number; lng: number; title: string; description?: string }>) => void;
  className?: string;
}

export const MapBlock = ({
  mapType,
  center,
  zoom,
  markers,
  onMapTypeChange,
  onCenterChange,
  onZoomChange,
  onMarkersChange,
  className
}: MapBlockProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const handleAddMarker = () => {
    const newMarker = {
      id: `marker-${Date.now()}`,
      lat: center.lat,
      lng: center.lng,
      title: 'Новая метка',
      description: ''
    };
    onMarkersChange([...markers, newMarker]);
  };

  const handleMarkerChange = (markerId: string, field: string, value: string | number) => {
    onMarkersChange(
      markers.map(marker =>
        marker.id === markerId ? { ...marker, [field]: value } : marker
      )
    );
  };

  const handleRemoveMarker = (markerId: string) => {
    onMarkersChange(markers.filter(marker => marker.id !== markerId));
  };

  const getMapUrl = () => {
    if (mapType === 'google') {
      const markersParam = markers.map(m => `${m.lat},${m.lng}`).join('|');
      return `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${center.lat},${center.lng}&zoom=${zoom}&markers=${markersParam}`;
    } else {
      const markersParam = markers.map(m => `${m.lat},${m.lng}`).join('~');
      return `https://yandex.ru/map-widget/v1/?ll=${center.lng},${center.lat}&z=${zoom}&pt=${markersParam}`;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Тип карты</Label>
          <Select value={mapType} onValueChange={(value) => onMapTypeChange(value as 'google' | 'yandex')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Maps</SelectItem>
              <SelectItem value="yandex">Яндекс Карты</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Масштаб: {zoom}</Label>
          <input
            type="range"
            min="1"
            max="20"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Широта</Label>
          <Input
            type="number"
            value={center.lat}
            onChange={(e) => onCenterChange({ ...center, lat: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Долгота</Label>
          <Input
            type="number"
            value={center.lng}
            onChange={(e) => onCenterChange({ ...center, lng: Number(e.target.value) })}
          />
        </div>
      </div>
      <Card className="p-4">
        <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <Icon name="Map" size={48} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Карта будет отображаться здесь</p>
            <p className="text-xs text-muted-foreground mt-1">Требуется API ключ для {mapType === 'google' ? 'Google Maps' : 'Яндекс Карт'}</p>
          </div>
        </div>
      </Card>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Метки на карте</Label>
          <Button onClick={handleAddMarker} size="sm" variant="outline">
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить метку
          </Button>
        </div>
        {markers.map((marker) => (
          <Card key={marker.id} className="p-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <Label className="text-xs">Широта</Label>
                <Input
                  type="number"
                  value={marker.lat}
                  onChange={(e) => handleMarkerChange(marker.id, 'lat', Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Долгота</Label>
                <Input
                  type="number"
                  value={marker.lng}
                  onChange={(e) => handleMarkerChange(marker.id, 'lng', Number(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>
            <div className="mb-2">
              <Label className="text-xs">Название</Label>
              <Input
                value={marker.title}
                onChange={(e) => handleMarkerChange(marker.id, 'title', e.target.value)}
                className="h-8"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMarker(marker.id)}
              >
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

