// Промпты для генерации курсов Академии бизнеса
// Эти промпты будут использоваться в админке для настройки генерации курсов

export interface CoursePrompt {
  id: string;
  title: string;
  prompt: string;
}

export const ACADEMY_COURSE_PROMPTS: CoursePrompt[] = [
  {
    id: 'financial_literacy',
    title: 'Финансовая грамотность для предпринимателя',
    prompt: `Создай курс по финансовой грамотности для {businessType} с оборотом {monthlyRevenue} руб.

**Акцент на:**
1. Учет доходов/расходов для {industry}
2. Налоговое планирование (УСН/Патент/ОСНО)
3. Управление cash flow при обороте {monthlyRevenue}
4. Финансовая отчетность для {employeesCount} сотрудников
5. Инвестиции в развитие {businessType}

**Сложность:** {financialLiteracy}/10, опыт {entrepreneurshipExperience} лет

**Примеры из:** {industry}
**Цель:** решить проблемы: {challenges}`,
  },
  {
    id: 'marketing',
    title: 'Маркетинг и продвижение бизнеса',
    prompt: `Разработай курс по маркетингу для {businessType} в {industry}.

**Фокус на:**
1. Целевая аудитория: {targetAudience}
2. Маркетинг для {businessStage} бизнеса
3. Продвижение в нише {industry}
4. Бюджет маркетинга при обороте {monthlyRevenue}
5. Метрики эффективности для {businessType}

**Формат:** {preferredFormat} контент
**Кейсы:** из {industry} для ЦА {targetAudience}
**Задачи:** достичь целей: {businessGoals}`,
  },
  {
    id: 'team_management',
    title: 'Управление командой и процессы',
    prompt: `Создай курс по управлению для {businessType} с {employeesCount} сотрудниками.

**Темы:**
1. Организация процессов в {industry}
2. Найм и адаптация для {businessType}
3. Мотивация команды на стадии {businessStage}
4. Делегирование при масштабе {employeesCount}
5. Автоматизация процессов в {industry}

**Опыт учёта:** {entrepreneurshipExperience} лет
**Проблемы:** {challenges} в управлении
**Цели:** {businessGoals} через команду`,
  },
  {
    id: 'legal',
    title: 'Правовые основы бизнеса',
    prompt: `Разработай курс по праву для {businessType} в {industry}.

**Ключевые темы:**
1. Выбор формы собственности для {businessType}
2. Договоры и документооборот в {industry}
3. Защита интеллектуальной собственности
4. Трудовое право для {employeesCount} сотрудников
5. Споры и претензии в {industry}

**Стадия:** {businessStage}
**Оборот:** {monthlyRevenue} (налоговые последствия)
**Примеры:** из {industry} для {businessType}`,
  },
  {
    id: 'scaling',
    title: 'Масштабирование и рост бизнеса',
    prompt: `Создай курс по масштабированию для {businessType} на стадии {businessStage}.

**Темы:**
1. Стратегия роста для {industry}
2. Привлечение инвестиций при обороте {monthlyRevenue}
3. Экспансия в новые рынки для {businessType}
4. Оптимизация процессов при {employeesCount} сотрудниках
5. Показатели роста для {industry}

**Цели клиента:** {businessGoals}
**Проблемы:** {challenges}
**Формат обучения:** {preferredFormat}`,
  },
  {
    id: 'digitalization',
    title: 'Цифровизация бизнеса',
    prompt: `Разработай курс по цифровизации для {businessType} в {industry}.

**Фокус на:**
1. Автоматизация процессов для {businessType}
2. CRM и инструменты для {employeesCount} сотрудников
3. Цифровой маркетинг для ЦА {targetAudience}
4. Аналитика и метрики при обороте {monthlyRevenue}
5. Безопасность данных в {industry}

**Стадия:** {businessStage}
**Опыт:** {entrepreneurshipExperience} лет
**Цели:** цифровизация для {businessGoals}`,
  },
  {
    id: 'sales',
    title: 'Продажи и переговоры',
    prompt: `Создай курс по продажам для {businessType} в {industry}.

**Темы:**
1. Воронка продаж для {targetAudience}
2. Скрипты переговоров в {industry}
3. Управление возражениями для {businessType}
4. Ценообразование при обороте {monthlyRevenue}
5. Лояльность клиентов в {industry}

**ЦА:** {targetAudience}
**Стадия:** {businessStage}
**Примеры:** из {industry} для {businessType}`,
  },
  {
    id: 'personal_effectiveness',
    title: 'Личная эффективность предпринимателя',
    prompt: `Разработай курс по личной эффективности для основателя {businessType}.

**Темы:**
1. Тайм-менеджмент при {employeesCount} сотрудниках
2. Принятие решений на стадии {businessStage}
3. Управление стрессом в {industry}
4. Баланс работа/жизнь при обороте {monthlyRevenue}
5. Развитие навыков лидера

**Опыт:** {entrepreneurshipExperience} лет
**Проблемы:** {challenges}
**Цели:** {businessGoals}`,
  },
  {
    id: 'branding',
    title: 'Брендинг и позиционирование',
    prompt: `Создай курс по брендингу для {businessType} в {industry}.

**Фокус на:**
1. УТП для {targetAudience}
2. Айдентика {businessType}
3. Позиционирование в нише {industry}
4. Коммуникация с ЦА {targetAudience}
5. Управление репутацией в {industry}

**Стадия:** {businessStage}
**Конкуренция:** в {industry}
**Цели:** {businessGoals} через бренд`,
  },
  {
    id: 'analytics',
    title: 'Аналитика и метрики бизнеса',
    prompt: `Разработай курс по аналитике для {businessType} с оборотом {monthlyRevenue}.

**Темы:**
1. Ключевые метрики для {industry}
2. Дашборды и отчетность для {businessType}
3. Анализ финансов при {monthlyRevenue}
4. Прогнозирование роста для {businessStage}
5. Принятие решений на основе данных

**Сложность:** {financialLiteracy}/10
**Примеры:** из {industry} для {businessType}
**Цели:** аналитика для {businessGoals}`,
  },
];

// Базовый шаблон промпта
export const BASE_COURSE_PROMPT_TEMPLATE = `Ты — опытный бизнес-тренер и методист. Создай персонализированный обучающий курс на основе данных клиента.

**Данные клиента:**
- Бизнес/идея: {businessType}
- Стадия бизнеса: {businessStage}
- Индустрия: {industry}
- Целевая аудитория: {targetAudience}
- Оборот: {monthlyRevenue} руб/месяц
- Сотрудников: {employeesCount}
- Опыт в предпринимательстве: {entrepreneurshipExperience} лет
- Уровень финансовой грамотности: {financialLiteracy}/10
- Цели: {businessGoals}
- Проблемы: {challenges}

**Формат обучения:** {preferredFormat}

**Курс:** {courseTitle}

---

## Требования к контенту:

### 1. Структура курса:
- 8-12 уроков (в зависимости от сложности темы)
- Каждый урок: 5-7 слайдов
- Итоговый тест: 10 вопросов
- Практические задания для {industry}

### 2. Формат слайдов:
**Каждый слайд должен содержать:**
- Заголовок (1 предложение)
- Основной контент (3-5 пунктов или 2-3 абзаца)
- Примеры из {industry}
- Практические советы для бизнеса {businessType}

### 3. Типы уроков:
- Теория (50%) — фундаментальные знания
- Практика (30%) — кейсы из {industry}
- Инструменты (20%) — шаблоны, чек-листы, калькуляторы

### 4. Персонализация:
- Используй реальные примеры из {industry}
- Адаптируй сложность под опыт {entrepreneurshipExperience} лет
- Учитывай проблемы: {challenges}
- Давай решения под цели: {businessGoals}

### 5. Итоговый тест:
- 10 вопросов разного типа
- Сложность: {financialLiteracy}/10
- Вопросы на применение знаний в {businessType}
- Отметь правильный ответ символом *

---

## Выходной формат JSON:

\`\`\`json
{
  "course": {
    "title": "Название курса",
    "description": "Описание курса для {businessType}",
    "lessons": [
      {
        "title": "Название урока",
        "type": "theory|practice|tool",
        "slides": [
          {
            "title": "Заголовок слайда",
            "content": "Текст слайда с примерами для {industry}...",
            "examples": ["Пример 1", "Пример 2"]
          }
        ],
        "practical_task": "Задание для {businessType}",
        "duration": "15-20 минут"
      }
    ],
    "test": {
      "questions": [
        {
          "text": "Вопрос 1?",
          "type": "single|multiple|text",
          "options": ["Вариант 1", "Вариант 2*", "Вариант 3"],
          "explanation": "Объяснение для {businessType}"
        }
      ]
    }
  }
}
\`\`\`

{additionalPrompt}`;

// Функция для замены плейсхолдеров в промпте
export const replacePromptPlaceholders = (
  prompt: string,
  onboardingData: {
    businessType?: string;
    businessStage?: string;
    industry?: string;
    targetAudience?: string;
    monthlyRevenue?: number;
    employeesCount?: number;
    entrepreneurshipExperience?: number;
    financialLiteracy?: number;
    businessGoals?: string[];
    challenges?: string[];
    preferredFormat?: string;
  },
  courseTitle?: string
): string => {
  let result = prompt;
  
  const replacements: Record<string, string> = {
    '{businessType}': onboardingData.businessType || 'бизнес',
    '{businessStage}': onboardingData.businessStage || 'idea',
    '{industry}': onboardingData.industry || 'бизнес',
    '{targetAudience}': onboardingData.targetAudience || 'клиенты',
    '{monthlyRevenue}': String(onboardingData.monthlyRevenue || 0),
    '{employeesCount}': String(onboardingData.employeesCount || 0),
    '{entrepreneurshipExperience}': String(onboardingData.entrepreneurshipExperience || 0),
    '{financialLiteracy}': String(onboardingData.financialLiteracy || 5),
    '{businessGoals}': Array.isArray(onboardingData.businessGoals) 
      ? onboardingData.businessGoals.join(', ') 
      : 'развитие бизнеса',
    '{challenges}': Array.isArray(onboardingData.challenges) 
      ? onboardingData.challenges.join(', ') 
      : 'общие бизнес-задачи',
    '{preferredFormat}': onboardingData.preferredFormat || 'slides',
    '{courseTitle}': courseTitle || 'Курс',
  };
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return result;
};


