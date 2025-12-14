/**
 * Типы для блоков
 * Интерфейсы и типы для работы с блоками редактора
 */

export type BlockType = 
  | 'hero' | 'text' | 'heading-h1' | 'heading-h2' | 'heading-h3' | 'paragraph' | 'quote'
  | 'list-bullet' | 'list-number' | 'divider' | 'spacer' | 'code' | 'html' | 'iframe'
  | 'alert' | 'callout' | 'timeline' | 'steps' | 'image' | 'gallery' | 'video' | 'audio'
  | 'button' | 'link' | 'form' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio'
  | 'header' | 'footer' | 'navigation' | 'sidebar' | 'breadcrumbs' | 'section' | 'container'
  | 'row' | 'column' | 'flex-container' | 'grid-container' | 'wrapper' | 'card' | 'accordion'
  | 'tabs' | 'modal' | 'drawer' | 'lightbox' | 'map' | 'calendar' | 'countdown' | 'pricing'
  | 'testimonials' | 'team' | 'faq' | 'blog' | 'shop' | 'product' | 'cart' | 'checkout'
  | 'custom';

export type BlockCategory = 
  | 'Контент' | 'Медиа' | 'Формы' | 'Навигация' | 'Структура' | 'Интерактив'
  | 'Коммерция' | 'Интеграции' | 'Другое';

export interface BlockDefinition {
  id: string;
  name: string;
  type: BlockType;
  category: BlockCategory;
  icon: string;
  color?: string;
  description?: string;
  defaultContent?: Record<string, unknown>;
  defaultStyles?: Record<string, unknown>;
  allowedChildren?: BlockType[];
  requiredProps?: string[];
  optionalProps?: string[];
}

export interface Block {
  id: number;
  type: BlockType;
  name?: string;
  content: Record<string, unknown>;
  styles: Record<string, unknown>;
  responsiveStyles?: Record<string, Record<string, unknown>>;
  animation?: {
    type?: string;
    delay?: number;
    duration?: number;
    threshold?: number;
  };
  hoverEffects?: {
    scale?: number;
    shadow?: boolean;
    colorChange?: string;
  };
  integrations?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
  parentId?: number;
  children?: Block[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BlockContent {
  [key: string]: unknown;
}

export interface BlockStyles {
  [key: string]: string | number;
}

export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface BlockBounds {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BlockSelection {
  blockId: number;
  isSelected: boolean;
  isMultiSelected: boolean;
  bounds?: BlockBounds;
}

export interface BlockDragItem {
  blockId: number;
  blockIndex: number;
  blockType: BlockType;
  blockName: string;
}

export interface BlockDropResult {
  blockId: number;
  targetIndex: number;
  position: 'before' | 'after' | 'inside';
}

export interface BlockAction {
  type: 'create' | 'update' | 'delete' | 'duplicate' | 'move' | 'copy' | 'paste';
  blockId: number;
  data?: Partial<Block>;
  targetIndex?: number;
  direction?: 'up' | 'down';
}

export interface BlockGroup {
  id: number;
  name: string;
  blocks: Block[];
  styles?: Record<string, unknown>;
  locked?: boolean;
  visible?: boolean;
}

