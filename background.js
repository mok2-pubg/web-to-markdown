// HTML to Markdown 변환 모듈 임포트
importScripts('converter.js');

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertToMarkdown') {
    handleConversion(request)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 비동기 응답을 위해 true 반환
  }
});

// Confluence 페이지를 Markdown으로 변환
async function handleConversion({ url, savePath, fileName, autoDownload }) {
  try {
    // 1. Confluence 페이지 가져오기
    const pageData = await fetchConfluencePage(url);

    // 2. HTML을 Markdown으로 변환
    const markdown = convertHtmlToMarkdown(pageData.content);

    // 3. 파일명 결정
    const finalFileName = fileName || sanitizeFileName(pageData.title) + '.md';

    // 4. 전체 경로 생성
    const fullPath = savePath.endsWith('/') || savePath.endsWith('\\')
      ? savePath + finalFileName
      : savePath + '/' + finalFileName;

    // 5. Markdown 파일 생성
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const downloadUrl = URL.createObjectURL(blob);

    // 6. 미리보기 생성 (처음 500자)
    const preview = markdown.substring(0, 500) + (markdown.length > 500 ? '...' : '');

    return {
      success: true,
      fileName: finalFileName,
      savePath: fullPath,
      downloadUrl: downloadUrl,
      preview: preview,
      fullContent: markdown
    };
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

// Confluence 페이지 가져오기
async function fetchConfluencePage(url) {
  try {
    // Confluence URL에서 페이지 ID 추출
    const pageId = extractPageId(url);

    if (!pageId) {
      throw new Error('유효한 Confluence URL이 아닙니다');
    }

    // 먼저 현재 페이지의 HTML 콘텐츠를 직접 가져오기 시도
    const response = await fetch(url, {
      credentials: 'include', // 쿠키 포함
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // HTML에서 제목과 본문 추출
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Confluence 페이지 제목 추출
    let title = doc.querySelector('#title-text, .page-title, h1')?.textContent?.trim();
    if (!title) {
      title = doc.querySelector('title')?.textContent?.split('-')[0]?.trim() || 'untitled';
    }

    // Confluence 본문 콘텐츠 추출
    let content = doc.querySelector('#main-content, .wiki-content, .page-content');

    if (!content) {
      // 콘텐츠를 찾지 못한 경우, 전체 body에서 추출
      content = doc.querySelector('body');
    }

    if (!content) {
      throw new Error('페이지 콘텐츠를 찾을 수 없습니다');
    }

    return {
      title: title,
      content: content.innerHTML,
      url: url
    };
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('페이지를 가져오는데 실패했습니다: ' + error.message);
  }
}

// URL에서 Confluence 페이지 ID 추출
function extractPageId(url) {
  // Confluence Cloud: /wiki/spaces/SPACE/pages/123456/Page+Title
  const cloudMatch = url.match(/\/pages\/(\d+)/);
  if (cloudMatch) return cloudMatch[1];

  // Confluence Server: /display/SPACE/Page+Title
  const serverMatch = url.match(/\/display\/([^/]+)\/(.+)/);
  if (serverMatch) return serverMatch[2];

  // viewpage.action?pageId=123456
  const pageIdMatch = url.match(/pageId=(\d+)/);
  if (pageIdMatch) return pageIdMatch[1];

  return null;
}

// 파일명을 안전하게 변환
function sanitizeFileName(fileName) {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // 파일명에 사용할 수 없는 문자 제거
    .replace(/\s+/g, '_') // 공백을 언더스코어로
    .replace(/_+/g, '_') // 연속된 언더스코어를 하나로
    .substring(0, 200); // 최대 길이 제한
}

// 확장프로그램 설치 시
chrome.runtime.onInstalled.addListener(() => {
  console.log('Confluence to Markdown extension installed');
});
