import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={140} className="text-primary" />
        </button>
        
        <nav className="hidden md:flex gap-8">
          <a href="/capabilities" className="text-sm font-medium hover:text-primary transition-colors">Возможности</a>
          <a href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Тарифы</a>
          <a href="/marketplace-landing" className="text-sm font-medium hover:text-primary transition-colors">Маркетплейс</a>
          <a href="/community" className="text-sm font-medium hover:text-primary transition-colors">Сообщество</a>
          <a href="/support" className="text-sm font-medium hover:text-primary transition-colors">Поддержка</a>
        </nav>
        
        <div className="flex gap-3 items-center">
          {user ? (
            <Button onClick={() => navigate('/dashboard')}>Личный кабинет</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Войти</Button>
              <Button onClick={() => navigate('/register')}>Начать бесплатно</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};