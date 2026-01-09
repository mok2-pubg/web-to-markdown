# Confluence to Markdown Chrome Extension

Confluence 페이지를 Markdown 형식으로 변환하고 로컬에 저장하는 크롬 확장프로그램입니다. AI 에이전트가 참조할 수 있는 문서를 쉽게 생성할 수 있습니다.

## 주요 기능

- Confluence 페이지 URL을 입력하여 Markdown으로 변환
- 현재 탭의 URL을 자동으로 가져오기
- 사용자 지정 저장 경로 설정
- 자동 파일 다운로드
- HTML 요소를 Markdown 형식으로 변환:
  - 제목 (H1-H6)
  - 단락, 굵게, 기울임
  - 링크 및 이미지
  - 코드 블록
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
5. `confluence-to-md-extension` 폴더를 선택합니다

## 사용 방법

### 기본 사용법

1. Chrome 툴바에서 확장프로그램 아이콘을 클릭합니다
2. Confluence 페이지 URL을 입력하거나 "현재 탭 URL 가져오기" 버튼을 클릭합니다
3. 저장 경로를 설정합니다 (예: `C:/Users/mok2/confluence-docs/`)
4. (선택사항) 파일명을 지정합니다 (비워두면 페이지 제목 사용)
5. "Markdown으로 변환 및 저장" 버튼을 클릭합니다

### 에이전트 연동 설정

AI 에이전트가 문서를 참조할 수 있도록 특정 경로에 저장하는 것을 권장합니다:

```
C:/Users/mok2/.claude/confluence-docs/
C:/Users/mok2/Documents/agent-knowledge/
```

저장 경로는 확장프로그램에 자동으로 저장되므로 한 번 설정하면 계속 사용됩니다.

## 프로젝트 구조

```
confluence-to-md-extension/
├── manifest.json           # 확장프로그램 설정
├── popup.html             # 팝업 UI
├── popup.css              # 팝업 스타일
├── popup.js               # 팝업 로직
├── background.js          # 백그라운드 서비스 워커
├── content.js             # 콘텐츠 스크립트
├── converter.js           # HTML to Markdown 변환 로직
├── icons/
│   ├── icon.svg          # SVG 아이콘 소스
│   ├── generate-icons.html  # PNG 생성 도구
│   ├── icon16.png        # 16x16 아이콘
│   ├── icon48.png        # 48x48 아이콘
│   └── icon128.png       # 128x128 아이콘
└── README.md
```

## 기술 스택

- Chrome Extension Manifest V3
- Vanilla JavaScript
- HTML/CSS
- DOMParser API
- Chrome Storage API
- Chrome Downloads API

## 지원하는 Confluence URL 형식

- Confluence Cloud: `https://domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title`
- Confluence Server: `https://domain.com/display/SPACE/Page+Title`
- Direct Page ID: `https://domain.com/pages/viewpage.action?pageId=123456`

## 알려진 제한사항

1. **인증 필요**: Confluence에 로그인되어 있어야 합니다
2. **권한 필요**: 페이지를 볼 수 있는 권한이 있어야 합니다
3. **복잡한 매크로**: 일부 Confluence 매크로는 완벽하게 변환되지 않을 수 있습니다
4. **첨부파일**: 첨부된 파일은 링크로만 포함됩니다

## 트러블슈팅

### "페이지를 가져오는데 실패했습니다" 오류

- Confluence에 로그인되어 있는지 확인하세요
- 페이지에 대한 읽기 권한이 있는지 확인하세요
- URL이 올바른지 확인하세요

### 아이콘이 표시되지 않음

- `icons/generate-icons.html`을 사용하여 PNG 아이콘을 생성했는지 확인하세요
- 생성된 PNG 파일이 `icons/` 폴더에 있는지 확인하세요

### 다운로드가 작동하지 않음

- Chrome에서 다운로드 권한을 허용했는지 확인하세요
- 저장 경로가 유효한지 확인하세요

## 개발 및 디버깅

### 디버깅 방법

1. **팝업 디버깅**: 팝업을 열고 마우스 오른쪽 클릭 → 검사
2. **백그라운드 스크립트**: `chrome://extensions/` → "Service Worker" 링크 클릭
3. **콘텐츠 스크립트**: 페이지에서 F12 → Console 탭

### 로그 확인

확장프로그램은 각 단계에서 콘솔에 로그를 출력합니다:

```javascript
console.log('Confluence page detected');
console.error('Conversion error:', error);
```

## 향후 개선 계획

- [ ] Confluence API 직접 사용 (더 안정적인 데이터 추출)
- [ ] 배치 변환 (여러 페이지 동시 변환)
- [ ] 첨부파일 다운로드 지원
- [ ] 변환 옵션 설정 (이미지 포함/제외 등)
- [ ] 페이지 계층 구조 유지
- [ ] 자동 동기화 기능

## 라이센스

MIT License

## 기여

버그 리포트나 기능 제안은 환영합니다!

## 작성자

Made with Claude Code
