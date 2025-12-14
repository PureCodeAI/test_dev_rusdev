import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface PositionEditorProps {
  styles: Record<string, unknown>;
  onStylesChange: (styles: Record<string, unknown>) => void;
}

export const PositionEditor = ({ styles, onStylesChange }: PositionEditorProps) => {
  const [localStyles, setLocalStyles] = useState<Record<string, unknown>>(styles || {});

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

  const updateStyle = (key: string, value: unknown) => {
    const newStyles = { ...localStyles, [key]: value };
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  const getStyleValue = (key: string, defaultValue: string = '') => {
    return (localStyles[key] as string) || defaultValue;
  };

  const displayValue = getStyleValue('display', 'block');
  const positionValue = getStyleValue('position', 'static');

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-3 block">Display</Label>
          <Select
            value={displayValue}
            onValueChange={(value) => updateStyle('display', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="block">Block</SelectItem>
              <SelectItem value="flex">Flex</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="inline-block">Inline Block</SelectItem>
              <SelectItem value="inline">Inline</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {displayValue === 'flex' && (
          <>
            <Separator />
            <div>
              <Label className="text-xs font-semibold mb-3 block">Flexbox</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-1 block">Направление</Label>
                  <Select
                    value={getStyleValue('flexDirection', 'row')}
                    onValueChange={(value) => updateStyle('flexDirection', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="row">Row (горизонтально)</SelectItem>
                      <SelectItem value="column">Column (вертикально)</SelectItem>
                      <SelectItem value="row-reverse">Row Reverse</SelectItem>
                      <SelectItem value="column-reverse">Column Reverse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Перенос</Label>
                  <Select
                    value={getStyleValue('flexWrap', 'nowrap')}
                    onValueChange={(value) => updateStyle('flexWrap', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nowrap">No Wrap</SelectItem>
                      <SelectItem value="wrap">Wrap</SelectItem>
                      <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Justify Content</Label>
                  <Select
                    value={getStyleValue('justifyContent', 'flex-start')}
                    onValueChange={(value) => updateStyle('justifyContent', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flex-start">Flex Start</SelectItem>
                      <SelectItem value="flex-end">Flex End</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="space-between">Space Between</SelectItem>
                      <SelectItem value="space-around">Space Around</SelectItem>
                      <SelectItem value="space-evenly">Space Evenly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Align Items</Label>
                  <Select
                    value={getStyleValue('alignItems', 'stretch')}
                    onValueChange={(value) => updateStyle('alignItems', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stretch">Stretch</SelectItem>
                      <SelectItem value="flex-start">Flex Start</SelectItem>
                      <SelectItem value="flex-end">Flex End</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="baseline">Baseline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Gap</Label>
                  <Input
                    type="text"
                    value={getStyleValue('gap', '0px')}
                    onChange={(e) => updateStyle('gap', e.target.value)}
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {displayValue === 'grid' && (
          <>
            <Separator />
            <div>
              <Label className="text-xs font-semibold mb-3 block">Grid</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-1 block">Grid Template Columns</Label>
                  <Input
                    type="text"
                    value={getStyleValue('gridTemplateColumns', '1fr')}
                    onChange={(e) => updateStyle('gridTemplateColumns', e.target.value)}
                    placeholder="1fr 1fr 1fr"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Grid Template Rows</Label>
                  <Input
                    type="text"
                    value={getStyleValue('gridTemplateRows', '1fr')}
                    onChange={(e) => updateStyle('gridTemplateRows', e.target.value)}
                    placeholder="1fr 1fr"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Gap</Label>
                  <Input
                    type="text"
                    value={getStyleValue('gap', '0px')}
                    onChange={(e) => updateStyle('gap', e.target.value)}
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Position</Label>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Тип позиционирования</Label>
              <Select
                value={positionValue}
                onValueChange={(value) => updateStyle('position', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="relative">Relative</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="sticky">Sticky</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(positionValue === 'absolute' || positionValue === 'fixed' || positionValue === 'relative' || positionValue === 'sticky') && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Top</Label>
                  <Input
                    type="text"
                    value={getStyleValue('top', 'auto')}
                    onChange={(e) => updateStyle('top', e.target.value)}
                    placeholder="auto"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Right</Label>
                  <Input
                    type="text"
                    value={getStyleValue('right', 'auto')}
                    onChange={(e) => updateStyle('right', e.target.value)}
                    placeholder="auto"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Bottom</Label>
                  <Input
                    type="text"
                    value={getStyleValue('bottom', 'auto')}
                    onChange={(e) => updateStyle('bottom', e.target.value)}
                    placeholder="auto"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Left</Label>
                  <Input
                    type="text"
                    value={getStyleValue('left', 'auto')}
                    onChange={(e) => updateStyle('left', e.target.value)}
                    placeholder="auto"
                  />
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs mb-1 block">Z-Index</Label>
              <Input
                type="number"
                value={getStyleValue('zIndex', 'auto')}
                onChange={(e) => updateStyle('zIndex', e.target.value || 'auto')}
                placeholder="auto"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-3 block">Overflow</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs mb-1 block">Overflow X</Label>
              <Select
                value={getStyleValue('overflowX', 'visible')}
                onValueChange={(value) => updateStyle('overflowX', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="scroll">Scroll</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Overflow Y</Label>
              <Select
                value={getStyleValue('overflowY', 'visible')}
                onValueChange={(value) => updateStyle('overflowY', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="scroll">Scroll</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

