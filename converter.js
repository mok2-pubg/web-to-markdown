/**
 * HTML을 Markdown으로 변환
 * @param {string} html - 변환할 HTML 문자열
 * @returns {string} Markdown 문자열
 */
function convertHtmlToMarkdown(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 불필요한 요소 제거
  removeUnwantedElements(doc);

  // 본문을 Markdown으로 변환
  let markdown = processNode(doc.body);

  // 후처리
  markdown = postProcess(markdown);

  return markdown;
}

/**
 * 불필요한 요소 제거
 */
function removeUnwantedElements(doc) {
  const selectorsToRemove = [
    'script',
    'style',
    'noscript',
    '.page-metadata',
    '.page-comments',
    '.footer',
    '.header',
    '.navigation',
    '.sidebar',
    '[data-testid="page-metadata"]'
  ];

  selectorsToRemove.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });
}

/**
 * DOM 노드를 Markdown으로 변환
 */
function processNode(node, depth = 0) {
  if (!node) return '';

  // 텍스트 노드
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  // 요소 노드
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase();

    switch (tagName) {
      // 제목
      case 'h1':
        return `\n# ${getTextContent(node)}\n\n`;
      case 'h2':
        return `\n## ${getTextContent(node)}\n\n`;
      case 'h3':
        return `\n### ${getTextContent(node)}\n\n`;
      case 'h4':
        return `\n#### ${getTextContent(node)}\n\n`;
      case 'h5':
        return `\n##### ${getTextContent(node)}\n\n`;
      case 'h6':
        return `\n###### ${getTextContent(node)}\n\n`;

      // 단락
      case 'p':
        return `\n${processChildren(node)}\n\n`;

      // 줄바꿈
      case 'br':
        return '  \n';

      // 굵게
      case 'strong':
      case 'b':
        return `**${getTextContent(node)}**`;

      // 기울임
      case 'em':
      case 'i':
        return `*${getTextContent(node)}*`;

      // 코드
      case 'code':
        if (node.parentElement.tagName.toLowerCase() === 'pre') {
          return getTextContent(node);
        }
        return `\`${getTextContent(node)}\``;

      // 코드 블록
      case 'pre':
        const codeContent = node.querySelector('code')
          ? getTextContent(node.querySelector('code'))
          : getTextContent(node);
        const language = detectLanguage(node);
        return `\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;

      // 링크
      case 'a':
        const href = node.getAttribute('href') || '';
        const linkText = getTextContent(node);
        if (!href) return linkText;
        return `[${linkText}](${href})`;

      // 이미지
      case 'img':
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || 'image';
        return `![${alt}](${src})`;

      // 목록
      case 'ul':
        return `\n${processListItems(node, false)}\n`;
      case 'ol':
        return `\n${processListItems(node, true)}\n`;
      case 'li':
        return processChildren(node);

      // 인용
      case 'blockquote':
        const quoteContent = processChildren(node)
          .split('\n')
          .map(line => line.trim() ? `> ${line}` : '>')
          .join('\n');
        return `\n${quoteContent}\n\n`;

      // 테이블
      case 'table':
        return `\n${processTable(node)}\n\n`;

      // 수평선
      case 'hr':
        return '\n---\n\n';

      // 구분선
      case 'div':
      case 'section':
      case 'article':
        return processChildren(node);

      // 기타 인라인 요소
      case 'span':
      case 'label':
        return processChildren(node);

      // 기본
      default:
        return processChildren(node);
    }
  }

  return '';
}

/**
 * 자식 노드들 처리
 */
function processChildren(node) {
  let result = '';
  for (let child of node.childNodes) {
    result += processNode(child);
  }
  return result;
}

/**
 * 텍스트 콘텐츠 가져오기
 */
function getTextContent(node) {
  return node.textContent.trim();
}

/**
 * 리스트 아이템 처리
 */
function processListItems(listNode, ordered, indent = 0) {
  let result = '';
  let counter = 1;
  const items = Array.from(listNode.children).filter(
    child => child.tagName.toLowerCase() === 'li'
  );

  items.forEach(li => {
    const prefix = ordered ? `${counter}. ` : '- ';
    const indentStr = '  '.repeat(indent);
    const content = processChildren(li).trim();

    result += `${indentStr}${prefix}${content}\n`;

    // 중첩된 리스트 처리
    const nestedList = li.querySelector('ul, ol');
    if (nestedList) {
      const isOrdered = nestedList.tagName.toLowerCase() === 'ol';
      result += processListItems(nestedList, isOrdered, indent + 1);
    }

    if (ordered) counter++;
  });

  return result;
}

/**
 * 테이블 처리
 */
function processTable(tableNode) {
  let result = '';
  const rows = tableNode.querySelectorAll('tr');

  if (rows.length === 0) return '';

  // 헤더 행
  const headerRow = rows[0];
  const headerCells = headerRow.querySelectorAll('th, td');
  const headers = Array.from(headerCells).map(cell => getTextContent(cell).trim());
  result += '| ' + headers.join(' | ') + ' |\n';
  result += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

  // 데이터 행
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td, th');
    const cellContents = Array.from(cells).map(cell => getTextContent(cell).trim());
    result += '| ' + cellContents.join(' | ') + ' |\n';
  }

  return result;
}

/**
 * 코드 블록 언어 감지
 */
function detectLanguage(preNode) {
  // class에서 language- 추출
  const className = preNode.className || preNode.querySelector('code')?.className || '';
  const langMatch = className.match(/language-(\w+)/);
  if (langMatch) return langMatch[1];

  // data-language 속성
  const dataLang = preNode.getAttribute('data-language') ||
                   preNode.querySelector('code')?.getAttribute('data-language');
  if (dataLang) return dataLang;

  return '';
}

/**
 * 후처리
 */
function postProcess(markdown) {
  // 연속된 빈 줄을 2개로 제한
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  // 시작과 끝의 공백 제거
  markdown = markdown.trim();

  // 리스트 항목 사이의 불필요한 빈 줄 제거
  markdown = markdown.replace(/(\n[-*]\s.+)\n\n(\n[-*]\s)/g, '$1\n$2');

  return markdown;
}
