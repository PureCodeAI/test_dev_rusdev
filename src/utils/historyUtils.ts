/**
 * Утилиты для работы с историей версий
 * Функции для управления версиями проектов
 */

export interface ProjectVersion {
  id: number;
  version: string;
  description?: string;
  author?: string;
  authorId?: number;
  createdAt: string;
  isPublished: boolean;
  data?: Record<string, unknown>;
  tag?: string;
}

/**
 * Создание новой версии
 */
export const createVersion = (
  version: string,
  data: Record<string, unknown>,
  description?: string,
  tag?: string,
  author?: string,
  authorId?: number
): ProjectVersion => {
  return {
    id: Date.now(),
    version,
    description,
    tag,
    author,
    authorId,
    createdAt: new Date().toISOString(),
    isPublished: false,
    data
  };
};

/**
 * Генерация версии на основе текущей
 */
export const generateVersionTag = (versions: ProjectVersion[]): string => {
  const versionNumbers = versions
    .map(v => {
      const match = v.version.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
      if (match) {
        return {
          major: parseInt(match[1]),
          minor: parseInt(match[2]),
          patch: parseInt(match[3])
        };
      }
      return null;
    })
    .filter((v): v is { major: number; minor: number; patch: number } => v !== null);

  if (versionNumbers.length === 0) {
    return 'v1.0.0';
  }

  const latest = versionNumbers.reduce((latest, current) => {
    if (current.major > latest.major) return current;
    if (current.major === latest.major && current.minor > latest.minor) return current;
    if (current.major === latest.major && current.minor === latest.minor && current.patch > latest.patch) return current;
    return latest;
  });

  return `v${latest.major}.${latest.minor}.${latest.patch + 1}`;
};

/**
 * Форматирование даты версии
 */
export const formatVersionDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Сравнение версий
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parseVersion = (version: string): number[] => {
    const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return [0, 0, 0];
  };

  const v1Parts = parseVersion(v1);
  const v2Parts = parseVersion(v2);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) return 1;
    if (v1Parts[i] < v2Parts[i]) return -1;
  }

  return 0;
};

/**
 * Сортировка версий по дате (новые первыми)
 */
export const sortVersionsByDate = (versions: ProjectVersion[]): ProjectVersion[] => {
  return [...versions].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Сортировка версий по номеру версии
 */
export const sortVersionsByNumber = (versions: ProjectVersion[]): ProjectVersion[] => {
  return [...versions].sort((a, b) => {
    return compareVersions(b.version, a.version);
  });
};

/**
 * Получение текущей версии
 */
export const getCurrentVersion = (versions: ProjectVersion[]): ProjectVersion | null => {
  const published = versions.filter(v => v.isPublished);
  if (published.length === 0) {
    return versions.length > 0 ? versions[0] : null;
  }
  return sortVersionsByDate(published)[0];
};

/**
 * Поиск версии по тегу или номеру
 */
export const findVersion = (
  versions: ProjectVersion[],
  versionOrTag: string
): ProjectVersion | null => {
  return versions.find(v => v.version === versionOrTag || v.tag === versionOrTag) || null;
};

/**
 * Валидация версии
 */
export const validateVersion = (version: ProjectVersion): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!version.version || version.version.trim() === '') {
    errors.push('Номер версии обязателен');
  }

  if (!version.data) {
    errors.push('Данные версии обязательны');
  }

  const versionRegex = /^v?\d+\.\d+\.\d+$/;
  if (version.version && !versionRegex.test(version.version)) {
    errors.push('Неверный формат версии (ожидается v1.0.0)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Клонирование версии
 */
export const cloneVersion = (version: ProjectVersion): ProjectVersion => {
  return {
    ...version,
    id: Date.now(),
    version: generateVersionTag([version]),
    createdAt: new Date().toISOString(),
    isPublished: false
  };
};

/**
 * Обновление версии
 */
export const updateVersion = (
  version: ProjectVersion,
  updates: Partial<ProjectVersion>
): ProjectVersion => {
  return {
    ...version,
    ...updates
  };
};

/**
 * Получение истории изменений между версиями
 */
export const getVersionDiff = (
  oldVersion: ProjectVersion,
  newVersion: ProjectVersion
): { added: string[]; removed: string[]; changed: string[] } => {
  const oldData = oldVersion.data || {};
  const newData = newVersion.data || {};

  const oldKeys = new Set(Object.keys(oldData));
  const newKeys = new Set(Object.keys(newData));

  const added = Array.from(newKeys).filter(key => !oldKeys.has(key));
  const removed = Array.from(oldKeys).filter(key => !newKeys.has(key));
  const changed = Array.from(oldKeys)
    .filter(key => newKeys.has(key) && JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]));

  return { added, removed, changed };
};

