import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InlineEditor } from './InlineEditor';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface StickyNavigationProps {
  logo?: string;
  logoText?: string;
  items: NavItem[];
  onItemsChange: (items: NavItem[]) => void;
  onLogoChange?: (logo: string) => void;
  onLogoTextChange?: (text: string) => void;
  sticky?: boolean;
  className?: string;
}

export const StickyNavigation = ({
  logo,
  logoText,
  items,
  onItemsChange,
  onLogoChange,
  onLogoTextChange,
  sticky = true,
  className
}: StickyNavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  const handleAddItem = () => {
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: 'Пункт меню',
      href: '#'
    };
    onItemsChange([...items, newItem]);
  };

  const handleItemChange = (itemId: string, field: 'label' | 'href', value: string) => {
    onItemsChange(
      items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav
      className={cn(
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
        sticky && isScrolled && "shadow-sm",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8" />
            ) : (
              <InlineEditor
                value={logoText || 'Логотип'}
                onChange={onLogoTextChange || (() => {})}
                placeholder="Логотип"
                className="text-lg font-bold"
                tag="span"
              />
            )}
          </div>
          <div className="flex items-center gap-6">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="text-sm hover:text-primary transition-colors"
              >
                <InlineEditor
                  value={item.label}
                  onChange={(value) => handleItemChange(item.id, 'label', value)}
                  placeholder="Пункт меню"
                  className="inline"
                  tag="span"
                />
              </a>
            ))}
            <Button onClick={handleAddItem} variant="ghost" size="sm">
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

