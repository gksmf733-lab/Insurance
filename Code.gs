// ===== 기존 doPost 함수에 텔레그램 알림 한 줄만 추가하세요 =====
// 기존 코드를 아래와 같이 수정:

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.submittedAt,
    data.name,
    data.phone,
    data.gender,
    data.birthYear,
    data.region,
    data.disease,
    data.insuranceType
  ]);

  // ★ 텔레그램 알림 전송 (이 한 줄만 추가!)
  sendTelegramNotification(data);

  return ContentService.createTextOutput(
    JSON.stringify({ result: 'success' })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ===== 아래 코드를 기존 doPost 함수 밑에 전부 붙여넣으세요 =====

var TELEGRAM_BOT_TOKEN = '8544166671:AAHI3xKCFuju3MxXpXfA5fuhk8n3vU7gAgA';
var TELEGRAM_CHAT_ID = '5806002598';

function sendTelegramNotification(data) {
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
    + '🕐 접수시간: ' + (data.submittedAt || '-');

  var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    }),
    muteHttpExceptions: true
  });
}
