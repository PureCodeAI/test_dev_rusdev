import { Template } from '@/types/template.types';

export interface ExportData {
  projectName: string;
  pages: Array<{
    id: number;
    name: string;
    path: string;
    blocks: Array<Record<string, unknown>>;
  }>;
  settings: Record<string, unknown>;
  version: string;
  exportedAt: string;
}

export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

export const exportToHTML = (data: ExportData): string => {
  const htmlBlocks = data.pages.flatMap(page => 
    page.blocks.map(block => generateBlockHTML(block))
  ).join('\n');

  const css = generateCSS(data);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.projectName}</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${htmlBlocks}
</body>
</html>`;
};

const generateBlockHTML = (block: Record<string, unknown>): string => {
  const type = block.type as string;
  const content = block.content as Record<string, unknown>;
  const styles = block.styles as Record<string, unknown>;
  const id = block.id as number;

  const styleString = Object.entries(styles || {})
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');

  switch (type) {
    case 'hero':
      return `
        <section class="block-hero" data-block-id="${id}" style="${styleString}">
          <h1>${content.title || ''}</h1>
          <p>${content.text || ''}</p>
          ${content.buttonText ? `<a href="${content.buttonLink || '#'}" class="btn">${content.buttonText}</a>` : ''}
        </section>
      `;
    
    case 'text':
      return `
        <section class="block-text" data-block-id="${id}" style="${styleString}">
          <h2>${content.title || ''}</h2>
          <p>${content.text || ''}</p>
        </section>
      `;
    
    case 'image':
      return `
        <section class="block-image" data-block-id="${id}" style="${styleString}">
          ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.alt || ''}" />` : ''}
        </section>
      `;
    
    case 'button':
      return `
        <section class="block-button" data-block-id="${id}" style="${styleString}">
          <a href="${content.link || '#'}" class="btn">${content.text || 'Кнопка'}</a>
        </section>
      `;
    
    case 'header':
      return `
        <header class="block-header" data-block-id="${id}" style="${styleString}">
          <div class="logo">${content.logo || 'Логотип'}</div>
          <nav>
            ${Array.isArray(content.menuItems) ? (content.menuItems as Array<{label: string; link: string}>).map(item => 
              `<a href="${item.link}">${item.label}</a>`
            ).join('') : ''}
          </nav>
        </header>
      `;
    
    case 'footer':
      return `
        <footer class="block-footer" data-block-id="${id}" style="${styleString}">
          ${content.text || 'Footer'}
        </footer>
      `;
    
    default:
      return `
        <section class="block-${type}" data-block-id="${id}" style="${styleString}">
          ${JSON.stringify(content)}
        </section>
      `;
  }
};

const generateCSS = (data: ExportData): string => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .block-hero {
      text-align: center;
      padding: 80px 20px;
    }
    
    .block-hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .block-text {
      padding: 40px 20px;
    }
    
    .block-image {
      padding: 20px;
    }
    
    .block-image img {
      max-width: 100%;
      height: auto;
    }
    
    .block-button {
      padding: 20px;
      text-align: center;
    }
    
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .btn:hover {
      background-color: #0056b3;
    }
    
    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background-color: #f8f9fa;
    }
    
    .block-header nav {
      display: flex;
      gap: 20px;
    }
    
    .block-header nav a {
      text-decoration: none;
      color: #333;
    }
    
    .block-footer {
      padding: 40px 20px;
      background-color: #f8f9fa;
      text-align: center;
    }
  `;
};

export const exportTemplate = (template: Template): string => {
  return JSON.stringify(template, null, 2);
};

export const exportImages = (blocks: Array<Record<string, unknown>>): Array<{url: string; name: string}> => {
  const images: Array<{url: string; name: string}> = [];
  
  blocks.forEach(block => {
    const content = block.content as Record<string, unknown>;
    
    if (content.imageUrl) {
      images.push({
        url: content.imageUrl as string,
        name: `image-${block.id}.jpg`
      });
    }
    
    if (Array.isArray(content.images)) {
      (content.images as Array<{url: string}>).forEach((img, index) => {
        if (img.url) {
          images.push({
            url: img.url,
            name: `image-${block.id}-${index}.jpg`
          });
        }
      });
    }
  });
  
  return images;
};

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface ZipExportOptions {
  includeImages?: boolean;
  includeCSS?: boolean;
  includeJS?: boolean;
  includeSitemap?: boolean;
  includeRobots?: boolean;
  includeReadme?: boolean;
}

const loadJSZip = async (): Promise<typeof import('jszip')> => {
  try {
    return await import('jszip');
  } catch {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(script);
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        if (window.JSZip) {
          resolve(window.JSZip as typeof import('jszip'));
        } else {
          reject(new Error('JSZip не загружен'));
        }
      };
      script.onerror = () => reject(new Error('Ошибка загрузки JSZip'));
    });
  }
};

export const exportToZIP = async (
  data: ExportData,
  options: ZipExportOptions = {}
): Promise<Blob> => {
  const {
    includeImages = true,
    includeCSS = true,
    includeJS = true,
    includeSitemap = true,
    includeRobots = true,
    includeReadme = true
  } = options;

  try {
    const JSZipModule = await loadJSZip();
    const JSZip = JSZipModule.default;
    const zip = new JSZip();

    const html = exportToHTML(data);
    zip.file('index.html', html);

    if (includeCSS) {
      const css = generateCSS(data);
      zip.folder('assets')?.folder('css')?.file('main.css', css);
    }

    if (includeJS) {
      zip.folder('assets')?.folder('js')?.file('main.js', '');
    }

    if (includeImages) {
      const images = exportImages(data.pages.flatMap(page => page.blocks));
      const imagesFolder = zip.folder('assets')?.folder('images');
      
      for (const image of images) {
        try {
          const response = await fetch(image.url);
          if (response.ok) {
            const blob = await response.blob();
            imagesFolder?.file(image.name, blob);
          }
        } catch (error) {
          console.warn(`Не удалось загрузить изображение ${image.url}:`, error);
        }
      }
    }

    if (includeSitemap) {
      const sitemap = generateSitemap(data);
      zip.file('sitemap.xml', sitemap);
    }

    if (includeRobots) {
      const robots = generateRobots();
      zip.file('robots.txt', robots);
    }

    if (includeReadme) {
      const readme = generateReadme(data);
      zip.file('README.txt', readme);
    }

    return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  } catch (error) {
    throw new Error(`Ошибка создания ZIP архива: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const generateSitemap = (data: ExportData): string => {
  const urls = data.pages.map(page => {
    const path = page.path === '/' ? '' : page.path;
    return `  <url>
    <loc>https://example.com${path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

const generateRobots = (): string => {
  return `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml`;
};

const generateReadme = (data: ExportData): string => {
  return `ИНСТРУКЦИЯ ПО ЗАГРУЗКЕ САЙТА
=====================================

Название проекта: ${data.projectName}
Дата экспорта: ${new Date(data.exportedAt).toLocaleString('ru-RU')}
Версия: ${data.version}

СТРУКТУРА АРХИВА:
-----------------
site-export.zip
├── index.html          - Главная страница сайта
├── assets/
│   ├── css/
│   │   └── main.css   - Стили сайта
│   ├── js/
│   │   └── main.js    - JavaScript файлы
│   └── images/        - Изображения сайта
├── sitemap.xml         - Карта сайта для поисковых систем
├── robots.txt          - Инструкции для поисковых роботов
└── README.txt          - Этот файл

ОБЩИЕ ИНСТРУКЦИИ ПО ЗАГРУЗКЕ:
-----------------------------

1. Распакуйте архив в папку на вашем компьютере

2. Войдите в панель управления вашего хостинга

3. Откройте файловый менеджер

4. Найдите корневую папку вашего сайта:
   - Timeweb: public_html
   - Reg.ru: www
   - Beget: public_html
   - Другие хостинги: обычно public_html или www

5. Загрузите все файлы из архива в корневую папку сайта

6. Убедитесь, что файл index.html находится в корне

7. Проверьте права доступа:
   - Папки: 755
   - Файлы: 644

8. Откройте ваш сайт в браузере для проверки

ЗАГРУЗКА ЧЕРЕЗ FTP/SFTP:
------------------------

1. Используйте FTP клиент (FileZilla, WinSCP и т.д.)

2. Подключитесь к вашему хостингу используя FTP данные

3. Перейдите в корневую папку сайта (public_html или www)

4. Загрузите все файлы из архива

5. Убедитесь, что структура папок сохранена

НАСТРОЙКА ДОМЕНА:
-----------------

1. Убедитесь, что домен привязан к хостингу

2. Проверьте DNS записи:
   - A запись должна указывать на IP сервера
   - CNAME для www поддомена (если используется)

3. Дождитесь распространения DNS (обычно 24-48 часов)

ПРОВЕРКА РАБОТЫ САЙТА:
---------------------

1. Откройте ваш сайт в браузере

2. Проверьте, что все страницы загружаются

3. Проверьте, что изображения отображаются

4. Проверьте, что стили применяются корректно

5. Проверьте работу форм и интерактивных элементов

ПОДДЕРЖКА:
----------

Если у вас возникли проблемы с загрузкой сайта, обратитесь в поддержку вашего хостинга.

Дата создания: ${new Date().toLocaleString('ru-RU')}
`;
};

export const downloadZIP = async (
  data: ExportData,
  filename: string = 'site-export.zip',
  options?: ZipExportOptions
): Promise<void> => {
  try {
    const zipBlob = await exportToZIP(data, options);
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Ошибка скачивания ZIP архива: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export interface WordPressTheme {
  name: string;
  description: string;
  version: string;
  author: string;
  textDomain: string;
}

export const exportToWordPress = (data: ExportData, theme: WordPressTheme = {
  name: data.projectName,
  description: `Тема WordPress для ${data.projectName}`,
  version: '1.0.0',
  author: 'Site Constructor',
  textDomain: data.projectName.toLowerCase().replace(/\s+/g, '-')
}): { styleCSS: string; indexPHP: string; functionsPHP: string } => {
  const themeName = theme.name;
  const textDomain = theme.textDomain;

  const styleCSS = `/*
Theme Name: ${themeName}
Theme URI: 
Author: ${theme.author}
Author URI: 
Description: ${theme.description}
Version: ${theme.version}
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: ${textDomain}
Tags: custom, responsive, modern
*/

${generateCSS(data)}`;

  const htmlBlocks = data.pages.flatMap(page => 
    page.blocks.map(block => generateBlockHTML(block))
  ).join('\n');

  const indexPHP = `<?php
/**
 * The main template file
 *
 * @package ${themeName}
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main">
    <?php
    ${htmlBlocks.split('\n').map(line => `    echo '${line.replace(/'/g, "\\'")}';`).join('\n')}
    ?>
</main>

<?php
get_footer();
?>`;

  const functionsPHP = `<?php
/**
 * ${themeName} functions and definitions
 *
 * @package ${themeName}
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function ${textDomain}_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
}
add_action('after_setup_theme', '${textDomain}_setup');

function ${textDomain}_scripts() {
    wp_enqueue_style('${textDomain}-style', get_stylesheet_uri(), array(), '${theme.version}');
    wp_enqueue_script('${textDomain}-script', get_template_directory_uri() . '/assets/js/main.js', array(), '${theme.version}', true);
}
add_action('wp_enqueue_scripts', '${textDomain}_scripts');

function ${textDomain}_register_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', '${textDomain}'),
        'footer' => __('Footer Menu', '${textDomain}'),
    ));
}
add_action('init', '${textDomain}_register_menus');
?>`;

  return {
    styleCSS,
    indexPHP,
    functionsPHP
  };
};

export const exportWordPressTheme = async (
  data: ExportData,
  theme?: WordPressTheme
): Promise<Blob> => {
  try {
    const JSZipModule = await loadJSZip();
    const JSZip = JSZipModule.default;
    const zip = new JSZip();

    const wpTheme = exportToWordPress(data, theme);
    const themeFolder = zip.folder(`${data.projectName.toLowerCase().replace(/\s+/g, '-')}-theme`);

    if (themeFolder) {
      themeFolder.file('style.css', wpTheme.styleCSS);
      themeFolder.file('index.php', wpTheme.indexPHP);
      themeFolder.file('functions.php', wpTheme.functionsPHP);

      const css = generateCSS(data);
      themeFolder.folder('assets')?.folder('css')?.file('main.css', css);
      themeFolder.folder('assets')?.folder('js')?.file('main.js', '');

      const images = exportImages(data.pages.flatMap(page => page.blocks));
      const imagesFolder = themeFolder.folder('assets')?.folder('images');
      
      for (const image of images) {
        try {
          const response = await fetch(image.url);
          if (response.ok) {
            const blob = await response.blob();
            imagesFolder?.file(image.name, blob);
          }
        } catch (error) {
          console.warn(`Не удалось загрузить изображение ${image.url}:`, error);
        }
      }

      themeFolder.folder('template-parts')?.file('.gitkeep', '');
    }

    return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  } catch (error) {
    throw new Error(`Ошибка создания WordPress темы: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const downloadWordPressTheme = async (
  data: ExportData,
  filename: string = 'wordpress-theme.zip',
  theme?: WordPressTheme
): Promise<void> => {
  try {
    const zipBlob = await exportWordPressTheme(data, theme);
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Ошибка скачивания WordPress темы: ${error instanceof Error ? error.message : String(error)}`);
  }
};

