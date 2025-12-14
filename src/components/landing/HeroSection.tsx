import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative px-6 py-32 text-center overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="inline-block mb-6 animate-fade-in">
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
            🚀 Запустите бизнес за 24 часа
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
          Запусти и автоматизируй<br />
          <span className="bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent animate-gradient">
            свой бизнес за один день
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards'}}>
          Все инструменты для создания сайтов, ботов, продвижения и обучения в одной платформе. 
          <span className="text-foreground font-semibold"> Без кода. Без сложностей.</span>
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap mb-16 animate-fade-in" style={{animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards'}}>
          <Button 
            size="lg" 
            className="text-lg px-8 py-7 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all hover:scale-105" 
            onClick={() => navigate('/register')}
          >
            <Logo size={140} className="mr-2" />
            Запустить бизнес
          </Button>
          <Button 
            size="lg" 
            className="text-lg px-8 py-7 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all hover:scale-105" 
            onClick={() => navigate('/register')}
          >
            <Icon name="Code" className="mr-2" size={22} />
            Создать цифровой продукт
          </Button>
        </div>

        <div className="flex justify-center gap-16 flex-wrap text-center animate-fade-in" style={{animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards'}}>
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="Sparkles" size={32} className="text-primary" />
            </div>
            <div className="font-semibold text-lg">AI-помощники</div>
            <p className="text-sm text-muted-foreground max-w-[150px]">Умные ассистенты на каждом шаге</p>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="Layers" size={32} className="text-secondary" />
            </div>
            <div className="font-semibold text-lg">Все в одном</div>
            <p className="text-sm text-muted-foreground max-w-[150px]">Единая экосистема для бизнеса</p>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="Award" size={32} className="text-purple-600" />
            </div>
            <div className="font-semibold text-lg">Профессионализм</div>
            <p className="text-sm text-muted-foreground max-w-[150px]">Результат как у агентств</p>
          </div>
        </div>
      </div>
    </section>
  );
};