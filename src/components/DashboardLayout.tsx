import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const menuItems = [
    { icon: 'LayoutDashboard', label: 'Дашборд', path: '/dashboard' },
    { icon: 'Globe', label: 'Конструктор сайтов', path: '/editor/site/new' },
    { icon: 'Bot', label: 'Конструктор ботов', path: '/editor/bot/new' },
    { icon: 'Megaphone', label: 'Реклама', path: '/dashboard/ads' },
    { icon: 'ShoppingBag', label: 'Товары', path: '/dashboard/products', disabled: true, badge: 'В доработке' },
    { icon: 'TrendingUp', label: 'Статистика', path: '/dashboard/statistics' },
    { icon: 'GraduationCap', label: 'Академия бизнеса', path: '/university' },
    { icon: 'Briefcase', label: 'Биржа', path: '/exchange' },
    { icon: 'Store', label: 'Маркетплейс', path: '/marketplace' },
    { icon: 'Settings', label: 'Настройки', path: '/dashboard/settings' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size={140} className="text-sidebar-primary" />
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.path} className="relative">
                <Button
                  variant="ghost"
                  disabled={item.disabled}
                  className={`w-full justify-start ${
                    isActive(item.path)
                      ? 'text-sidebar-foreground bg-sidebar-accent'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !item.disabled && navigate(item.path)}
                >
                  <Icon name={item.icon} className="mr-3" size={20} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </div>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t border-sidebar-border">
          <div className="p-6 pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {user?.fullName || 'Пользователь'}
                </div>
                <div className="text-xs text-sidebar-foreground/60">
                  {user?.userType === 'entrepreneur' ? 'Предприниматель' : 'Фрилансер'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground"
                onClick={() => {
                  setUser(null);
                  navigate('/login');
                }}
              >
                <Icon name="LogOut" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;