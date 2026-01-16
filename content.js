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
  // 전략: 큰 영역을 가져온 후 불필요한 것만 제거 (너무 좁게 선택하면 본문을 놓칠 수 있음)
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

  // 제거할 요소들 - Confluence 및 일반 웹사이트
  const selectorsToRemove = [
    // 기본 제거 대상
    'script',
    'style',
    'noscript',
    'iframe',

    // Confluence 특화 제거 대상
    '.ia-fixed-sidebar',           // Confluence 사이드바
    '.ia-splitter',                // Confluence 분할선
    '#navigation',                 // Confluence 네비게이션
    '.space-navigation',           // Confluence 스페이스 네비게이션
    '.page-navigation',            // 페이지 네비게이션
    '.aui-header',                 // Atlassian 헤더
    '.aui-sidebar',                // Atlassian 사이드바
    '.aui-breadcrumbs',            // 브레드크럼
    '.breadcrumbs',                // 브레드크럼
    '.page-metadata',              // 페이지 메타데이터
    '.content-navigation',         // 콘텐츠 네비게이션
    '.page-metadata-banner',       // 메타데이터 배너
    '.footer-body',                // 푸터
    '.related-content',            // 관련 콘텐츠
    '#comments-section',           // 댓글 섹션
    '#likes-section',              // 좋아요 섹션
    '#likes-and-labels-container', // 좋아요/라벨 컨테이너
    '.page-metadata-modification-info', // 수정 정보
    '[data-test-id="page-metadata-labels"]', // 라벨
    '.quick-comment-container',    // 빠른 댓글
    '.confluence-information-macro', // Confluence 정보 매크로 (일부)

    // 일반 웹사이트 제거 대상
    '.navigation',
    '.navbar',
    '.nav',
    'nav',
    '.header',
    'header',
    '.footer',
    'footer',
    '.sidebar',
    'aside',
    '.advertisement',
    '.ad',
    '[class*="comment"]',
    '[class*="social"]',
    '[class*="share"]',
    '[class*="related"]',
    '[class*="recommend"]'
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

// 페이지에서 모든 링크 추출
function extractLinks(sameDomainOnly = true) {
  const currentUrl = new URL(window.location.href);
  const links = new Set();

  // 모든 <a> 태그 찾기
  document.querySelectorAll('a[href]').forEach(anchor => {
    try {
      const href = anchor.getAttribute('href');
      if (!href) return;

      // 절대 URL로 변환
      const absoluteUrl = new URL(href, window.location.href);

      // 같은 도메인만 필터링 (옵션)
      if (sameDomainOnly && absoluteUrl.hostname !== currentUrl.hostname) {
        return;
      }

      // 특정 프로토콜만 허용
      if (absoluteUrl.protocol !== 'http:' && absoluteUrl.protocol !== 'https:') {
        return;
      }

      // 앵커(#) 제거
      absoluteUrl.hash = '';

      // URL 추가
      const cleanUrl = absoluteUrl.href;
      if (cleanUrl !== window.location.href) {  // 현재 페이지 제외
        links.add(cleanUrl);
      }
    } catch (error) {
      // 잘못된 URL은 무시
    }
  });

  return Array.from(links);
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
  } else if (request.action === 'extractLinks') {
    try {
      const sameDomainOnly = request.sameDomainOnly !== undefined ? request.sameDomainOnly : true;
      const links = extractLinks(sameDomainOnly);
      sendResponse({ success: true, links: links, count: links.length });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});
