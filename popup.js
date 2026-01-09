// DOM 요소
const confluenceUrlInput = document.getElementById('confluenceUrl');
const savePathInput = document.getElementById('savePath');
const fileNameInput = document.getElementById('fileName');
const autoDownloadCheckbox = document.getElementById('autoDownload');
const getCurrentUrlBtn = document.getElementById('getCurrentUrl');
const convertBtn = document.getElementById('convertBtn');
const statusDiv = document.getElementById('status');
const progressDiv = document.getElementById('progress');
const resultDiv = document.getElementById('result');

// 저장된 설정 불러오기
chrome.storage.sync.get(['savePath', 'autoDownload'], (result) => {
  if (result.savePath) {
    savePathInput.value = result.savePath;
  }
  if (result.autoDownload !== undefined) {
    autoDownloadCheckbox.checked = result.autoDownload;
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
  const savePath = savePathInput.value.trim();
  const fileName = fileNameInput.value.trim();
  const autoDownload = autoDownloadCheckbox.checked;

  // 유효성 검사
  if (!url) {
    showStatus('Web Page URL을 입력해주세요', 'error');
    return;
  }

  if (!savePath) {
    showStatus('저장 경로를 입력해주세요', 'error');
    return;
  }

  // 설정 저장
  chrome.storage.sync.set({ savePath, autoDownload });

  // UI 상태 업데이트
  convertBtn.disabled = true;
  showStatus('페이지를 가져오는 중...', 'info');
  progressDiv.style.display = 'block';
  resultDiv.classList.remove('show');

  try {
    // background.js에 메시지 전송
    const response = await chrome.runtime.sendMessage({
      action: 'convertToMarkdown',
      url: url,
      savePath: savePath,
      fileName: fileName,
      autoDownload: autoDownload
    });

    if (response.success) {
      showStatus('변환 완료!', 'success');
      resultDiv.textContent = `파일명: ${response.fileName}\n경로: ${response.savePath}\n\n미리보기:\n${response.preview}`;
      resultDiv.classList.add('show');

      // 다운로드 처리
      if (autoDownload && response.downloadUrl) {
        showStatus('파일 다운로드 중...', 'info');
        await downloadFile(response.downloadUrl, response.fileName);
        showStatus('파일이 다운로드되었습니다!', 'success');
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
async function downloadFile(url, fileName) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({
      url: url,
      filename: fileName,
      saveAs: false
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
