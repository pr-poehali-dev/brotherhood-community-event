import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

export default function Admin() {
  const [applications, setApplications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    event_name: '',
    event_slogan: '',
    event_date: '',
    event_location: '',
    organizer_name: '',
    organizer_contact: '',
    about_content: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    loadApplications();
    loadSettings();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data.applications || []);
    } catch (error) {
      toast.error('Ошибка загрузки заявок');
      console.error(error);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Ошибка загрузки настроек');
      console.error(error);
    }
  };

  const handleUpdateSettings = async () => {
    setIsLoading(true);
    try {
      await api.updateSettings(settings);
      toast.success('Настройки сохранены!');
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (id: number, status: string) => {
    try {
      await api.updateApplication(id, { status });
      toast.success('Статус обновлен');
      loadApplications();
    } catch (error) {
      toast.error('Ошибка обновления статуса');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      new: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      approved: 'bg-green-500/20 text-green-500 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-500 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
    };
    const labels: any = {
      new: 'Новая',
      approved: 'Одобрена',
      rejected: 'Отклонена',
      pending: 'В ожидании'
    };
    return <Badge className={colors[status] || ''}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-black text-gradient mb-2">
              Админ-панель 42 БРАТУХ
            </h1>
            <p className="text-muted-foreground">Управление мероприятием и заявками</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Icon name="Home" className="mr-2" />
            На сайт
          </Button>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="applications">
              <Icon name="Users" className="mr-2" size={18} />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="event">
              <Icon name="Calendar" className="mr-2" size={18} />
              Мероприятие
            </TabsTrigger>
            <TabsTrigger value="organizer">
              <Icon name="Crown" className="mr-2" size={18} />
              Организатор
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold">Список заявок</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadApplications()}>
                    <Icon name="RefreshCw" className="mr-2" size={16} />
                    Обновить
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Контакт</TableHead>
                      <TableHead>Twitch</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {app.twitch_avatar_url && (
                              <img src={app.twitch_avatar_url} alt={app.name} className="w-8 h-8 rounded-full" />
                            )}
                            {app.name}
                          </div>
                        </TableCell>
                        <TableCell>{app.contact}</TableCell>
                        <TableCell>
                          {app.twitch_display_name ? (
                            <span className="text-primary">{app.twitch_display_name}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {new Date(app.created_at).toLocaleDateString('ru')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {app.status === 'new' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'approved')}
                                >
                                  <Icon name="Check" size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                >
                                  <Icon name="X" size={16} />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApp(app)}
                            >
                              <Icon name="Eye" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {selectedApp && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading font-bold">Детали заявки #{selectedApp.id}</h3>
                  <Button variant="ghost" onClick={() => setSelectedApp(null)}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Имя</Label>
                    <p className="text-lg font-medium">{selectedApp.name}</p>
                  </div>
                  <div>
                    <Label>Контакт</Label>
                    <p className="text-lg">{selectedApp.contact}</p>
                  </div>
                  {selectedApp.twitch_link && (
                    <div>
                      <Label>Twitch канал</Label>
                      <a href={`https://${selectedApp.twitch_link}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedApp.twitch_link}
                      </a>
                    </div>
                  )}
                  {selectedApp.about && (
                    <div>
                      <Label>О себе</Label>
                      <p className="text-muted-foreground">{selectedApp.about}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="event" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-heading font-bold mb-6">Настройки мероприятия</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event_name">Название мероприятия</Label>
                  <Input
                    id="event_name"
                    value={settings.event_name}
                    onChange={(e) => setSettings({...settings, event_name: e.target.value})}
                    placeholder="42 БРАТУХ"
                  />
                </div>

                <div>
                  <Label htmlFor="event_slogan">Слоган</Label>
                  <Input
                    id="event_slogan"
                    value={settings.event_slogan || ''}
                    onChange={(e) => setSettings({...settings, event_slogan: e.target.value})}
                    placeholder="Братская тусовка стримеров"
                  />
                </div>

                <div>
                  <Label htmlFor="event_date">Дата мероприятия</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={settings.event_date ? new Date(settings.event_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setSettings({...settings, event_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="event_location">Место проведения</Label>
                  <Input
                    id="event_location"
                    value={settings.event_location || ''}
                    onChange={(e) => setSettings({...settings, event_location: e.target.value})}
                    placeholder="Москва, ул. Примерная 42"
                  />
                </div>

                <div>
                  <Label htmlFor="about_content">О мероприятии</Label>
                  <Textarea
                    id="about_content"
                    value={settings.about_content || ''}
                    onChange={(e) => setSettings({...settings, about_content: e.target.value})}
                    placeholder="Описание мероприятия"
                    className="min-h-[120px]"
                  />
                </div>

                <Button onClick={handleUpdateSettings} disabled={isLoading} className="w-full">
                  {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="organizer" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-heading font-bold mb-6">Информация об организаторе</h2>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-bold mb-1">Важно!</p>
                    <p className="text-sm text-muted-foreground">
                      Если поле "Название организатора" не заполнено, на сайте будет отображаться 
                      красный текст <span className="text-destructive font-bold">НЕ НАСТРОЕНО</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="organizer_name">Название организатора *</Label>
                  <Input
                    id="organizer_name"
                    value={settings.organizer_name || ''}
                    onChange={(e) => setSettings({...settings, organizer_name: e.target.value})}
                    placeholder="Иван Иванов / Студия XYZ"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Это имя будет отображаться на главной странице
                  </p>
                </div>

                <div>
                  <Label htmlFor="organizer_contact">Контакт организатора</Label>
                  <Input
                    id="organizer_contact"
                    value={settings.organizer_contact || ''}
                    onChange={(e) => setSettings({...settings, organizer_contact: e.target.value})}
                    placeholder="@telegram или email@example.com"
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-sm font-bold mb-2">Превью на сайте:</p>
                  <div className="bg-background rounded p-3">
                    <p className="text-sm text-muted-foreground mb-1">Организатор:</p>
                    {settings.organizer_name ? (
                      <p className="font-bold">{settings.organizer_name}</p>
                    ) : (
                      <p className="text-destructive font-black">НЕ НАСТРОЕНО</p>
                    )}
                  </div>
                </div>

                <Button onClick={handleUpdateSettings} disabled={isLoading} className="w-full">
                  {isLoading ? 'Сохранение...' : 'Сохранить данные организатора'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
