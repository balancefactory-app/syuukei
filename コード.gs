const TOKEN = '34162141d2854aa4bc39343aeb7b5c0a';
const SHEET_NAME = '伝票 入出金';
const LOG_SHEET_NAME = '集計ログ';

// 自動実行トリガーの発火時刻（0〜23時。JST基準。appsscript.jsonでtimeZoneをAsia/Tokyoに固定）
const TRIGGER_HOUR = 6;

const CAT_COL = {
  '加圧': 3, 'マッサージ': 4, 'バランス': 5, '鍼・よくばり': 6,
  '小顔': 7, 'PST/PYG': 8, 'YOGA': 9, '体操': 10,
  'スマホ': 11, 'その他': 12, 'プリカ': 13, '水': 15
};

function fetch_(url) {
  return JSON.parse(UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {'Authorization': 'Bearer ' + TOKEN},
    muteHttpExceptions: true
  }).getContentText());
}

function buildItemMap() {
  var cats = {};
  fetch_('https://api.loyverse.com/v1.0/categories?limit=50').categories.forEach(function(c) {
    cats[c.id] = c.name;
  });
  var map = {};
  var cursor = null;
  do {
    var url = 'https://api.loyverse.com/v1.0/items?limit=250' + (cursor ? '&cursor=' + cursor : '');
    var data = fetch_(url);
    data.items.forEach(function(item) {
      var cat = cats[item.category_id] || '';
      map[item.id] = cat;
      if (item.variants) item.variants.forEach(function(v) {
        if (v.variant_id) map[v.variant_id] = cat;
        if (v.item_id) map[v.item_id] = cat;
      });
    });
    cursor = data.cursor || null;
  } while (cursor);
  return map;
}

// 指定したJST日付（Dateオブジェクト、時刻部分は無視）の売上を集計する共通関数
//
// 【重要】created_atだけで絞り込むと、サーバー側の記録タイミングのズレにより
// 表示上は対象日のレシートなのに範囲から漏れることがある（実例:2026/08/13で発生）。
// そのため取得自体は前後1日分バッファを持たせて広めに行い、
// 実際の取引時刻(receipt_date)がJSTで対象日と一致するものだけを採用する。
function aggregateForDate_(targetDate) {
  var itemMap = buildItemMap();

  var jstDay = new Date(targetDate.getTime() + 9 * 60 * 60 * 1000);
  jstDay.setUTCHours(0, 0, 0, 0);
  var dateStr = Utilities.formatDate(jstDay, 'UTC', 'yyyy/MM/dd');

  var bufferFromUTC = new Date(jstDay.getTime() - 9 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  var bufferToUTC = new Date(jstDay.getTime() - 9 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000 - 1);

  var totals = {};
  for (var k in CAT_COL) totals[k] = 0;

  var unmatched = [];  // カテゴリに紐づかなかった商品（要調査）
  var excluded = [];   // SALE以外として除外されたレシート（要調査）
  var receiptCount = 0;

  var cursor = null;
  do {
    var url = 'https://api.loyverse.com/v1.0/receipts?created_at_min=' + encodeURIComponent(bufferFromUTC.toISOString()) +
               '&created_at_max=' + encodeURIComponent(bufferToUTC.toISOString()) + '&limit=250' +
               (cursor ? '&cursor=' + cursor : '');
    var data = fetch_(url);
    if (!data.receipts) break;

    data.receipts.forEach(function(r) {
      var receiptDateStr = Utilities.formatDate(new Date(r.receipt_date || r.created_at), 'Asia/Tokyo', 'yyyy/MM/dd');
      if (receiptDateStr !== dateStr) return; // 対象日以外（バッファ分）は無視

      receiptCount++;
      if (r.receipt_type !== 'SALE') {
        excluded.push(r.receipt_number + '(type=' + r.receipt_type + ')');
        return;
      }
      if (r.cancelled_at) {
        excluded.push(r.receipt_number + '(cancelled)');
        return;
      }
      r.line_items.forEach(function(it) {
        var cat = itemMap[it.item_id] || itemMap[it.variant_id] || '';
        if (cat && totals.hasOwnProperty(cat)) {
          totals[cat] += it.total_money;
        } else {
          unmatched.push(r.receipt_number + ':' + (it.item_name || it.item_id || it.variant_id));
        }
      });
    });
    cursor = data.cursor || null;
  } while (cursor);

  return {
    dateStr: dateStr,
    totals: totals,
    receiptCount: receiptCount,
    unmatched: unmatched,
    excluded: excluded
  };
}

function writeLog_(result) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = ss.getSheetByName(LOG_SHEET_NAME);
  if (!log) {
    log = ss.insertSheet(LOG_SHEET_NAME);
    log.appendRow(['実行日時', '対象日', 'レシート件数', '未分類商品(要確認)', '除外レシート(要確認)']);
    log.setFrozenRows(1);
  }
  log.appendRow([
    new Date(),
    result.dateStr,
    result.receiptCount,
    result.unmatched.join(' / '),
    result.excluded.join(' / ')
  ]);
}

function writeTotals_(dateStr, totals) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();
  var targetRow = -1;
  for (var i = 19; i <= lastRow; i++) {
    var v = sheet.getRange(i, 2).getValue();
    if (!v) continue;
    if (Utilities.formatDate(new Date(v), 'Asia/Tokyo', 'yyyy/MM/dd') === dateStr) {
      targetRow = i;
      break;
    }
  }
  if (targetRow === -1) {
    Logger.log('行が見つかりません: ' + dateStr);
    return false;
  }
  for (var cat in CAT_COL) {
    // 売上が0の項目は空白にする（0は書き込まない）
    sheet.getRange(targetRow, CAT_COL[cat]).setValue(totals[cat] ? totals[cat] : '');
  }
  Logger.log('完了: ' + dateStr + ' → ' + targetRow + '行目');
  return true;
}

// 毎日ボタンで押す用／自動トリガーからも呼ばれる：前日分を集計
function shukei() {
  var now = new Date();
  var yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  var result = aggregateForDate_(yesterday);
  var written = writeTotals_(result.dateStr, result.totals);
  writeLog_(result);
  return written;
}

// 過去の特定日を再集計したいときに使う
// 例: 8/13を再集計したいなら shukeiForDate(2026, 8, 13) を実行
function shukeiForDate(y, m, d) {
  var target = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  var result = aggregateForDate_(target);
  writeTotals_(result.dateStr, result.totals);
  writeLog_(result);
}

// ============================================================
// 自動実行（時間主導型トリガー）まわり
// ============================================================

// 毎朝TRIGGER_HOUR時台に shukei を自動実行するトリガーを作成する。
// 二重登録を防ぐため、既存の shukei トリガーはいったん全削除してから作り直す。
// ※初回のみ、スクリプトエディタからこの関数を1度手動実行して承認してください。
function setupDailyTrigger() {
  removeDailyTrigger_();
  ScriptApp.newTrigger('shukei')
    .timeBased()
    .everyDays(1)
    .atHour(TRIGGER_HOUR)
    .create();
  Logger.log('自動実行トリガーを設定しました（毎日 ' + TRIGGER_HOUR + '時台に shukei を実行）');
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '毎朝 ' + TRIGGER_HOUR + '時台に前日分を自動集計します', '自動実行ON', 5);
  } catch (e) {}
}

// shukei に紐づく時間主導型トリガーをすべて削除する（自動実行OFF）
function removeDailyTrigger_() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'shukei') {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log('削除したトリガー数: ' + removed);
  return removed;
}

// メニュー用：自動実行を停止する
function stopDailyTrigger() {
  var n = removeDailyTrigger_();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '自動実行を停止しました（削除 ' + n + ' 件）', '自動実行OFF', 5);
  } catch (e) {}
}

// メニュー用：現在の自動実行トリガーの有無を確認する
function checkDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var count = triggers.filter(function(t) {
    return t.getHandlerFunction() === 'shukei';
  }).length;
  var msg = count > 0
    ? '自動実行は【ON】です（毎朝 ' + TRIGGER_HOUR + '時台に前日分を集計）'
    : '自動実行は【OFF】です。メニューから「自動実行をON」を選んでください。';
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {
    Logger.log(msg);
  }
}

// スプレッドシートを開いたとき、伝票 入出金シートの「当日(JST)」の行へスクロールする。
// B列(2列目)の日付が今日と一致する行を探して選択（カーソル移動）する。
function scrollToToday_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  var todayStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
  var lastRow = sheet.getLastRow();
  for (var i = 19; i <= lastRow; i++) {
    var v = sheet.getRange(i, 2).getValue();
    if (!v) continue;
    if (Utilities.formatDate(new Date(v), 'Asia/Tokyo', 'yyyy/MM/dd') === todayStr) {
      sheet.activate();
      var cell = sheet.getRange(i, 2);
      sheet.setActiveRange(cell); // 当日行を選択してその位置までスクロール
      return;
    }
  }
}

function onOpen() {
  scrollToToday_();
  SpreadsheetApp.getUi().createMenu('売上集計')
    .addItem('前日集計を今すぐ実行', 'shukei')
    .addSeparator()
    .addItem('自動実行をON（毎朝' + TRIGGER_HOUR + '時台）', 'setupDailyTrigger')
    .addItem('自動実行をOFF', 'stopDailyTrigger')
    .addItem('自動実行の状態を確認', 'checkDailyTrigger')
    .addToUi();
}

// 指定日の全レシート・全明細を「商品名 → 判定カテゴリ → 金額」の形でそのままログ出力する診断用関数
// 例: debugCategorize(2026, 8, 13) を実行してログを確認
function debugCategorize(y, m, d) {
  var itemMap = buildItemMap();
  var target = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  var jstDay = new Date(target.getTime() + 9 * 60 * 60 * 1000);
  jstDay.setUTCHours(0, 0, 0, 0);
  var dateStr = Utilities.formatDate(jstDay, 'UTC', 'yyyy/MM/dd');
  var bufferFromUTC = new Date(jstDay.getTime() - 9 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  var bufferToUTC = new Date(jstDay.getTime() - 9 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000 - 1);

  Logger.log('=== 対象日: ' + dateStr + ' ===');

  var cursor = null;
  var receiptNum = 0;
  do {
    var url = 'https://api.loyverse.com/v1.0/receipts?created_at_min=' + encodeURIComponent(bufferFromUTC.toISOString()) +
               '&created_at_max=' + encodeURIComponent(bufferToUTC.toISOString()) + '&limit=250' +
               (cursor ? '&cursor=' + cursor : '');
    var data = fetch_(url);
    if (!data.receipts) break;

    data.receipts.forEach(function(r) {
      var jstReceiptTime = Utilities.formatDate(new Date(r.receipt_date || r.created_at), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
      var receiptDateStr = jstReceiptTime.substring(0, 10).replace(/-/g, '/');
      if (receiptDateStr !== dateStr) return; // バッファ分（対象日以外）は無視
      receiptNum++;
      Logger.log('--- レシート#' + r.receipt_number + ' | type=' + r.receipt_type + ' | cancelled=' + !!r.cancelled_at + ' | 時刻(JST)=' + jstReceiptTime + ' ---');
      r.line_items.forEach(function(it) {
        var cat = itemMap[it.item_id] || itemMap[it.variant_id] || '(未分類)';
        Logger.log('   商品名=' + it.item_name + ' | item_id=' + it.item_id + ' | variant_id=' + it.variant_id + ' | 金額=' + it.total_money + ' | 判定カテゴリ=' + cat);
      });
    });
    cursor = data.cursor || null;
  } while (cursor);

  Logger.log('=== 合計レシート数: ' + receiptNum + ' ===');
}

function 再集計() {
  shukeiForDate(2026, 8, 13);
  shukeiForDate(2026, 8, 14);
}
