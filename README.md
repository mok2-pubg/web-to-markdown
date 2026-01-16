# Web to Markdown Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://github.com/mok2-pubg/web-to-markdown)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/mok2-pubg/web-to-markdown/releases)

> Convert any web page to Markdown format and save it locally for AI agent reference.

모든 웹 페이지를 Markdown 형식으로 변환하고 로컬에 저장하는 크롬 확장프로그램입니다. AI 에이전트가 참조할 수 있는 문서를 쉽게 생성할 수 있습니다.

[한국어](#한국어) | [English](#english)

---

## 한국어

## 주요 기능

- 🌐 **모든 웹 페이지 변환**: URL만 입력하면 Markdown으로 변환
- 📦 **일괄 처리 지원**: 여러 URL을 한 번에 입력하여 일괄 변환 및 다운로드
- 🔖 **북마크 폴더 변환**: Chrome 북마크 폴더 전체를 한 번에 변환
- 🕷️ **하위 페이지 크롤링**: 현재 페이지의 모든 하위 링크를 자동으로 찾아서 재귀적으로 변환 (최대 깊이 설정 가능)
- 📥 **유연한 저장 방식**: 저장 위치를 직접 선택하거나 자동으로 다운로드 폴더에 저장
- 🎯 **현재 탭 URL 자동 가져오기**: 클릭 한 번으로 현재 페이지 URL 입력
- 📝 **스마트 제목 추출**: 페이지 제목을 자동으로 파일명으로 사용
- 🔄 **다양한 HTML 요소 지원**:
  - 제목 (H1-H6)
  - 단락, 굵게, 기울임
  - 링크 및 이미지
  - 코드 블록 (인라인 & 블록)
  - 목록 (순서 있음/없음)
  - 테이블
  - 인용문

## 설치 방법

### 1. 아이콘 생성

확장프로그램을 설치하기 전에 아이콘을 생성해야 합니다:

1. `icons/generate-icons.html` 파일을 브라우저에서 엽니다
2. "모든 아이콘 다운로드" 버튼을 클릭합니다
3. 다운로드된 `icon16.png`, `icon48.png`, `icon128.png` 파일을 `icons/` 폴더에 저장합니다

### 2. Chrome에 확장프로그램 로드

1. Chrome 브라우저를 엽니다
2. 주소창에 `chrome://extensions/` 를 입력합니다
3. 오른쪽 상단의 "개발자 모드"를 활성화합니다
4. "압축해제된 확장 프로그램을 로드합니다" 버튼을 클릭합니다
5. `web-to-markdown` 폴더를 선택합니다

## 사용 방법

### 기본 사용법 (단일 URL)

1. Chrome 툴바에서 확장프로그램 아이콘을 클릭합니다
2. **"단일 URL"** 모드 선택 (기본값)
3. **Web Page URL** 입력:
   - 직접 URL 입력, 또는
   - "현재 탭 URL 가져오기" 버튼 클릭
4. **파일명** (선택사항):
   - 비워두면 페이지 제목을 자동으로 사용
   - 원하는 파일명 직접 입력 가능
5. **저장 위치 선택**:
   - ✅ 체크: 저장 대화상자가 열려 원하는 위치 선택
   - ⬜ 해제: 자동으로 Downloads 폴더에 저장
6. "Markdown으로 변환 및 저장" 버튼 클릭

### 일괄 처리 사용법 (여러 URL)

1. Chrome 툴바에서 확장프로그램 아이콘을 클릭합니다
2. **"일괄 처리"** 모드 선택
3. **URL 목록** 입력:
   - 텍스트 영역에 URL을 한 줄에 하나씩 입력
   - 예시:
     ```
     https://example.com/page1
     https://example.com/page2
     https://example.com/page3
     ```
4. "일괄 변환 및 저장" 버튼 클릭
5. 각 URL이 순차적으로 처리되며, 진행 상황이 표시됩니다
6. 모든 파일이 자동으로 Downloads 폴더에 저장됩니다
7. 완료 후 성공/실패 개수와 오류 내역이 표시됩니다

**일괄 처리 팁**:
- 모든 파일은 자동으로 Downloads 폴더에 저장됩니다 (저장 위치 선택 불가)
- URL 간 500ms 딜레이가 자동으로 적용되어 서버 부하를 방지합니다
- 일부 URL이 실패해도 나머지는 계속 처리됩니다
- 각 페이지의 제목이 자동으로 파일명으로 사용됩니다

### 북마크 폴더 변환 사용법

1. Chrome 툴바에서 확장프로그램 아이콘을 클릭합니다
2. **"북마크 폴더"** 모드 선택
3. **"북마크 폴더 불러오기"** 버튼 클릭
   - Chrome의 모든 북마크 폴더가 계층 구조로 표시됩니다
4. **변환할 폴더 선택**:
   - 드롭다운에서 원하는 북마크 폴더 선택
   - 선택한 폴더의 이름과 URL 개수가 표시됩니다
   - 하위 폴더의 북마크도 모두 포함됩니다
5. "북마크 폴더 변환 및 저장" 버튼 클릭
6. 각 북마크가 순차적으로 처리되며, 진행 상황이 표시됩니다
7. 모든 파일이 자동으로 Downloads 폴더에 저장됩니다
8. 완료 후 성공/실패 개수와 오류 내역이 표시됩니다

**북마크 폴더 변환 팁**:
- 선택한 폴더의 모든 하위 폴더 북마크도 함께 변환됩니다
- 모든 파일은 자동으로 Downloads 폴더에 저장됩니다
- URL 간 500ms 딜레이가 자동으로 적용되어 서버 부하를 방지합니다
- 일부 URL이 실패해도 나머지는 계속 처리됩니다
- 읽기 자료, 프로젝트 참고 문서 등을 폴더별로 정리해두면 편리합니다

### 하위 페이지 크롤링 사용법

1. Chrome 툴바에서 확장프로그램 아이콘을 클릭합니다
2. **"하위 페이지"** 모드 선택
3. **시작 페이지 URL** 입력:
   - 직접 URL 입력, 또는
   - "현재 탭 URL 가져오기" 버튼 클릭
4. **크롤링 깊이 설정** (1-5):
   - 깊이 1: 시작 페이지의 직접 링크만
   - 깊이 2: 2단계까지 (링크의 링크)
   - 깊이 3+: 3단계 이상 (깊을수록 더 많은 페이지 발견)
5. **같은 도메인만 크롤링** (권장):
   - ✅ 체크: 시작 페이지와 같은 도메인만 크롤링
   - ⬜ 해제: 외부 링크도 포함 (주의: 너무 많은 페이지가 발견될 수 있음)
6. "하위 페이지 크롤링 시작" 버튼 클릭
7. 크롤링 진행 중 발견된 페이지 수가 실시간으로 표시됩니다
8. 모든 발견된 페이지가 순차적으로 변환되어 Downloads 폴더에 저장됩니다
9. 완료 후 성공/실패 개수와 오류 내역이 표시됩니다

**하위 페이지 크롤링 팁**:
- **위키/문서 사이트에 최적화**: Confluence, Notion, GitHub Wiki 등에 적합
- 시작 페이지를 문서 목차 페이지로 설정하면 효과적
- 최대 50개 페이지까지 자동 제한 (무한 크롤링 방지)
- 현재 탭이 시작 페이지일 때 가장 정확하게 동작
- 같은 도메인만 크롤링 옵션을 사용하면 관련 페이지만 수집
- Confluence 스페이스 전체, GitHub 프로젝트 문서 전체를 한 번에 다운로드 가능

**주의사항**:
- 크롤링은 현재 탭에서만 링크를 추출할 수 있습니다
- 다른 페이지로 이동하지 말고 현재 탭을 유지하세요
- 크롤링 중 브라우저를 닫지 마세요

### AI 에이전트 연동

저장 대화상자를 통해 AI 에이전트가 참조할 수 있는 경로에 직접 저장하세요:

```
C:\Users\username\.claude\web-docs\
C:\Users\username\Documents\agent-knowledge\
~/Documents/ai-reference/
```

**팁**: "저장 위치를 직접 선택" 체크박스를 켜두면, 매번 저장 위치를 선택할 수 있습니다.

## 지원하는 웹 페이지

이 확장프로그램은 모든 웹 페이지에서 작동합니다:

| 플랫폼 | 지원 내용 |
|--------|-----------|
| **Confluence** | Cloud/Server 모든 버전, 페이지 제목 자동 추출 |
| **Notion** | 공개 페이지 |
| **Medium, Blog** | 대부분의 블로그 플랫폼 |
| **GitHub** | Wiki, README, 문서 페이지 |
| **Stack Overflow** | 질문/답변 페이지 |
| **기타** | HTML 콘텐츠가 있는 모든 웹 페이지 |

## 프로젝트 구조

```
web-to-markdown/
├── manifest.json           # 확장프로그램 설정 (Manifest V3)
├── popup.html             # 팝업 UI
├── popup.css              # 팝업 스타일
├── popup.js               # 팝업 로직 (Blob 생성, 다운로드 처리)
├── background.js          # 백그라운드 서비스 워커 (페이지 fetch, 변환)
├── content.js             # 콘텐츠 스크립트 (DOM 직접 추출)
├── icons/
│   ├── icon.svg          # SVG 아이콘 소스
│   ├── generate-icons.html  # PNG 생성 도구
│   ├── icon16.png        # 16x16 아이콘
│   ├── icon48.png        # 48x48 아이콘
│   └── icon128.png       # 128x128 아이콘
└── README.md
```

## 기술 스택

- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (No dependencies)
- **HTML/CSS**
- **Content Script**: 현재 탭의 DOM 직접 추출
- **Regex-based Conversion**: Service Worker 호환 HTML→Markdown 변환
- **Chrome Storage API**: 설정 저장
- **Chrome Downloads API**: 파일 다운로드

## 작동 원리

### 1. 페이지 데이터 추출

**현재 탭 (권장)**:
- Content Script가 페이지의 DOM을 직접 접근
- 더 정확한 제목 및 콘텐츠 추출
- Confluence, GitHub 등 특화된 선택자 사용

**외부 URL (Fallback)**:
- Background worker에서 fetch로 HTML 가져오기
- Regex로 제목과 본문 추출
- Content script 실패 시 자동으로 사용

### 2. HTML to Markdown 변환

Service Worker 환경에서 작동하도록 Regex 기반 변환:
- HTML 태그를 Markdown 문법으로 변환
- Script, style 태그 자동 제거
- 불필요한 요소 필터링

### 3. 파일 저장

- Popup.js에서 Blob 생성 (Service Worker 제한 회피)
- Chrome Downloads API로 파일 저장
- 사용자 선택에 따라 저장 위치 결정

## 알려진 제한사항

1. **인증 필요**: 로그인이 필요한 페이지는 해당 사이트에 로그인되어 있어야 합니다
2. **권한 필요**: 페이지를 볼 수 있는 권한이 있어야 합니다
3. **동적 콘텐츠**: JavaScript로 나중에 로드되는 콘텐츠는 변환되지 않을 수 있습니다
4. **첨부파일**: 첨부된 파일은 링크로만 포함됩니다
5. **복잡한 레이아웃**: 매우 복잡한 CSS 레이아웃은 단순화될 수 있습니다

## 트러블슈팅

### "페이지를 가져오는데 실패했습니다" 오류

- 해당 사이트에 로그인되어 있는지 확인하세요
- 페이지에 대한 읽기 권한이 있는지 확인하세요
- URL이 올바른지 확인하세요 (http:// 또는 https:// 포함)
- CORS 정책으로 인해 일부 사이트는 접근이 제한될 수 있습니다

### 제목이 "WIKI.md"나 "untitled.md"로 저장됨

- 현재 탭의 페이지라면: "현재 탭 URL 가져오기" 버튼을 사용하세요 (더 정확)
- 파일명을 직접 지정하거나, 페이지에 적절한 제목이 있는지 확인하세요

### 아이콘이 표시되지 않음

- `icons/generate-icons.html`을 사용하여 PNG 아이콘을 생성했는지 확인하세요
- 생성된 PNG 파일이 `icons/` 폴더에 있는지 확인하세요
- 확장프로그램을 새로고침하세요

### Content Script 오류

- 확장프로그램을 설치한 후 페이지를 새로고침하세요
- `chrome://extensions/` 페이지 등 일부 Chrome 내부 페이지에서는 작동하지 않습니다

## 개발 및 디버깅

### 디버깅 방법

1. **팝업 디버깅**:
   - 팝업을 열고 마우스 오른쪽 클릭 → 검사
   - 또는 `chrome://extensions/` → "Service Worker" → "검사"

2. **백그라운드 스크립트**:
   - `chrome://extensions/` → "Service Worker" 링크 클릭
   - Console에서 로그 확인

3. **콘텐츠 스크립트**:
   - 페이지에서 F12 → Console 탭
   - `chrome.runtime.sendMessage` 호출 확인

### 개발 팁

```javascript
// 페이지 데이터 추출 테스트
chrome.tabs.sendMessage(tabId, {action: 'extractPageData'}, response => {
  console.log(response);
});

// Markdown 변환 결과 확인
console.log(convertHtmlToMarkdownSimple(html, title));
```

## 향후 개선 계획

- [x] 배치 변환 (여러 페이지 동시 변환) ✅ 완료
- [x] 북마크 폴더 전체 변환 ✅ 완료
- [ ] 변환 옵션 설정 (이미지 포함/제외, 코드 블록 언어 지정 등)
- [ ] 페이지 계층 구조 유지 (Confluence 스페이스 전체 변환)
- [ ] 첨부파일 다운로드 지원
- [ ] 자동 동기화 기능 (특정 폴더 모니터링)
- [ ] Dark mode 지원

## 라이센스

MIT License

## 기여

버그 리포트나 기능 제안은 [GitHub Issues](https://github.com/mok2-pubg/web-to-markdown/issues)에서 환영합니다!

## 작성자

Made with Claude Code

---

## English

### Key Features

- 🌐 **Universal Web Page Conversion**: Convert any URL to Markdown
- 📦 **Batch Processing**: Convert multiple URLs at once
- 🔖 **Bookmark Folder Conversion**: Convert entire Chrome bookmark folders
- 📥 **Flexible Save Options**: Choose save location or auto-save to Downloads
- 🎯 **Current Tab URL Import**: One-click URL import from active tab
- 📝 **Smart Title Extraction**: Automatically uses page title as filename
- 🔄 **Rich HTML Support**:
  - Headings (H1-H6)
  - Paragraphs, bold, italic
  - Links and images
  - Code blocks (inline & block)
  - Lists (ordered/unordered)
  - Tables
  - Blockquotes

### Quick Start

1. **Generate Icons**:
   - Open `icons/generate-icons.html` in your browser
   - Click "Download All Icons"
   - Save the downloaded PNG files to the `icons/` folder

2. **Load Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `web-to-markdown` folder

3. **Start Converting**:
   - Click the extension icon in Chrome toolbar
   - Choose your mode (Single URL, Batch, or Bookmark Folder)
   - Convert and save!

### Usage Modes

#### Single URL Mode
Perfect for converting individual pages with full control over filename and save location.

#### Batch Processing Mode
Paste multiple URLs (one per line) and convert them all at once. All files auto-save to Downloads folder.

#### Bookmark Folder Mode
1. Click "Load Bookmark Folders"
2. Select a folder from dropdown
3. See URL count preview
4. Convert all bookmarks (including subfolders)

### Supported Platforms

| Platform | Support |
|----------|---------|
| **Confluence** | ✅ Cloud/Server, automatic title extraction |
| **Notion** | ✅ Public pages |
| **Medium, Blogs** | ✅ Most blog platforms |
| **GitHub** | ✅ Wiki, README, documentation |
| **Stack Overflow** | ✅ Q&A pages |
| **Others** | ✅ Any page with HTML content |

### AI Agent Integration

Save converted markdown files directly to AI agent reference directories:

```
C:\Users\username\.claude\web-docs\
C:\Users\username\Documents\agent-knowledge\
~/Documents/ai-reference/
```

**Tip**: Enable "Choose save location" checkbox to select your AI agent's reference directory.

### Technical Details

- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (zero dependencies)
- **Content Script**: Direct DOM access for current tab
- **Regex-based Conversion**: Service Worker compatible
- **Chrome Storage API**: Settings persistence
- **Chrome Downloads API**: File download management
- **Chrome Bookmarks API**: Bookmark folder access

### Project Structure

```
web-to-markdown/
├── manifest.json           # Extension configuration (Manifest V3)
├── popup.html             # Popup UI
├── popup.css              # Popup styles
├── popup.js               # Popup logic (Blob creation, downloads)
├── background.js          # Service worker (fetch, conversion)
├── content.js             # Content script (DOM extraction)
├── icons/
│   ├── icon.svg          # SVG source
│   ├── generate-icons.html  # PNG generation tool
│   ├── icon16.png        # 16x16 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md
```

### Known Limitations

1. **Authentication Required**: You must be logged in to access protected pages
2. **Permissions Required**: You need read access to the pages
3. **Dynamic Content**: JavaScript-loaded content may not be captured
4. **Attachments**: File attachments are included as links only
5. **Complex Layouts**: Very complex CSS layouts may be simplified

### Troubleshooting

**"Failed to fetch page" error**:
- Ensure you're logged in to the site
- Verify you have read permissions
- Check URL format (include http:// or https://)
- Some sites may block requests due to CORS policies

**Title showing as "WIKI.md" or "untitled.md"**:
- For current tab: Use "Get Current Tab URL" button for better accuracy
- Specify a custom filename
- Ensure the page has a proper title tag

**Icons not displaying**:
- Generate PNG icons using `icons/generate-icons.html`
- Ensure PNG files are in the `icons/` folder
- Reload the extension

### Development

**Debugging**:
1. **Popup**: Right-click popup → Inspect
2. **Background Script**: `chrome://extensions/` → "Service Worker" → Inspect
3. **Content Script**: F12 on page → Console tab

**Testing**:
```javascript
// Test page data extraction
chrome.tabs.sendMessage(tabId, {action: 'extractPageData'}, response => {
  console.log(response);
});

// Test markdown conversion
console.log(convertHtmlToMarkdownSimple(html, title));
```

### Contributing

Contributions are welcome! Please feel free to submit bug reports or feature requests via [GitHub Issues](https://github.com/mok2-pubg/web-to-markdown/issues).

### License

MIT License - see [LICENSE](LICENSE) file for details

### Credits

Made with Claude Code
