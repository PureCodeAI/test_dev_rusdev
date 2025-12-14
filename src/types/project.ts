export interface Project {
  subdomain?: string;
  custom_domain?: string;
  status: 'draft' | 'preview' | 'published' | 'archived';
  environment?: 'draft' | 'preview' | 'published';
  preview_token?: string;
  preview_expires_at?: string;
  preview_url?: string;
  published_url?: string;
  published_version?: string;
  published_at?: string;
}
