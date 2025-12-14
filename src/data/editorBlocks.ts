export const EDITOR_BLOCKS = [
  // === КОНТЕЙНЕРЫ (6 блоков) ===
  { id: 'section', name: 'Секция', icon: 'Square', category: 'Контейнеры', color: 'indigo', description: 'Секция с фоном и отступами' },
  { id: 'container', name: 'Контейнер', icon: 'Box', category: 'Контейнеры', color: 'indigo', description: 'Ограничение ширины контента' },
  { id: 'row', name: 'Строка', icon: 'Rows', category: 'Контейнеры', color: 'indigo', description: 'Горизонтальный контейнер' },
  { id: 'column', name: 'Колонка', icon: 'Columns', category: 'Контейнеры', color: 'indigo', description: 'Вертикальный контейнер' },
  { id: 'flex-container', name: 'Flex контейнер', icon: 'LayoutGrid', category: 'Контейнеры', color: 'indigo', description: 'Flexbox контейнер' },
  { id: 'grid-container', name: 'Grid контейнер', icon: 'Grid3x3', category: 'Контейнеры', color: 'indigo', description: 'CSS Grid контейнер' },
  { id: 'wrapper', name: 'Обертка', icon: 'Layers', category: 'Контейнеры', color: 'indigo', description: 'Универсальная обертка' },
];

export const EDITOR_CATEGORIES = [
  { name: 'Все', color: 'gray', count: 0 },
  { name: 'Контейнеры', color: 'indigo', count: 7 },
];
