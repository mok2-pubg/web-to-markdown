/**
 * Content script - 모든 웹 페이지에서 실행됨
 * 페이지 데이터를 추출하는데 사용됨
 */

// 페이지 메타데이터 추출
function extractPageData() {
  // 제목 추출 시도
  let title = document.title;

  // 더 나은 제목 찾기
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    title = h1.textContent.trim();
  }

  // Confluence 특화
  const confluenceTitle = document.querySelector('#title-text, .page-title');
  if (confluenceTitle) {
    title = confluenceTitle.textContent.trim();
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
