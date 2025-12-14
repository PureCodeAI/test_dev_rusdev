import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const PaymentMethods = () => {
  const methods = [
    {
      name: 'Банковские карты',
      description: 'Visa, MasterCard, МИР',
      icon: 'CreditCard',
      available: true,
    },
    {
      name: 'Электронные кошельки',
      description: 'ЮMoney, Qiwi, WebMoney',
      icon: 'Wallet',
      available: true,
    },
    {
      name: 'Банковский перевод',
      description: 'Перевод с расчетного счета',
      icon: 'Building2',
      available: true,
    },
    {
      name: 'Криптовалюты',
      description: 'Bitcoin, Ethereum, USDT',
      icon: 'Coins',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Способы оплаты</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Удобные и безопасные способы оплаты услуг BizForge
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {methods.map((method, index) => (
              <Card key={index} className={method.available ? '' : 'opacity-60'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name={method.icon} size={24} className="text-primary" />
                      </div>
                      <div>
                        <CardTitle>{method.name}</CardTitle>
                        <CardDescription>{method.description}</CardDescription>
                      </div>
                    </div>
                    {method.available ? (
                      <Icon name="CheckCircle2" size={24} className="text-green-600" />
                    ) : (
                      <span className="text-xs text-slate-500">Скоро</span>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Безопасность платежей</h2>
              <p className="text-slate-600 mb-4">
                Все платежи обрабатываются через защищенные платежные системы с использованием SSL-шифрования.
                Мы не храним данные ваших банковских карт.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icon name="Shield" size={16} className="text-green-600" />
                <span>PCI DSS сертифицировано</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentMethods;


