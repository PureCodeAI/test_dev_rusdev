export interface Template {
  id: string;
  name: string;
  category: 'landing' | 'blog' | 'shop' | 'portfolio' | 'custom';
  description: string;
  previewImage?: string;
  thumbnail?: string;
  blocks: Array<Record<string, unknown>>;
  pages?: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
  authorId?: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface SectionTemplate {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'contact' | 'about' | 'custom';
  description: string;
  previewImage?: string;
  blocks: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
  authorId?: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface BlockTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  previewImage?: string;
  block: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  authorId?: number;
  isPublic?: boolean;
  tags?: string[];
}

export type TemplateCategory = 'landing' | 'blog' | 'shop' | 'portfolio' | 'custom';
export type SectionType = 'hero' | 'features' | 'testimonials' | 'pricing' | 'contact' | 'about' | 'custom';

