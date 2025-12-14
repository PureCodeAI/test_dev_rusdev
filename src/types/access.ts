// Типы для системы ролей и прав доступа

export type RoleName = 'owner' | 'admin' | 'moderator' | 'consultant' | 'support' | 'user';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
  users_count?: number;
  permissions_count?: number;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  category: string;
  description: string;
  has_permission?: boolean;
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  role: Role;
  assigned_by?: number;
  created_at: string;
}

export interface UserPermission {
  user_id: number;
  permission_id: number;
  permission: Permission;
  granted: boolean;
  granted_by?: number;
  created_at: string;
}

// Маппинг страниц на права доступа
export const PAGE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'dashboard.view',
  '/dashboard/ads': 'ads.view',
  '/dashboard/products': 'products.view',
  '/dashboard/statistics': 'statistics.view',
  '/dashboard/ai-chat': 'ai.chat',
  '/dashboard/settings': 'settings.view',
  '/dashboard/domains': 'domains.view',
  '/editor/site/:id': 'projects.edit',
  '/editor/bot/:id': 'bots.edit',
  '/university': 'academy.view',
  '/university/onboarding': 'academy.view',
  '/exchange': 'exchange.view',
  '/marketplace': 'marketplace.view',
  '/admin': 'admin.view',
};

// Маппинг функций на права доступа
export const FEATURE_PERMISSIONS: Record<string, string> = {
  'ai-chat-universal': 'ai.chat',
  'ai-chat-site': 'ai.chat',
  'ai-chat-ads': 'ai.chat',
  'ai-chat-accountant': 'ai.chat.accountant',
  'bot-editor': 'bots.edit',
  'site-editor': 'projects.edit',
  'ads-create': 'ads.create',
  'ads-edit': 'ads.edit',
  'products-create': 'products.create',
  'products-edit': 'products.edit',
  'statistics-view': 'statistics.view',
  'exchange-trade': 'exchange.trade',
  'marketplace-buy': 'marketplace.buy',
  'marketplace-sell': 'marketplace.sell',
  'admin-users': 'admin.users',
  'admin-roles': 'admin.roles',
  'admin-settings': 'admin.settings',
};

// Категории прав доступа
export const PERMISSION_CATEGORIES = {
  dashboard: 'Личный кабинет',
  projects: 'Проекты',
  bots: 'Боты',
  ads: 'Реклама',
  products: 'Товары',
  statistics: 'Статистика',
  ai: 'AI функции',
  academy: 'Академия',
  exchange: 'Биржа',
  marketplace: 'Маркетплейс',
  domains: 'Домены',
  settings: 'Настройки',
  admin: 'Администрирование',
  users: 'Пользователи',
  content: 'Контент',
  finance: 'Финансы',
  system: 'Система',
} as const;

