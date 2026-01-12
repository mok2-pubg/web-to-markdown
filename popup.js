// DOM 요소
const confluenceUrlInput = document.getElementById('confluenceUrl');
const savePathInput = document.getElementById('savePath');
const fileNameInput = document.getElementById('fileName');
const manualSaveCheckbox = document.getElementById('manualSave');
const getCurrentUrlBtn = document.getElementById('getCurrentUrl');
const convertBtn = document.getElementById('convertBtn');
const statusDiv = document.getElementById('status');
const progressDiv = document.getElementById('progress');
const resultDiv = document.getElementById('result');

// 저장된 설정 불러오기
chrome.storage.sync.get(['savePath', 'manualSave'], (result) => {
  if (result.savePath) {
    savePathInput.value = result.savePath;
  }
  if (result.manualSave !== undefined) {
    manualSaveCheckbox.checked = result.manualSave;
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
  const url = confluenceUrlInput.value.trim();
  let savePath = savePathInput.value.trim();
  const fileName = fileNameInput.value.trim();
  const manualSave = manualSaveCheckbox.checked;

  // 유효성 검사
  if (!url) {
    showStatus('Web Page URL을 입력해주세요', 'error');
    return;
  }

  // 설정 저장
  chrome.storage.sync.set({ savePath, manualSave });

  // 절대 경로를 상대 경로로 변환
  if (savePath && savePath.includes(':')) {
    // Windows 절대 경로 (C:\Users\...)
    const parts = savePath.split(/[\\\/]/);
    const downloadsIndex = parts.findIndex(p => p.toLowerCase() === 'downloads');
    if (downloadsIndex !== -1 && downloadsIndex < parts.length - 1) {
      savePath = parts.slice(downloadsIndex + 1).join('/');
      savePathInput.value = savePath;
      showStatus(`경로를 상대 경로로 변환했습니다: ${savePath}`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

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
        // 다운로드 파일명 결정
        let downloadFileName = response.fileName;

        // 수동 저장이 아니고 저장 경로가 있으면 경로 포함
        if (!manualSave && savePath) {
          // 슬래시 정규화
          const normalizedPath = savePath.replace(/\\/g, '/').replace(/\/+$/, '');
          downloadFileName = normalizedPath + '/' + response.fileName;
        }

        // 결과 표시
        const displayPath = manualSave
          ? '사용자가 선택한 위치'
          : savePath
            ? `다운로드/${savePath}${response.fileName}`
            : `다운로드/${response.fileName}`;
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

        await downloadFile(downloadUrl, downloadFileName, manualSave);

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
});

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
