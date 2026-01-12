/**
 * Content script - 모든 웹 페이지에서 실행됨
 * 페이지 데이터를 추출하는데 사용됨
 */

// 페이지 메타데이터 추출
function extractPageData() {
  let title = '';

  // 1. Confluence 특화 선택자 (우선순위 높음)
  const confluenceTitle = document.querySelector('#title-text, .page-title');
  if (confluenceTitle && confluenceTitle.textContent.trim()) {
    title = confluenceTitle.textContent.trim();
  }

  // 2. h1 태그에서 제목 찾기
  if (!title) {
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) {
      title = h1.textContent.trim();
    }
  }

  // 3. document.title 사용
  if (!title) {
    title = document.title;
  }

  // 4. 제목 정리 (불필요한 접미사 제거)
  if (title) {
    // " - Site Name", " | Site Name" 같은 패턴 제거
    title = title.split('|')[0].split('-')[0].trim();
  }

  // 5. 여전히 비어있거나 너무 일반적인 경우
  if (!title || title.toLowerCase() === 'wiki' || title.length < 2) {
    title = 'page-' + new Date().getTime();
  }

  // 본문 콘텐츠 추출 - 여러 선택자 시도
  let contentElement =
    document.querySelector('#main-content') ||  // Confluence, GitHub
    document.querySelector('.wiki-content') ||   // Confluence
    document.querySelector('.page-content') ||   // 일반적인 페이지
    document.querySelector('main') ||            // HTML5 main
    document.querySelector('article') ||         // HTML5 article
    document.querySelector('[role="main"]') ||   // ARIA main
    document.querySelector('.content') ||        // 일반적인 클래스
    document.body;                               // 최후의 수단

  // 불필요한 요소 제거 (복사본에서)
  const clone = contentElement.cloneNode(true);

  // 제거할 요소들
  const selectorsToRemove = [
    'script',
    'style',
    'noscript',
    'iframe',
    '.navigation',
    '.navbar',
    '.nav',
    '.header',
    '.footer',
    '.sidebar',
    '.advertisement',
    '.ad',
    '[class*="comment"]',
    '[class*="social"]'
  ];

  selectorsToRemove.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  return {
    title: title,
    content: clone.innerHTML,
    url: window.location.href
  };
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractPageData') {
    try {
      const pageData = extractPageData();
      sendResponse({ success: true, data: pageData });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});
