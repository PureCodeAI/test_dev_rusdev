/**
 * Утилиты для работы с шаблонами
 * Функции для фильтрации, поиска и работы с шаблонами
 */

import { Template, SectionTemplate, TemplateCategory } from '@/types/template.types';

/**
 * Фильтрация шаблонов по категории
 */
export const filterTemplatesByCategory = (
  templates: Template[],
  category: TemplateCategory | 'all'
): Template[] => {
  if (category === 'all') {
    return templates;
  }
  return templates.filter(template => template.category === category);
};

/**
 * Поиск шаблонов по запросу
 */
export const searchTemplates = (
  templates: Template[],
  query: string
): Template[] => {
  if (!query.trim()) {
    return templates;
  }

  const lowerQuery = query.toLowerCase();
  return templates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    (template.tags && template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
};

/**
 * Поиск секций по запросу
 */
export const searchSections = (
  sections: SectionTemplate[],
  query: string
): SectionTemplate[] => {
  if (!query.trim()) {
    return sections;
  }

  const lowerQuery = query.toLowerCase();
  return sections.filter(section =>
    section.name.toLowerCase().includes(lowerQuery) ||
    section.description.toLowerCase().includes(lowerQuery) ||
    section.type.toLowerCase().includes(lowerQuery) ||
    (section.tags && section.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
};

/**
 * Комбинированная фильтрация и поиск шаблонов
 */
export const filterAndSearchTemplates = (
  templates: Template[],
  category: TemplateCategory | 'all',
  query: string
): Template[] => {
  const filtered = filterTemplatesByCategory(templates, category);
  return searchTemplates(filtered, query);
};

/**
 * Создание нового шаблона
 */
export const createTemplate = (
  name: string,
  blocks: Array<Record<string, unknown>>,
  category: TemplateCategory = 'custom',
  description: string = '',
  authorId?: number
): Template => {
  return {
    id: `template-${Date.now()}`,
    name,
    category,
    description,
    blocks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId,
    isPublic: false
  };
};

/**
 * Создание новой секции
 */
export const createSection = (
  name: string,
  blocks: Array<Record<string, unknown>>,
  type: SectionTemplate['type'] = 'custom',
  description: string = '',
  authorId?: number
): SectionTemplate => {
  return {
    id: `section-${Date.now()}`,
    name,
    type,
    description,
    blocks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId,
    isPublic: false
  };
};

/**
 * Валидация шаблона
 */
export const validateTemplate = (template: Template): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!template.id) {
    errors.push('ID шаблона обязателен');
  }

  if (!template.name || template.name.trim() === '') {
    errors.push('Название шаблона обязательно');
  }

  if (!template.blocks || !Array.isArray(template.blocks)) {
    errors.push('Блоки шаблона должны быть массивом');
  }

  if (template.blocks && template.blocks.length === 0) {
    errors.push('Шаблон должен содержать хотя бы один блок');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Валидация секции
 */
export const validateSection = (section: SectionTemplate): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!section.id) {
    errors.push('ID секции обязателен');
  }

  if (!section.name || section.name.trim() === '') {
    errors.push('Название секции обязательно');
  }

  if (!section.blocks || !Array.isArray(section.blocks)) {
    errors.push('Блоки секции должны быть массивом');
  }

  if (section.blocks && section.blocks.length === 0) {
    errors.push('Секция должна содержать хотя бы один блок');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Обновление шаблона
 */
export const updateTemplate = (
  template: Template,
  updates: Partial<Template>
): Template => {
  return {
    ...template,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Обновление секции
 */
export const updateSection = (
  section: SectionTemplate,
  updates: Partial<SectionTemplate>
): SectionTemplate => {
  return {
    ...section,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Клонирование шаблона
 */
export const cloneTemplate = (template: Template): Template => {
  return {
    ...template,
    id: `template-${Date.now()}`,
    name: `${template.name} (копия)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Клонирование секции
 */
export const cloneSection = (section: SectionTemplate): SectionTemplate => {
  return {
    ...section,
    id: `section-${Date.now()}`,
    name: `${section.name} (копия)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Получение категорий из шаблонов
 */
export const getTemplateCategories = (templates: Template[]): TemplateCategory[] => {
  const categories = new Set<TemplateCategory>();
  templates.forEach(template => {
    categories.add(template.category);
  });
  return Array.from(categories);
};

/**
 * Подсчет шаблонов по категориям
 */
export const countTemplatesByCategory = (templates: Template[]): Record<TemplateCategory, number> => {
  const counts: Record<string, number> = {
    landing: 0,
    blog: 0,
    shop: 0,
    portfolio: 0,
    custom: 0
  };

  templates.forEach(template => {
    counts[template.category] = (counts[template.category] || 0) + 1;
  });

  return counts as Record<TemplateCategory, number>;
};

