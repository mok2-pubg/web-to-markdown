// DOM 요소
const confluenceUrlInput = document.getElementById('confluenceUrl');
const fileNameInput = document.getElementById('fileName');
const batchUrlsTextarea = document.getElementById('batchUrls');
const manualSaveCheckbox = document.getElementById('manualSave');
const getCurrentUrlBtn = document.getElementById('getCurrentUrl');
const convertBtn = document.getElementById('convertBtn');
const statusDiv = document.getElementById('status');
const progressDiv = document.getElementById('progress');
const resultDiv = document.getElementById('result');
const singleModeDiv = document.getElementById('singleMode');
const batchModeDiv = document.getElementById('batchMode');
const bookmarkModeDiv = document.getElementById('bookmarkMode');
const bookmarkFolderSelect = document.getElementById('bookmarkFolder');
const loadBookmarksBtn = document.getElementById('loadBookmarks');
const bookmarkInfoDiv = document.getElementById('bookmarkInfo');
const selectedFolderNameSpan = document.getElementById('selectedFolderName');
const bookmarkCountSpan = document.getElementById('bookmarkCount');
const modeRadios = document.querySelectorAll('input[name="mode"]');

// 북마크 URL 저장
let bookmarkUrls = [];

// 저장된 설정 불러오기
chrome.storage.sync.get(['manualSave'], (result) => {
  if (result.manualSave !== undefined) {
    manualSaveCheckbox.checked = result.manualSave;
  } else {
    // 기본값: 수동 선택 활성화
    manualSaveCheckbox.checked = true;
  }
});

// 모드 토글
modeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const mode = e.target.value;
    singleModeDiv.style.display = 'none';
    batchModeDiv.style.display = 'none';
    bookmarkModeDiv.style.display = 'none';

    if (mode === 'single') {
      singleModeDiv.style.display = 'block';
      convertBtn.textContent = 'Markdown으로 변환 및 저장';
    } else if (mode === 'batch') {
      batchModeDiv.style.display = 'block';
      convertBtn.textContent = '일괄 변환 및 저장';
    } else if (mode === 'bookmark') {
      bookmarkModeDiv.style.display = 'block';
      convertBtn.textContent = '북마크 폴더 변환 및 저장';
    }
  });
});

// 북마크 폴더 불러오기
loadBookmarksBtn.addEventListener('click', async () => {
  try {
    const tree = await chrome.bookmarks.getTree();
    bookmarkFolderSelect.innerHTML = '<option value="">폴더를 선택하세요</option>';

    // 북마크 트리를 재귀적으로 탐색하여 폴더만 추출
    function traverseBookmarks(nodes, depth = 0) {
      nodes.forEach(node => {
        if (node.children) {
          // 폴더인 경우
          const indent = '　'.repeat(depth); // 들여쓰기
          const option = document.createElement('option');
          option.value = node.id;
          option.textContent = indent + (node.title || '(이름 없음)');
          bookmarkFolderSelect.appendChild(option);

          // 하위 폴더 탐색
          traverseBookmarks(node.children, depth + 1);
        }
      });
    }

    traverseBookmarks(tree);
    showStatus('북마크 폴더를 불러왔습니다', 'success');
  } catch (error) {
    showStatus('북마크를 불러오는데 실패했습니다: ' + error.message, 'error');
  }
});

// 북마크 폴더 선택 시 URL 개수 표시
bookmarkFolderSelect.addEventListener('change', async () => {
  const folderId = bookmarkFolderSelect.value;

  if (!folderId) {
    bookmarkInfoDiv.style.display = 'none';
    bookmarkUrls = [];
    return;
  }

  try {
    const folder = await chrome.bookmarks.getSubTree(folderId);
    const urls = [];

    // 선택된 폴더 내의 모든 URL 추출 (재귀적)
    function extractUrls(nodes) {
      nodes.forEach(node => {
        if (node.url) {
          // URL이 있는 북마크
          urls.push(node.url);
        }
        if (node.children) {
          // 하위 폴더가 있으면 재귀 탐색
          extractUrls(node.children);
        }
      });
    }

    extractUrls(folder);
    bookmarkUrls = urls;

    // 폴더 이름과 URL 개수 표시
    const folderName = folder[0].title || '(이름 없음)';
    selectedFolderNameSpan.textContent = folderName;
    bookmarkCountSpan.textContent = urls.length;
    bookmarkInfoDiv.style.display = 'block';

    showStatus(`${urls.length}개의 북마크를 찾았습니다`, 'success');
  } catch (error) {
    showStatus('북마크 정보를 가져오는데 실패했습니다: ' + error.message, 'error');
  }
});

// 현재 탭 URL 가져오기
getCurrentUrlBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      confluenceUrlInput.value = tab.url;
      showStatus('현재 탭 URL을 가져왔습니다', 'info');
    }
  } catch (error) {
    showStatus('URL을 가져오는데 실패했습니다: ' + error.message, 'error');
  }
});

// 변환 및 저장
convertBtn.addEventListener('click', async () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;

  if (mode === 'batch') {
    await handleBatchConversion();
  } else if (mode === 'bookmark') {
    await handleBookmarkConversion();
  } else {
    await handleSingleConversion();
  }
});

// 단일 URL 변환
async function handleSingleConversion() {
  const url = confluenceUrlInput.value.trim();
  const fileName = fileNameInput.value.trim();
  const manualSave = manualSaveCheckbox.checked;

  // 유효성 검사
  if (!url) {
    showStatus('Web Page URL을 입력해주세요', 'error');
    return;
  }

  // 설정 저장
  chrome.storage.sync.set({ manualSave });

  // UI 상태 업데이트
  convertBtn.disabled = true;
  showStatus('페이지를 가져오는 중...', 'info');
  progressDiv.style.display = 'block';
  resultDiv.classList.remove('show');

  try {
    // 현재 탭 확인
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let response;

    // 현재 탭의 URL과 일치하면 content script 사용 시도
    if (tab && tab.url === url) {
      try {
        showStatus('현재 페이지에서 콘텐츠 추출 중...', 'info');

        // content script에서 페이지 데이터 추출 시도
        const contentResponse = await chrome.tabs.sendMessage(tab.id, {
          action: 'extractPageData'
        });

        if (contentResponse && contentResponse.success) {
          // background.js에 변환 요청
          response = await chrome.runtime.sendMessage({
            action: 'convertFromContent',
            pageData: contentResponse.data,
            fileName: fileName
          });
        } else {
          throw new Error('Content script 응답 없음');
        }
      } catch (contentError) {
        // Content script 실패 시 fallback으로 fetch 사용
        console.log('Content script 사용 실패, fetch로 fallback:', contentError);
        showStatus('페이지 가져오는 중... (fallback)', 'info');
        response = await chrome.runtime.sendMessage({
          action: 'convertToMarkdown',
          url: url,
          fileName: fileName
        });
      }
    } else {
      // 외부 URL은 background.js에서 fetch
      showStatus('페이지 가져오는 중...', 'info');
      response = await chrome.runtime.sendMessage({
        action: 'convertToMarkdown',
        url: url,
        fileName: fileName
      });
    }

    if (response.success) {
      showStatus('변환 완료!', 'success');

      // 다운로드 처리
      if (response.markdown) {
        // 결과 표시
        const displayPath = manualSave ? '사용자가 선택한 위치' : `다운로드/${response.fileName}`;
        resultDiv.textContent = `파일명: ${response.fileName}\n저장 위치: ${displayPath}\n\n미리보기:\n${response.preview}`;
        resultDiv.classList.add('show');

        if (manualSave) {
          showStatus('저장 위치를 선택하세요...', 'info');
        } else {
          showStatus('파일 저장 중...', 'info');
        }

        // Blob 생성 및 다운로드
        const blob = new Blob([response.markdown], { type: 'text/markdown' });
        const downloadUrl = URL.createObjectURL(blob);

        await downloadFile(downloadUrl, response.fileName, manualSave);

        // Blob URL 해제
        URL.revokeObjectURL(downloadUrl);

        showStatus('파일이 저장되었습니다!', 'success');
      }
    } else {
      showStatus('오류: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('오류: ' + error.message, 'error');
  } finally {
    convertBtn.disabled = false;
    progressDiv.style.display = 'none';
  }
}

// 일괄 URL 변환
async function handleBatchConversion() {
  const batchText = batchUrlsTextarea.value.trim();
  // 일괄 처리는 항상 자동으로 Downloads 폴더에 저장
  const manualSave = false;

  // 유효성 검사
  if (!batchText) {
    showStatus('URL 목록을 입력해주세요', 'error');
    return;
  }

  // URL 파싱 (줄바꿈으로 구분)
  const urls = batchText
    .split('\n')
    .map(url => url.trim())
    .filter(url => url && url.startsWith('http'));

  if (urls.length === 0) {
    showStatus('유효한 URL이 없습니다', 'error');
    return;
  }

  // UI 상태 업데이트
  convertBtn.disabled = true;
  progressDiv.style.display = 'block';
  resultDiv.classList.remove('show');

  const results = {
    total: urls.length,
    success: 0,
    failed: 0,
    errors: []
  };

  // 순차적으로 변환
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    showStatus(`처리 중... (${i + 1}/${urls.length}): ${url}`, 'info');

    try {
      // 현재 탭 확인
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      let response;

      // 현재 탭의 URL과 일치하면 content script 사용 시도
      if (tab && tab.url === url) {
        try {
          const contentResponse = await chrome.tabs.sendMessage(tab.id, {
            action: 'extractPageData'
          });

          if (contentResponse && contentResponse.success) {
            response = await chrome.runtime.sendMessage({
              action: 'convertFromContent',
              pageData: contentResponse.data,
              fileName: ''
            });
          } else {
            throw new Error('Content script 응답 없음');
          }
        } catch (contentError) {
          // Fallback to fetch
          response = await chrome.runtime.sendMessage({
            action: 'convertToMarkdown',
            url: url,
            fileName: ''
          });
        }
      } else {
        // 외부 URL은 background.js에서 fetch
        response = await chrome.runtime.sendMessage({
          action: 'convertToMarkdown',
          url: url,
          fileName: ''
        });
      }

      if (response.success && response.markdown) {
        // Blob 생성 및 다운로드
        const blob = new Blob([response.markdown], { type: 'text/markdown' });
        const downloadUrl = URL.createObjectURL(blob);

        // 일괄 처리는 모두 자동으로 Downloads 폴더에 저장
        await downloadFile(downloadUrl, response.fileName, false);

        URL.revokeObjectURL(downloadUrl);
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`${url}: ${response.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`${url}: ${error.message}`);
    }

    // 요청 간 짧은 딜레이 (서버 부하 방지)
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 결과 표시
  progressDiv.style.display = 'none';
  convertBtn.disabled = false;

  let resultMessage = `완료! 성공: ${results.success}, 실패: ${results.failed}`;
  if (results.errors.length > 0) {
    resultMessage += '\n\n실패한 URL:\n' + results.errors.join('\n');
    showStatus(resultMessage, results.failed > 0 ? 'error' : 'success');
  } else {
    showStatus(resultMessage, 'success');
  }

  resultDiv.textContent = resultMessage;
  resultDiv.classList.add('show');
}

// 북마크 폴더 변환
async function handleBookmarkConversion() {
  // 북마크 URL이 없으면 오류
  if (bookmarkUrls.length === 0) {
    showStatus('북마크 폴더를 선택하고 URL을 불러와주세요', 'error');
    return;
  }

  const urls = bookmarkUrls;
  // 북마크 폴더 변환은 항상 자동으로 Downloads 폴더에 저장
  const manualSave = false;

  // UI 상태 업데이트
  convertBtn.disabled = true;
  progressDiv.style.display = 'block';
  resultDiv.classList.remove('show');

  const results = {
    total: urls.length,
    success: 0,
    failed: 0,
    errors: []
  };

  // 순차적으로 변환
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    showStatus(`처리 중... (${i + 1}/${urls.length}): ${url}`, 'info');

    try {
      // 현재 탭 확인
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      let response;

      // 현재 탭의 URL과 일치하면 content script 사용 시도
      if (tab && tab.url === url) {
        try {
          const contentResponse = await chrome.tabs.sendMessage(tab.id, {
            action: 'extractPageData'
          });

          if (contentResponse && contentResponse.success) {
            response = await chrome.runtime.sendMessage({
              action: 'convertFromContent',
              pageData: contentResponse.data,
              fileName: ''
            });
          } else {
            throw new Error('Content script 응답 없음');
          }
        } catch (contentError) {
          // Fallback to fetch
          response = await chrome.runtime.sendMessage({
            action: 'convertToMarkdown',
            url: url,
            fileName: ''
          });
        }
      } else {
        // 외부 URL은 background.js에서 fetch
        response = await chrome.runtime.sendMessage({
          action: 'convertToMarkdown',
          url: url,
          fileName: ''
        });
      }

      if (response.success && response.markdown) {
        // Blob 생성 및 다운로드
        const blob = new Blob([response.markdown], { type: 'text/markdown' });
        const downloadUrl = URL.createObjectURL(blob);

        // 북마크 폴더 변환은 모두 자동으로 Downloads 폴더에 저장
        await downloadFile(downloadUrl, response.fileName, false);

        URL.revokeObjectURL(downloadUrl);
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`${url}: ${response.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`${url}: ${error.message}`);
    }

    // 요청 간 짧은 딜레이 (서버 부하 방지)
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 결과 표시
  progressDiv.style.display = 'none';
  convertBtn.disabled = false;

  let resultMessage = `완료! 성공: ${results.success}, 실패: ${results.failed}`;
  if (results.errors.length > 0) {
    resultMessage += '\n\n실패한 URL:\n' + results.errors.join('\n');
    showStatus(resultMessage, results.failed > 0 ? 'error' : 'success');
  } else {
    showStatus(resultMessage, 'success');
  }

  resultDiv.textContent = resultMessage;
  resultDiv.classList.add('show');
}

// 파일 다운로드
async function downloadFile(url, fileName, saveAs = false) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({
      url: url,
      filename: fileName,
      saveAs: saveAs
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(downloadId);
      }
    });
  });
}

// 상태 메시지 표시
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

// Enter 키로 변환 실행
confluenceUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    convertBtn.click();
  }
});
