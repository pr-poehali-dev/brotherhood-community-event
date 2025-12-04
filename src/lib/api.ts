const API_URLS = {
  applications: 'https://functions.poehali.dev/db9be44c-9ce5-42cf-a70f-3d9b69d120a5',
  settings: 'https://functions.poehali.dev/a018e69c-254e-44b1-9bd0-b4c8f1919b1d',
  twitchAuth: 'https://functions.poehali.dev/35bd66da-9a49-480c-9da8-8cb437dd8b3b',
};

export interface Application {
  id?: number;
  name: string;
  contact: string;
  twitch_link?: string;
  about?: string;
  status?: string;
  twitch_user?: {
    id?: string;
    display_name?: string;
    profile_image_url?: string;
    email?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface EventSettings {
  event_name: string;
  event_slogan?: string;
  event_date?: string;
  event_location?: string;
  organizer_name?: string;
  organizer_contact?: string;
  program_data?: any;
  about_content?: string;
}

export const api = {
  async getApplications(status?: string) {
    const url = status 
      ? `${API_URLS.applications}?status=${status}`
      : API_URLS.applications;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  async getApplication(id: number) {
    const response = await fetch(`${API_URLS.applications}?id=${id}`);
    if (!response.ok) throw new Error('Failed to fetch application');
    return response.json();
  },

  async createApplication(data: Application) {
    const response = await fetch(API_URLS.applications, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create application');
    return response.json();
  },

  async updateApplication(id: number, data: Partial<Application>) {
    const response = await fetch(API_URLS.applications, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error('Failed to update application');
    return response.json();
  },

  async getSettings() {
    const response = await fetch(API_URLS.settings);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(data: Partial<EventSettings>) {
    const response = await fetch(API_URLS.settings, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  async getTwitchAuthUrl() {
    const response = await fetch(`${API_URLS.twitchAuth}?action=login`);
    if (!response.ok) throw new Error('Failed to get Twitch auth URL');
    return response.json();
  },

  async getTwitchUser(code: string) {
    const response = await fetch(`${API_URLS.twitchAuth}?action=callback&code=${code}`);
    if (!response.ok) throw new Error('Failed to get Twitch user');
    return response.json();
  },
};
