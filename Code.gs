// ============================================
// Google Apps Script - 보험 상담 접수 + 텔레그램 알림
// ============================================
// 사용법:
// 1. Google Sheets에서 [확장 프로그램] > [Apps Script] 클릭
// 2. 이 코드를 전체 복사하여 붙여넣기
// 3. getChatId() 함수를 먼저 실행하여 Chat ID 확인
// 4. 아래 TELEGRAM_CHAT_ID에 확인된 Chat ID 입력
// 5. [배포] > [새 배포] > 웹 앱으로 배포
// ============================================

var TELEGRAM_BOT_TOKEN = '8544166671:AAHI3xKCFuju3MxXpXfA5fuhk8n3vU7gAgA';
var TELEGRAM_CHAT_ID = '5806002598';

// ===== 텔레그램 봇에게 메시지를 보낸 후 이 함수를 실행하여 Chat ID를 확인하세요 =====
function getChatId() {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/getUpdates';
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());

  if (data.result && data.result.length > 0) {
    for (var i = 0; i < data.result.length; i++) {
      var msg = data.result[i].message;
      if (msg) {
        Logger.log('Chat ID: ' + msg.chat.id + ' | 보낸 사람: ' + (msg.chat.first_name || '') + ' ' + (msg.chat.last_name || ''));
      }
    }
  } else {
    Logger.log('메시지가 없습니다. 텔레그램에서 봇에게 아무 메시지나 먼저 보내주세요.');
  }
}

// ===== 웹 앱 POST 요청 처리 =====
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Google Sheets에 데이터 저장
    saveToSheet(data);

    // 텔레그램 알림 전송
    sendTelegramNotification(data);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost 에러: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== Google Sheets에 데이터 저장 =====
function saveToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('상담접수');

  // 시트가 없으면 생성
  if (!sheet) {
    sheet = ss.insertSheet('상담접수');
    sheet.appendRow(['접수일시', '이름', '전화번호', '성별', '출생연도', '지역', '질병여부', '보험종류']);

    // 헤더 스타일
    var headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1a2a4a');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // 접수일시 포맷팅
  var submittedAt = data.submittedAt || new Date().toISOString();
  var date = new Date(submittedAt);
  var formatted = Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  sheet.appendRow([
    formatted,
    data.name || '',
    data.phone || '',
    data.gender || '',
    data.birthYear || '',
    data.region || '',
    data.disease || '',
    data.insuranceType || ''
  ]);
}

// ===== 텔레그램 알림 전송 =====
function sendTelegramNotification(data) {
  if (!TELEGRAM_CHAT_ID) {
    Logger.log('TELEGRAM_CHAT_ID가 설정되지 않았습니다. getChatId() 함수를 먼저 실행하세요.');
    return;
  }

  var submittedAt = data.submittedAt || new Date().toISOString();
  var date = new Date(submittedAt);
  var formatted = Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  var message = '📋 *새 보험 상담 신청*\n'
    + '━━━━━━━━━━━━━━━\n'
    + '👤 이름: ' + (data.name || '-') + '\n'
    + '📞 연락처: ' + (data.phone || '-') + '\n'
    + '⚧ 성별: ' + (data.gender || '-') + '\n'
    + '🎂 출생연도: ' + (data.birthYear || '-') + '\n'
    + '📍 지역: ' + (data.region || '-') + '\n'
    + '🏥 질병여부: ' + (data.disease || '없음') + '\n'
    + '🛡 보험종류: ' + (data.insuranceType || '-') + '\n'
    + '━━━━━━━━━━━━━━━\n'
    + '🕐 접수시간: ' + formatted;

  var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

  var payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());

  if (!result.ok) {
    Logger.log('텔레그램 전송 실패: ' + response.getContentText());
  }
}

// ===== 테스트 함수 (수동 테스트용) =====
function testTelegram() {
  var testData = {
    submittedAt: new Date().toISOString(),
    name: '홍길동',
    phone: '010-1234-5678',
    gender: '남성',
    birthYear: '1990',
    region: '서울',
    disease: '없음',
    insuranceType: '실손보험, 암보험'
  };

  sendTelegramNotification(testData);
  Logger.log('테스트 알림 전송 완료');
}
