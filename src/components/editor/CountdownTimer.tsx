import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string;
  onTargetDateChange: (date: string) => void;
  className?: string;
}

export const CountdownTimer = ({ targetDate, onTargetDateChange, className }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTargetDateChange(e.target.value);
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">До окончания акции осталось:</h3>
        <div className="mb-4">
          <input
            type="datetime-local"
            value={targetDate || ''}
            onChange={handleDateChange}
            className="px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-sm text-muted-foreground">Дней</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-sm text-muted-foreground">Часов</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-sm text-muted-foreground">Минут</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-sm text-muted-foreground">Секунд</div>
        </div>
      </div>
    </Card>
  );
};

