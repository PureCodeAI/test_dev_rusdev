import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';

interface DashboardSidebarProps {
  userName: string;
  userType: 'entrepreneur' | 'freelancer';
  balance: number;
  onNavigate: (path: string) => void;
}

export const DashboardSidebar = ({
  userName,
  userType,
  balance,
  onNavigate
}: DashboardSidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <button onClick={() => onNavigate('/dashboard')} className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <Logo size={140} className="text-primary" />
        </button>

        <button onClick={() => onNavigate('/dashboard/settings')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
            ИП
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold">{userName}</div>
            <div className="text-xs text-muted-foreground">{userType === 'entrepreneur' ? 'Предприниматель' : 'Фрилансер'}</div>
          </div>
        </button>

        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Баланс</div>
          <div className="text-2xl font-bold mb-2">₽{balance.toLocaleString()}</div>
          <Button size="sm" className="w-full" onClick={() => onNavigate('/dashboard/settings?tab=balance')}>
            <Icon name="Plus" size={14} className="mr-1" />
            Пополнить
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">ОСНОВНОЕ</div>
        <Button variant="ghost" className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20">
          <Icon name="LayoutDashboard" className="mr-3" size={18} />
          Главная
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/editor/site/new')}>
          <Icon name="Globe" className="mr-3" size={18} />
          Мои проекты
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/dashboard/ads')}>
          <Icon name="Megaphone" className="mr-3" size={18} />
          Реклама и продвижение
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/dashboard/products')}>
          <Icon name="ShoppingBag" className="mr-3" size={18} />
          Мои товары
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/dashboard/statistics')}>
          <Icon name="BarChart3" className="mr-3" size={18} />
          Статистика
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/dashboard/domains')}>
          <Icon name="Globe" className="mr-3" size={18} />
          Домены и хостинг
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/university')}>
          <Icon name="GraduationCap" className="mr-3" size={18} />
          Академия бизнеса
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/dashboard/ai-chat')}>
          <Icon name="MessageSquare" className="mr-3" size={18} />
          Чат с ИИ
        </Button>

        {userType === 'freelancer' && (
          <>
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 mt-4">БИРЖА</div>
            <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/exchange')}>
              <Icon name="Briefcase" className="mr-3" size={18} />
              Заказы
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/exchange/my-services')}>
              <Icon name="Package" className="mr-3" size={18} />
              Мои услуги
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/exchange/deals')}>
              <Icon name="HandshakeIcon" className="mr-3" size={18} />
              Сделки
            </Button>
          </>
        )}

        <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 mt-4">МАРКЕТПЛЕЙС</div>
        <Button 
          variant="ghost" 
          disabled 
          className="w-full justify-start opacity-50 cursor-not-allowed" 
          onClick={() => {}}
        >
          <Icon name="Store" className="mr-3" size={18} />
          <span className="flex-1 text-left">Магазин</span>
          <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
            В доработке
          </span>
        </Button>
        <Button 
          variant="ghost" 
          disabled 
          className="w-full justify-start opacity-50 cursor-not-allowed" 
          onClick={() => {}}
        >
          <Icon name="ShoppingBag" className="mr-3" size={18} />
          <span className="flex-1 text-left">Мои товары</span>
          <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
            В доработке
          </span>
        </Button>
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => onNavigate('/dashboard/settings')}>
          <Icon name="Settings" className="mr-3" size={18} />
          Настройки
        </Button>
      </div>
    </aside>
  );
};
