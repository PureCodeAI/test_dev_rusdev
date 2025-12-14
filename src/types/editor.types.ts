/**
 * Типы для редактора сайтов
 * Основные интерфейсы и типы для работы редактора
 */

import { Breakpoint, ResponsiveStyles } from '@/utils/responsiveUtils';
import { AnimationType } from '@/components/editor/ScrollAnimation';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

export type EditorMode = 'edit' | 'preview' | 'publish';

export interface EditorState {
  projectName: string;
  isEditingName: boolean;
  viewMode: ViewMode;
  currentBreakpoint: Breakpoint;
  viewportWidth: number | null;
  selectedBlockId: number | null;
  selectedBlockIds: number[];
  pageBlocks: Array<Record<string, unknown>>;
  currentPageId: number | null;
  projectPages: Array<Record<string, unknown>>;
  loading: boolean;
  editingContent: Record<string, unknown>;
  editingStyles: Record<string, unknown>;
  responsiveStyles?: ResponsiveStyles;
  editingAnimation?: {
    type?: AnimationType;
    delay?: number;
    duration?: number;
    threshold?: number;
  };
  editingHoverEffects?: {
    scale?: number;
    shadow?: boolean;
    colorChange?: string;
  };
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  clipboard: Array<Record<string, unknown>> | null;
  autoSaveEnabled: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaveTime: Date | null;
}

export interface EditorSettings {
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
}

export interface EditorActions {
  onBlockDrop: (blockType: string, blockName: string) => void;
  onSelectBlock: (blockId: number, isMultiSelect?: boolean) => void;
  onDeleteBlock: (blockId: number) => void;
  onBlockContentChange: (blockId: number, content: Record<string, unknown>) => void;
  onBlockStylesChange: (blockId: number, styles: Record<string, unknown>) => void;
  onDuplicateBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onCopyBlocks: () => void;
  onPasteBlocks: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export interface EditorHistory {
  past: Array<EditorState>;
  present: EditorState;
  future: Array<EditorState>;
}

export interface EditorProject {
  id: number;
  name: string;
  type: 'site' | 'bot';
  domain?: string;
  status: 'draft' | 'preview' | 'published' | 'archived';
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  preview_url?: string | null;
  published_url?: string | null;
}

export interface EditorPage {
  id: number;
  name: string;
  path: string;
  blocks: Array<Record<string, unknown>>;
  settings?: Record<string, unknown>;
  isHome?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EditorPanel {
  id: string;
  name: string;
  isOpen: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
  width?: number;
  height?: number;
}

