import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function Index() {
  const [applicationCount, setApplicationCount] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const [twitchUser, setTwitchUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    twitchLink: '',
    about: ''
  });

  useEffect(() => {
    loadSettings();
    loadApplicationCount();
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleTwitchCallback(code);
    }
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadApplicationCount = async () => {
    try {
      const data = await api.getApplications();
      setApplicationCount(data.total || 0);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const handleTwitchCallback = async (code: string) => {
    try {
      const data = await api.getTwitchUser(code);
      setTwitchUser(data.user);
      setFormData(prev => ({
        ...prev,
        name: data.user.display_name || data.user.login,
        twitchLink: `twitch.tv/${data.user.login}`
      }));
      toast.success(`Привет, ${data.user.display_name}! 👋`);
      window.history.replaceState({}, '', '/');
    } catch (error) {
      toast.error('Ошибка авторизации через Twitch');
      console.error(error);
    }
  };

  const handleTwitchLogin = async () => {
    try {
      const data = await api.getTwitchAuthUrl();
      window.location.href = data.auth_url;
    } catch (error) {
      toast.error('Ошибка подключения к Twitch');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) {
      toast.error('Заполни имя и контакт, братух!');
      return;
    }
    
    try {
      await api.createApplication({
        name: formData.name,
        contact: formData.contact,
        twitch_link: formData.twitchLink,
        about: formData.about,
        twitch_user: twitchUser
      });
      
      setApplicationCount(prev => prev + 1);
      toast.success('Заявка отправлена в стаю! 🚀');
      setFormData({ name: '', contact: '', twitchLink: '', about: '' });
      setTwitchUser(null);
    } catch (error) {
      toast.error('Ошибка отправки заявки');
      console.error(error);
    }
  };

  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-heading font-black text-gradient">
            42 БРАТУХ
          </div>
          <div className="hidden md:flex gap-6">
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors">О мероприятии</a>
            <a href="#program" className="text-foreground/80 hover:text-foreground transition-colors">Программа</a>
            <a href="#application-form" className="text-foreground/80 hover:text-foreground transition-colors">Подать заявку</a>
          </div>
          <Button onClick={scrollToForm} className="bg-primary hover:bg-primary/90">
            Вступить
          </Button>
        </nav>
      </header>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 text-lg px-4 py-2">
              Ежегодная встреча стрим-коммьюнити
            </Badge>
            <h1 className="text-6xl md:text-8xl font-heading font-black mb-6 text-gradient leading-tight">
              БРАТУХИ<br />СОБИРАЮТСЯ
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Не конкурс. Не премия. Братская тусовка для единомышленников из мира стриминга
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={scrollToForm} className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 animate-glow">
                <Icon name="Rocket" className="mr-2" />
                ПОДАТЬ ЗАЯВКУ НА ВХОД
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                Узнать больше
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3 text-muted-foreground animate-pulse-slow">
              <Icon name="Users" size={24} className="text-primary" />
              <span className="text-2xl font-bold text-foreground">{applicationCount}</span>
              <span>братух уже подали заявку</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/50 border-primary/30 hover-lift">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Heart" className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Братская атмосфера</h3>
              <p className="text-muted-foreground">Никакой формальности — только живое общение и дружеская поддержка</p>
            </Card>

            <Card className="p-6 bg-card/50 border-secondary/30 hover-lift">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Icon name="DoorOpen" className="text-secondary" size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Открытые двери</h3>
              <p className="text-muted-foreground">Любой желающий может подать заявку прямо через сайт</p>
            </Card>

            <Card className="p-6 bg-card/50 border-accent/30 hover-lift">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Wifi" className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Живой нетворкинг</h3>
              <p className="text-muted-foreground">Возможность познакомиться и наладить связи с коллегами</p>
            </Card>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-8 text-center">
            Что такое <span className="text-gradient">42 БРАТУХА</span>?
          </h2>
          <Card className="p-8 bg-card/50">
            <p className="text-lg text-muted-foreground mb-6">
              42 БРАТУХ — это ежегодное неформальное мероприятие русскоязычного стрим-сообщества. 
              Здесь нет конкурсов и соревнований, только братская встреча единомышленников.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-heading font-bold mb-2 flex items-center gap-2">
                  <Icon name="Calendar" className="text-primary" size={20} />
                  Когда
                </h4>
                <p className="text-muted-foreground">Дата будет объявлена позже</p>
              </div>
              <div>
                <h4 className="font-heading font-bold mb-2 flex items-center gap-2">
                  <Icon name="MapPin" className="text-secondary" size={20} />
                  Где
                </h4>
                <p className="text-muted-foreground">Точное место сообщим после одобрения заявки</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 border border-destructive/30">
              <p className="font-bold text-destructive mb-2 flex items-center gap-2">
                <Icon name="AlertCircle" size={20} />
                Организатор:
              </p>
              {settings?.organizer_name ? (
                <p className="font-black text-lg">{settings.organizer_name}</p>
              ) : (
                <p className="text-destructive font-black text-lg">НЕ НАСТРОЕНО</p>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section id="program" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-12 text-center">
            Программа <span className="text-gradient">мероприятия</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: 'Coffee', title: 'Сбор братухи', desc: 'Знакомство, регистрация, первый контакт' },
              { icon: 'Mic2', title: 'Неформальные речи', desc: 'Выступления без строгого регламента' },
              { icon: 'MessageCircle', title: 'Круглый стол', desc: 'Обсуждение трендов и вызовов в стриминге' },
              { icon: 'Gamepad2', title: 'Игровая зона', desc: 'Совместные игры и развлечения' },
              { icon: 'Users', title: 'Свободное общение', desc: 'Нетворкинг и личные беседы' },
              { icon: 'Camera', title: 'Фото/видео зона', desc: 'Совместные фото и контент для соцсетей' },
            ].map((item, i) => (
              <Card key={i} className="p-6 bg-card/50 hover-lift">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon as any} className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="application-form" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
              Подать <span className="text-gradient">заявку</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Заполни форму и попади в братскую стаю стримеров
            </p>
          </div>

          <Card className="p-8 bg-card/50">
            {twitchUser && (
              <div className="mb-6 flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
                <img src={twitchUser.profile_image_url} alt={twitchUser.display_name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-bold">{twitchUser.display_name}</p>
                  <p className="text-sm text-muted-foreground">{twitchUser.email}</p>
                </div>
              </div>
            )}
            
            {!twitchUser && (
              <Button type="button" onClick={handleTwitchLogin} variant="outline" className="w-full mb-6 border-2 border-primary">
                <Icon name="Twitch" className="mr-2" />
                Войти через Twitch
              </Button>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Имя / Никнейм <span className="text-destructive">*</span>
                </label>
                <Input 
                  placeholder="Как к тебе обращаться?" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Контакт (Telegram или Email) <span className="text-destructive">*</span>
                </label>
                <Input 
                  placeholder="@username или email@example.com" 
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ссылка на Twitch-канал
                </label>
                <Input 
                  placeholder="twitch.tv/username" 
                  value={formData.twitchLink}
                  onChange={(e) => setFormData({...formData, twitchLink: e.target.value})}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Пару слов о себе
                </label>
                <Textarea 
                  placeholder="Почему хочешь прийти? Чем занимаешься в стриминге?"
                  value={formData.about}
                  onChange={(e) => setFormData({...formData, about: e.target.value})}
                  className="bg-background min-h-[120px]"
                />
              </div>

              <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                <Icon name="Send" className="mr-2" />
                Отправить заявку в стаю
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-2xl font-heading font-black text-gradient mb-4">42 БРАТУХ</p>
          <p>Ежегодная встреча русскоязычного стрим-сообщества</p>
          <p className="mt-4 text-sm">Сделано с 💜 для братухов</p>
        </div>
      </footer>
    </div>
  );
}