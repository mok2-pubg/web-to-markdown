/**
 * Content script - Confluence 페이지에서 실행됨
 * 페이지 데이터를 추출하는데 사용될 수 있음
 */

// Confluence 페이지인지 확인
function isConfluencePage() {
  return document.querySelector('#main-content, .wiki-content, .page-content') !== null ||
         window.location.href.includes('confluence') ||
         window.location.href.includes('atlassian.net');
}

// 페이지 메타데이터 추출
function extractPageMetadata() {
  const metadata = {
    title: '',
    content: '',
    url: window.location.href,
    isConfluence: isConfluencePage()
  };

  if (metadata.isConfluence) {
    // 제목 추출
    const titleElement = document.querySelector('#title-text, .page-title, h1');
    metadata.title = titleElement ? titleElement.textContent.trim() : document.title;

    // 본문 콘텐츠 추출
    const contentElement = document.querySelector('#main-content, .wiki-content, .page-content');
    if (contentElement) {
      metadata.content = contentElement.innerHTML;
    }
  }

  return metadata;
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractPageData') {
    const metadata = extractPageMetadata();
    sendResponse(metadata);
  }
  return true;
});

// 페이지 로드 시 Confluence 페이지인지 확인
if (isConfluencePage()) {
  console.log('Confluence page detected');
}
