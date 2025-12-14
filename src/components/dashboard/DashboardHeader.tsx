import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DashboardHeaderProps {
  userName: string;
  notifications: Array<{ text: string; time: string; icon: string; }>;
}

export const DashboardHeader = ({
  userName,
  notifications
}: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-border p-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Добро пожаловать, {userName}! 👋</h1>
          <p className="text-muted-foreground">Управляйте своим бизнесом в одном месте</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск..." className="pl-10 w-64" />
          </div>
          <Button variant="outline" size="icon" className="relative">
            <Icon name="Bell" size={20} />
            {notifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center" variant="destructive">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
