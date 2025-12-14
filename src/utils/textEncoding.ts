// Утилита для декодирования файлов с различными кодировками

/**
 * Декодирует файл с учетом кодировки
 * Поддерживает UTF-8, Windows-1251 (ANSI), и другие кодировки
 */
export const decodeFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Пробуем сначала UTF-8, так как современные системы часто используют его
    const utf8Reader = new FileReader();
    
    utf8Reader.onload = (e) => {
      const utf8Result = e.target?.result;
      if (typeof utf8Result === 'string') {
        // Проверяем, правильно ли декодировались ключевые слова формата 1С
        const has1CKeywords = utf8Result.includes('1CClientBankExchange') || 
                              utf8Result.includes('СекцияДокумент') ||
                              utf8Result.includes('СекцияРасчСчет') ||
                              utf8Result.includes('КонецДокумента');
        
        // Проверяем наличие искаженных символов (типичные для неправильной кодировки)
        // Используем проверку на недопустимые символы без control characters
        const hasCorruptedChars = /[^\u0020-\u007E\u0400-\u04FF\u2000-\u206F\u20A0-\u20CF\u2100-\u214F\u2190-\u21FF\u2200-\u22FF]/.test(utf8Result) || 
          (utf8Result.length > 100 && !/[А-Яа-яЁё]/.test(utf8Result) && file.name.match(/[А-Яа-яЁё]/));
        
        if (has1CKeywords && !hasCorruptedChars) {
          resolve(utf8Result);
        } else {
          // Если UTF-8 не подошел, пробуем Windows-1251
          const win1251Reader = new FileReader();
          win1251Reader.onload = (e2) => {
            const win1251Result = e2.target?.result;
            if (typeof win1251Result === 'string') {
              // Проверяем ключевые слова в Windows-1251
              const has1CKeywordsWin1251 = win1251Result.includes('1CClientBankExchange') || 
                                          win1251Result.includes('СекцияДокумент') ||
                                          win1251Result.includes('СекцияРасчСчет') ||
                                          win1251Result.includes('КонецДокумента');
              
              if (has1CKeywordsWin1251) {
                resolve(win1251Result);
              } else {
                // Если ни один вариант не подошел, возвращаем UTF-8 результат
                resolve(utf8Result);
              }
            } else {
              resolve(utf8Result);
            }
          };
          win1251Reader.onerror = () => resolve(utf8Result);
          win1251Reader.readAsText(file, 'windows-1251');
        }
      } else {
        reject(new Error('Не удалось прочитать файл'));
      }
    };
    
    utf8Reader.onerror = () => {
      // При ошибке UTF-8 пробуем Windows-1251
      const win1251Reader = new FileReader();
      win1251Reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Не удалось прочитать файл'));
        }
      };
      win1251Reader.onerror = () => reject(new Error('Не удалось декодировать файл'));
      win1251Reader.readAsText(file, 'windows-1251');
    };
    
    // Пробуем UTF-8
    utf8Reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Пробует декодировать файл через readAsText с разными кодировками
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _decodeAsText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Пробуем Windows-1251
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        // Проверяем, правильно ли декодировались русские символы
        const hasRussianChars = /[А-Яа-яЁё]/.test(result);
        const hasCorrupted = result.includes('\uFFFD') || (result.length > 0 && !hasRussianChars && /[А-Яа-яЁё]/.test(file.name));
        
        if (hasCorrupted) {
          // Пробуем UTF-8
          const utf8Reader = new FileReader();
          utf8Reader.onload = (e2) => {
            const utf8Result = e2.target?.result;
            if (typeof utf8Result === 'string') {
              resolve(utf8Result);
            } else {
              resolve(result); // Возвращаем то, что есть
            }
          };
          utf8Reader.onerror = () => resolve(result);
          utf8Reader.readAsText(file, 'UTF-8');
        } else {
          resolve(result);
        }
      } else {
        reject(new Error('Не удалось прочитать файл'));
      }
    };
    
    reader.onerror = reject;
    
    // Пробуем Windows-1251
    reader.readAsText(file, 'windows-1251');
  });
};

/**
 * Декодирует файл как Windows-1251 (ANSI)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _decodeAsWindows1251 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else if (result instanceof ArrayBuffer) {
        decodeArrayBufferAsWindows1251(result).then(resolve).catch(reject);
      } else {
        reject(new Error('Не удалось прочитать файл'));
      }
    };
    
    reader.onerror = reject;
    
    // Пробуем как Windows-1251
    reader.readAsText(file, 'windows-1251');
  });
};

/**
 * Декодирует ArrayBuffer как Windows-1251
 */
const decodeArrayBufferAsWindows1251 = async (buffer: ArrayBuffer): Promise<string> => {
  // Таблица соответствия Windows-1251
  const windows1251Table: Record<number, string> = {
    0x80: 'Ђ', 0x81: 'Ѓ', 0x82: '‚', 0x83: 'ѓ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
    0x88: '€', 0x89: '‰', 0x8A: 'Љ', 0x8B: '‹', 0x8C: 'Ќ', 0x8D: 'Ћ', 0x8E: 'Џ', 0x8F: 'ђ',
    0x90: '‘', 0x91: '’', 0x92: '"', 0x93: '"', 0x94: '•', 0x95: '–', 0x96: '—', 0x97: '—',
    0x98: '™', 0x99: 'љ', 0x9A: '›', 0x9B: 'ќ', 0x9C: 'ћ', 0x9D: 'џ', 0x9E: 'ў', 0x9F: 'џ',
    0xA0: ' ', 0xA1: 'Ў', 0xA2: 'ў', 0xA3: 'Ј', 0xA4: '¤', 0xA5: 'Ґ', 0xA6: '¦', 0xA7: '§',
    0xA8: 'Ё', 0xA9: '©', 0xAA: 'Є', 0xAB: '«', 0xAC: '¬', 0xAD: '­', 0xAE: '®', 0xAF: 'Ї',
    0xB0: '°', 0xB1: '±', 0xB2: 'І', 0xB3: 'і', 0xB4: 'ґ', 0xB5: 'µ', 0xB6: '¶', 0xB7: '·',
    0xB8: 'ё', 0xB9: '№', 0xBA: 'є', 0xBB: '»', 0xBC: 'ј', 0xBD: 'Ѕ', 0xBE: 'ѕ', 0xBF: 'ї',
    0xC0: 'А', 0xC1: 'Б', 0xC2: 'В', 0xC3: 'Г', 0xC4: 'Д', 0xC5: 'Е', 0xC6: 'Ж', 0xC7: 'З',
    0xC8: 'И', 0xC9: 'Й', 0xCA: 'К', 0xCB: 'Л', 0xCC: 'М', 0xCD: 'Н', 0xCE: 'О', 0xCF: 'П',
    0xD0: 'Р', 0xD1: 'С', 0xD2: 'Т', 0xD3: 'У', 0xD4: 'Ф', 0xD5: 'Х', 0xD6: 'Ц', 0xD7: 'Ч',
    0xD8: 'Ш', 0xD9: 'Щ', 0xDA: 'Ъ', 0xDB: 'Ы', 0xDC: 'Ь', 0xDD: 'Э', 0xDE: 'Ю', 0xDF: 'Я',
    0xE0: 'а', 0xE1: 'б', 0xE2: 'в', 0xE3: 'г', 0xE4: 'д', 0xE5: 'е', 0xE6: 'ж', 0xE7: 'з',
    0xE8: 'и', 0xE9: 'й', 0xEA: 'к', 0xEB: 'л', 0xEC: 'м', 0xED: 'н', 0xEE: 'о', 0xEF: 'п',
    0xF0: 'р', 0xF1: 'с', 0xF2: 'т', 0xF3: 'у', 0xF4: 'ф', 0xF5: 'х', 0xF6: 'ц', 0xF7: 'ч',
    0xF8: 'ш', 0xF9: 'щ', 0xFA: 'ъ', 0xFB: 'ы', 0xFC: 'ь', 0xFD: 'э', 0xFE: 'ю', 0xFF: 'я',
  };
  
  const bytes = new Uint8Array(buffer);
  let result = '';
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte < 0x80) {
      // ASCII символы
      result += String.fromCharCode(byte);
    } else if (windows1251Table[byte]) {
      result += windows1251Table[byte];
    } else {
      // Если символ не найден в таблице, пробуем как есть
      result += String.fromCharCode(byte);
    }
  }
  
  return result;
};

