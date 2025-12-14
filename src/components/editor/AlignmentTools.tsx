import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface AlignmentToolsProps {
  selectedBlockIds: number[];
  onAlign: (alignment: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void;
  onDistribute: (direction: 'horizontal' | 'vertical' | 'spacing') => void;
  disabled?: boolean;
}

export const AlignmentTools = ({ 
  selectedBlockIds, 
  onAlign, 
  onDistribute,
  disabled = false 
}: AlignmentToolsProps) => {
  const canAlign = selectedBlockIds.length > 1;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold mb-3 block">Выравнивание</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs mb-1 block">По горизонтали</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAlign('left')}
                disabled={!canAlign || disabled}
                title="Выровнять по левому краю"
              >
                <Icon name="AlignLeft" size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAlign('center')}
                disabled={!canAlign || disabled}
                title="Выровнять по центру"
              >
                <Icon name="AlignCenter" size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAlign('right')}
                disabled={!canAlign || disabled}
                title="Выровнять по правому краю"
              >
                <Icon name="AlignRight" size={16} />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">По вертикали</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAlign('top')}
                disabled={!canAlign || disabled}
                title="Выровнять по верху"
              >
                <Icon name="AlignStartVertical" size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAlign('middle')}
                disabled={!canAlign || disabled}
                title="Выровнять по центру (вертикально)"
              >
                <Icon name="AlignCenterVertical" size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAlign('bottom')}
                disabled={!canAlign || disabled}
                title="Выровнять по низу"
              >
                <Icon name="AlignEndVertical" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-3 block">Распределение</Label>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onDistribute('horizontal')}
            disabled={!canAlign || disabled}
          >
            <Icon name="AlignCenterHorizontal" size={16} className="mr-2" />
            Распределить по горизонтали
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onDistribute('vertical')}
            disabled={!canAlign || disabled}
          >
            <Icon name="AlignCenterVertical" size={16} className="mr-2" />
            Распределить по вертикали
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onDistribute('spacing')}
            disabled={!canAlign || disabled}
          >
            <Icon name="Space" size={16} className="mr-2" />
            Равные промежутки
          </Button>
        </div>
      </div>
    </div>
  );
};

