import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

const ReportViolation = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    violationType: '',
    description: '',
    url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Спасибо',
      description: 'Ваше сообщение отправлено. Мы рассмотрим его в ближайшее время.',
    });
    setFormData({ email: '', violationType: '', description: '', url: '' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-3xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Сообщить о нарушении</h1>
            <p className="text-xl text-slate-600">
              Если вы обнаружили нарушение правил использования платформы, сообщите нам
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Форма обращения</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Ваш email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="violationType">Тип нарушения</Label>
                  <select
                    id="violationType"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={formData.violationType}
                    onChange={(e) => setFormData({ ...formData, violationType: e.target.value })}
                    required
                  >
                    <option value="">Выберите тип нарушения</option>
                    <option value="spam">Спам</option>
                    <option value="fraud">Мошенничество</option>
                    <option value="copyright">Нарушение авторских прав</option>
                    <option value="abuse">Оскорбления</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="url">Ссылка на нарушение (если есть)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание нарушения</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    required
                    placeholder="Опишите подробно, что произошло..."
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Отправить сообщение
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReportViolation;


