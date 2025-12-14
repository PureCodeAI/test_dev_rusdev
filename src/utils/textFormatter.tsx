import React from 'react';

// Утилита для форматирования текста с markdown-подобным синтаксисом

export const formatText = (text: string): JSX.Element[] => {
  if (!text) return [];

  const result: JSX.Element[] = [];
  let keyCounter = 0;

  const processBold = (content: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      parts.push(
        React.createElement('strong', {
          key: `bold-${keyCounter++}`,
          className: 'font-bold text-foreground',
        }, match[1])
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
  };

  // Обработка списков в тексте (1) или 1.) в одной строке
  const processLists = (content: string): (string | JSX.Element)[] => {
    // Проверяем, есть ли в тексте нумерованные списки (1) или 1.)
    // Улучшенное регулярное выражение для поиска элементов списка
    const numberedPattern = /(\d+)[.)]\s+([^0-9]+?)(?=\s+\d+[.)]|\.\s+[А-Я]|$)/g;
    const matches = Array.from(content.matchAll(numberedPattern));
    
    if (matches.length >= 2) {
      // Если найдено 2+ элемента списка, создаем список
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      const listItems: (string | JSX.Element)[] = [];
      
      matches.forEach((match) => {
        // Добавляем текст до списка
        if (match.index !== undefined && match.index > lastIndex) {
          const beforeText = content.substring(lastIndex, match.index);
          if (beforeText.trim()) {
            parts.push(...processBold(beforeText.trim()));
          }
        }
        
        // Добавляем элемент списка
        listItems.push(
          React.createElement('li', { 
            key: listItems.length,
            className: 'mb-1',
          }, processBold(match[2].trim()))
        );
        
        lastIndex = (match.index || 0) + match[0].length;
      });
      
      // Добавляем список
      if (listItems.length > 0) {
        parts.push(
          React.createElement('ol', {
            key: `list-${keyCounter++}`,
            className: 'list-decimal list-outside space-y-2 my-4 ml-6',
            style: { listStylePosition: 'outside', paddingLeft: '1.5rem' },
          }, listItems)
        );
      }
      
      // Добавляем оставшийся текст
      if (lastIndex < content.length) {
        const afterText = content.substring(lastIndex);
        if (afterText.trim()) {
          parts.push(...processBold(afterText.trim()));
        }
      }
      
      return parts.length > 0 ? parts : processBold(content);
    }
    
    return processBold(content);
  };

  // Разбиваем на параграфы по переносам строк
  const paragraphs = text.split('\n').filter(p => p.trim());
  
  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    
    // Проверка на нумерованный список в начале строки
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    // Проверка на маркированный список в начале строки
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)$/);
    
    if (numberedMatch) {
      // Начинаем нумерованный список
      result.push(
        React.createElement('ol', {
          key: `list-${keyCounter++}`,
          className: 'list-decimal list-outside space-y-2 my-4 ml-6',
          style: { listStylePosition: 'outside', paddingLeft: '1.5rem' },
        }, [
          React.createElement('li', { 
            key: 0,
            className: 'mb-1',
          }, processBold(numberedMatch[2]))
        ])
      );
    } else if (bulletMatch) {
      // Начинаем маркированный список
      result.push(
        React.createElement('ul', {
          key: `list-${keyCounter++}`,
          className: 'list-disc list-outside space-y-2 my-4 ml-6',
          style: { listStylePosition: 'outside', paddingLeft: '1.5rem' },
        }, [
          React.createElement('li', { 
            key: 0,
            className: 'mb-1',
          }, processBold(bulletMatch[1]))
        ])
      );
    } else {
      // Обычный параграф с обработкой списков внутри
      const processed = processLists(trimmed);
      result.push(
        React.createElement('p', {
          key: `p-${keyCounter++}`,
          className: 'mb-2',
        }, processed)
      );
    }
  });

  return result.length > 0 ? result : [React.createElement('span', { key: 'empty' }, text)];
};
