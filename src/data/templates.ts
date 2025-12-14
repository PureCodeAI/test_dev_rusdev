import { Template, SectionTemplate } from '@/types/template.types';

export const defaultTemplates: Template[] = [
  {
    id: 'landing-1',
    name: 'Лендинг - Современный',
    category: 'landing',
    description: 'Современный лендинг с hero секцией, features и pricing',
    previewImage: '/templates/landing-1.jpg',
    blocks: [
      {
        id: 1,
        type: 'hero',
        content: {
          title: 'Добро пожаловать',
          text: 'Создайте свой идеальный сайт с нашим конструктором',
          buttonText: 'Начать',
          buttonLink: '#'
        },
        styles: {
          backgroundColor: '#ffffff',
          padding: '80px 20px',
          textAlign: 'center'
        },
        position: 0
      },
      {
        id: 2,
        type: 'features',
        content: {
          title: 'Наши возможности',
          items: [
            { title: 'Быстро', description: 'Создайте сайт за минуты' },
            { title: 'Просто', description: 'Интуитивный интерфейс' },
            { title: 'Гибко', description: 'Полная кастомизация' }
          ]
        },
        styles: {
          backgroundColor: '#f8f9fa',
          padding: '60px 20px'
        },
        position: 1
      },
      {
        id: 3,
        type: 'pricing',
        content: {
          title: 'Тарифы',
          plans: [
            { name: 'Базовый', price: '0', features: ['1 сайт', 'Базовые блоки'] },
            { name: 'Про', price: '29', features: ['5 сайтов', 'Все блоки', 'Поддержка'] }
          ]
        },
        styles: {
          backgroundColor: '#ffffff',
          padding: '60px 20px'
        },
        position: 2
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['landing', 'modern', 'responsive']
  },
  {
    id: 'blog-1',
    name: 'Блог - Классический',
    category: 'blog',
    description: 'Классический блог с сайдбаром и списком постов',
    previewImage: '/templates/blog-1.jpg',
    blocks: [
      {
        id: 1,
        type: 'header',
        content: {
          logo: 'Блог',
          menuItems: [
            { label: 'Главная', link: '/' },
            { label: 'О нас', link: '/about' },
            { label: 'Контакты', link: '/contact' }
          ]
        },
        styles: {
          backgroundColor: '#ffffff',
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        },
        position: 0
      },
      {
        id: 2,
        type: 'text',
        content: {
          title: 'Последние посты',
          text: 'Здесь будут отображаться ваши посты'
        },
        styles: {
          padding: '40px 20px'
        },
        position: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['blog', 'classic', 'sidebar']
  },
  {
    id: 'shop-1',
    name: 'Магазин - E-commerce',
    category: 'shop',
    description: 'Полнофункциональный интернет-магазин',
    previewImage: '/templates/shop-1.jpg',
    blocks: [
      {
        id: 1,
        type: 'header',
        content: {
          logo: 'Магазин',
          menuItems: [
            { label: 'Каталог', link: '/catalog' },
            { label: 'Корзина', link: '/cart' }
          ]
        },
        styles: {
          backgroundColor: '#ffffff',
          padding: '20px'
        },
        position: 0
      },
      {
        id: 2,
        type: 'product-catalog',
        content: {
          title: 'Наши товары',
          products: []
        },
        styles: {
          padding: '40px 20px'
        },
        position: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['shop', 'ecommerce', 'catalog']
  },
  {
    id: 'portfolio-1',
    name: 'Портфолио - Креативный',
    category: 'portfolio',
    description: 'Креативное портфолио для дизайнеров и фотографов',
    previewImage: '/templates/portfolio-1.jpg',
    blocks: [
      {
        id: 1,
        type: 'hero',
        content: {
          title: 'Мое портфолио',
          text: 'Добро пожаловать в мой творческий мир'
        },
        styles: {
          backgroundColor: '#000000',
          color: '#ffffff',
          padding: '100px 20px',
          textAlign: 'center'
        },
        position: 0
      },
      {
        id: 2,
        type: 'image-gallery',
        content: {
          title: 'Мои работы',
          images: []
        },
        styles: {
          padding: '60px 20px'
        },
        position: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['portfolio', 'creative', 'gallery']
  }
];

export const defaultSectionTemplates: SectionTemplate[] = [
  {
    id: 'hero-1',
    name: 'Hero - Центрированный',
    type: 'hero',
    description: 'Hero секция с заголовком, текстом и кнопкой по центру',
    blocks: [
      {
        id: 1,
        type: 'hero',
        content: {
          title: 'Заголовок',
          text: 'Описание',
          buttonText: 'Кнопка',
          buttonLink: '#'
        },
        styles: {
          backgroundColor: '#ffffff',
          padding: '80px 20px',
          textAlign: 'center'
        },
        position: 0
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['hero', 'centered']
  },
  {
    id: 'features-1',
    name: 'Features - 3 колонки',
    type: 'features',
    description: 'Секция с тремя колонками возможностей',
    blocks: [
      {
        id: 1,
        type: 'text',
        content: {
          title: 'Наши возможности',
          text: ''
        },
        styles: {
          textAlign: 'center',
          padding: '40px 20px 20px'
        },
        position: 0
      },
      {
        id: 2,
        type: 'row',
        content: {
          columns: 3
        },
        styles: {
          padding: '20px'
        },
        position: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['features', 'columns']
  },
  {
    id: 'testimonials-1',
    name: 'Testimonials - Отзывы',
    type: 'testimonials',
    description: 'Секция с отзывами клиентов',
    blocks: [
      {
        id: 1,
        type: 'text',
        content: {
          title: 'Отзывы клиентов',
          text: ''
        },
        styles: {
          textAlign: 'center',
          padding: '40px 20px 20px'
        },
        position: 0
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['testimonials', 'reviews']
  },
  {
    id: 'pricing-1',
    name: 'Pricing - Тарифы',
    type: 'pricing',
    description: 'Секция с тарифными планами',
    blocks: [
      {
        id: 1,
        type: 'pricing-table',
        content: {
          title: 'Выберите план',
          plans: [
            { name: 'Базовый', price: '0', features: [] },
            { name: 'Про', price: '29', features: [] }
          ]
        },
        styles: {
          padding: '60px 20px'
        },
        position: 0
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['pricing', 'plans']
  }
];

