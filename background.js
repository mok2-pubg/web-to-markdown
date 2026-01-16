// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertToMarkdown') {
    handleConversion(request)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 비동기 응답을 위해 true 반환
  } else if (request.action === 'convertFromContent') {
    // content script에서 받은 데이터 처리
    handleContentScriptConversion(request)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// content script에서 받은 데이터를 Markdown으로 변환
async function handleContentScriptConversion({ pageData, fileName }) {
  try {
    // 1. HTML을 Markdown으로 변환
    const markdown = convertHtmlToMarkdownSimple(pageData.content, pageData.title);

    // 2. 파일명 결정
    const finalFileName = fileName || sanitizeFileName(pageData.title) + '.md';

    // 3. 미리보기 생성 (처음 500자)
    const preview = markdown.substring(0, 500) + (markdown.length > 500 ? '...' : '');

    return {
      success: true,
      fileName: finalFileName,
      markdown: markdown,
      preview: preview
    };
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

// 외부 URL 페이지를 Markdown으로 변환
async function handleConversion({ url, fileName }) {
  try {
    // 1. 페이지 가져오기
    const pageData = await fetchPageSimple(url);

    // 2. HTML을 Markdown으로 변환
    const markdown = convertHtmlToMarkdownSimple(pageData.content, pageData.title);

    // 3. 파일명 결정
    const finalFileName = fileName || sanitizeFileName(pageData.title) + '.md';

    // 4. 미리보기 생성 (처음 500자)
    const preview = markdown.substring(0, 500) + (markdown.length > 500 ? '...' : '');

    return {
      success: true,
      fileName: finalFileName,
      markdown: markdown,
      preview: preview
    };
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

// 간단한 페이지 가져오기 (텍스트 기반)
async function fetchPageSimple(url) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // 제목 추출 시도
    let title = '';

    // 1. <title> 태그에서 추출
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].split('|')[0].split('-')[0].trim();
    }

    // 2. h1 태그에서 추출 시도
    if (!title) {
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        title = h1Match[1].trim();
      }
    }

    // 3. 여전히 비어있거나 너무 일반적인 경우
    if (!title || title.toLowerCase() === 'wiki' || title.length < 2) {
      // URL에서 파일명 추출 시도
      const urlPath = new URL(url).pathname;
      const urlParts = urlPath.split('/').filter(p => p);
      title = urlParts.length > 0 ? urlParts[urlParts.length - 1] : 'page-' + Date.now();
    }

    // 본문 내용 추출
    // 전략: body 전체를 가져온 후 불필요한 영역만 제거
    // (복잡한 중첩 구조에서 regex로 정확히 추출하기 어려움)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : html;

    // Confluence 및 일반 웹사이트의 불필요한 영역 제거
    const removePatterns = [
      // Confluence 특화 제거
      /<div[^>]*class="[^"]*ia-fixed-sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<div[^>]*class="[^"]*ia-splitter[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<nav[^>]*id="navigation"[^>]*>[\s\S]*?<\/nav>/gi,
      /<div[^>]*id="navigation"[^>]*>[\s\S]*?<\/div>/gi,
      /<nav[^>]*class="[^"]*space-navigation[^"]*"[^>]*>[\s\S]*?<\/nav>/gi,
      /<ol[^>]*class="[^"]*aui-breadcrumbs[^"]*"[^>]*>[\s\S]*?<\/ol>/gi,
      /<div[^>]*class="[^"]*page-metadata[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<div[^>]*class="[^"]*footer-body[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<div[^>]*class="[^"]*related-content[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<section[^>]*id="comments-section"[^>]*>[\s\S]*?<\/section>/gi,
      /<div[^>]*id="likes-and-labels-container"[^>]*>[\s\S]*?<\/div>/gi,

      // 일반 웹사이트 헤더/푸터/사이드바
      /<header[^>]*>[\s\S]*?<\/header>/gi,
      /<footer[^>]*>[\s\S]*?<\/footer>/gi,
      /<aside[^>]*>[\s\S]*?<\/aside>/gi,
      /<nav[^>]*>[\s\S]*?<\/nav>/gi,
    ];

    removePatterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });

    return {
      title: title,
      content: content,
      url: url
    };
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('페이지를 가져오는데 실패했습니다: ' + error.message);
  }
}

// HTML을 간단하게 Markdown으로 변환 (정규식 기반)
function convertHtmlToMarkdownSimple(html, title) {
  let markdown = `# ${title}\n\n`;

  // script, style 태그 제거
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 일반적인 네비게이션/UI 요소 제거 (추가 정리)
  const removePatterns = [
    /<nav\b[^>]*>[\s\S]*?<\/nav>/gi,          // nav 태그
    /<header\b[^>]*>[\s\S]*?<\/header>/gi,    // header 태그
    /<footer\b[^>]*>[\s\S]*?<\/footer>/gi,    // footer 태그
    /<aside\b[^>]*>[\s\S]*?<\/aside>/gi,      // aside 태그
  ];

  removePatterns.forEach(pattern => {
    html = html.replace(pattern, '');
  });

  // 기본 변환
  let content = html
    // 제목 태그
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n\n')

    // 코드 블록
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '\n```\n$1\n```\n\n')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '\n```\n$1\n```\n\n')

    // 인라인 코드
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

    // 굵게, 기울임
    .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*')

    // 링크
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')

    // 이미지
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)')
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![image]($1)')

    // 리스트
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')

    // 단락과 줄바꿈
    .replace(/<br\s*\/?>/gi, '  \n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n\n')

    // 인용문
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
      return '\n> ' + content.replace(/\n/g, '\n> ') + '\n\n';
    })

    // 수평선
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')

    // HTML 태그 제거
    .replace(/<[^>]+>/g, '')

    // HTML 엔티티 디코딩
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

    // 연속된 빈 줄 정리
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  markdown += content;

  return markdown;
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
