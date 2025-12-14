// Утилиты для работы с TOTP (Time-based One-Time Password)

/**
 * Генерирует секретный ключ для 2FA
 */
export const generateSecret = (): string => {
  // Генерируем случайную строку из 32 символов (base32)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

/**
 * Генерирует TOTP код на основе секрета
 * Использует алгоритм TOTP (RFC 6238)
 */
export const generateTOTP = async (secret: string): Promise<string> => {
  // Преобразуем секрет в байты
  const key = base32Decode(secret);
  
  // Получаем текущее время в секундах, деленное на 30 (окно в 30 секунд)
  const time = Math.floor(Date.now() / 1000 / 30);
  
  // Преобразуем время в 8-байтовый массив (big-endian)
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, time, false); // big-endian
  
  // Вычисляем HMAC-SHA1
  const hmac = await hmacSHA1(key, new Uint8Array(timeBuffer));
  
  // Динамический тримминг
  const offset = hmac[19] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
  
  // Берем последние 6 цифр
  const otp = (code % 1000000).toString().padStart(6, '0');
  
  return otp;
};

/**
 * Проверяет TOTP код
 */
export const verifyTOTP = async (secret: string, code: string, window: number = 1): Promise<boolean> => {
  const currentCode = await generateTOTP(secret);
  
  // Проверяем текущий код
  if (currentCode === code) {
    return true;
  }
  
  // Проверяем коды в окне (для компенсации задержек)
  for (let i = -window; i <= window; i++) {
    if (i === 0) continue;
    const time = Math.floor(Date.now() / 1000 / 30) + i;
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(4, time, false);
    
    const key = base32Decode(secret);
    const hmac = await hmacSHA1(key, new Uint8Array(timeBuffer));
    const offset = hmac[19] & 0x0f;
    const testCode = ((hmac[offset] & 0x7f) << 24) |
                     ((hmac[offset + 1] & 0xff) << 16) |
                     ((hmac[offset + 2] & 0xff) << 8) |
                     (hmac[offset + 3] & 0xff);
    const otp = (testCode % 1000000).toString().padStart(6, '0');
    
    if (otp === code) {
      return true;
    }
  }
  
  return false;
};

/**
 * Генерирует URL для QR-кода
 */
export const generateOTPAuthURL = (secret: string, email: string, issuer: string = 'BizForge'): string => {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
};

/**
 * Декодирует base32 строку в байты
 */
const base32Decode = (str: string): Uint8Array => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let index = 0;
  const output: number[] = [];
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i).toUpperCase();
    const charIndex = chars.indexOf(char);
    
    if (charIndex === -1) continue;
    
    value = (value << 5) | charIndex;
    bits += 5;
    
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  
  return new Uint8Array(output);
};

/**
 * Вычисляет HMAC-SHA1
 */
const hmacSHA1 = async (key: Uint8Array, message: Uint8Array): Promise<Uint8Array> => {
  // Используем Web Crypto API для HMAC-SHA1
  // Преобразуем Uint8Array в ArrayBuffer для совместимости с crypto.subtle
  // Создаем новый ArrayBuffer и копируем данные, чтобы гарантировать тип ArrayBuffer
  // Всегда создаем новый ArrayBuffer, чтобы избежать проблем с SharedArrayBuffer
  const keyArray = new Uint8Array(key);
  const messageArray = new Uint8Array(message);
  const keyBuffer = keyArray.buffer.slice(keyArray.byteOffset, keyArray.byteOffset + keyArray.byteLength);
  const messageBuffer = messageArray.buffer.slice(messageArray.byteOffset, messageArray.byteOffset + messageArray.byteLength);
  
  // Проверяем, что это ArrayBuffer, а не SharedArrayBuffer
  const keyBufferSafe: ArrayBuffer = keyBuffer instanceof SharedArrayBuffer 
    ? new Uint8Array(key).buffer 
    : keyBuffer as ArrayBuffer;
  const messageBufferSafe: ArrayBuffer = messageBuffer instanceof SharedArrayBuffer
    ? new Uint8Array(message).buffer
    : messageBuffer as ArrayBuffer;
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBufferSafe,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBufferSafe);
  return new Uint8Array(signature);
};

// Синхронная версия для использования в generateTOTP (не используется, оставлена для возможного будущего использования)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _hmacSHA1Sync = (key: Uint8Array, message: Uint8Array): Uint8Array => {
  // Упрощенная версия HMAC-SHA1 для синхронного использования
  // В реальном приложении лучше использовать библиотеку
  const blockSize = 64;
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  
  // Инициализируем ipad и opad
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = 0x36;
    opad[i] = 0x5c;
  }
  
  // XOR ключа с ipad/opad
  for (let i = 0; i < key.length && i < blockSize; i++) {
    ipad[i] ^= key[i];
    opad[i] ^= key[i];
  }
  
  // Для упрощения используем простой хеш
  // В production лучше использовать библиотеку
  const hash1 = simpleHash(Array.from(ipad), Array.from(message));
  const hash2 = simpleHash(Array.from(opad), hash1);
  
  return new Uint8Array(hash2);
};

// Упрощенная хеш-функция (в production использовать SHA-1)
const simpleHash = (arr1: number[], arr2: number[]): number[] => {
  const combined = [...arr1, ...arr2];
  const hash = new Array(20).fill(0);
  for (let i = 0; i < combined.length; i++) {
    hash[i % 20] = (hash[i % 20] + combined[i]) % 256;
  }
  return hash;
};


