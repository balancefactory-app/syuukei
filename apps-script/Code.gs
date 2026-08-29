/**
 * 入出金 自動仕分けアプリ (Google Apps Script)
 *
 * 入力(日付/金額/入出金先名/現金・振込/入金・出金/仕分け項目)を受け取り、
 * 「現金・振込 × 入金・出金」の組み合わせで 4 つの明細シートへ自動振り分けする。
 * 入出金先名は「入出金先マスタ」に自動学習され、次回以降はプルダウンから選ぶと
 * 現金/振込・入金/出金・仕分け項目が既定値として自動入力される(手動で変更も可)。
 */

// ---- シート名の定義（先々の変更はここだけ直せばよい） -----------------------
const SHEETS = {
  CASH_IN:  '現金売上明細',      // 現金 × 入金
  CASH_OUT: '現金出金明細',      // 現金 × 出金
  BANK_IN:  '銀行＆郵便局入金',  // 振込 × 入金
  BANK_OUT: '銀行＆郵便局出金',  // 振込 × 出金
  MASTER:   '入出金先マスタ',    // 入出金先の既定値を記憶する裏方シート
};

// 明細シートの見出し（4 シート共通。将来の解析用に全項目を各シートへ持たせる）
const DETAIL_HEADERS = ['日付', '入出金先名', '現金/振込', '入金/出金', '仕分け項目', '金額', 'メモ', '登録日時'];

// マスタシートの見出し
const MASTER_HEADERS = ['入出金先名', '既定_現金/振込', '既定_入金/出金', '既定_仕分け項目', '更新日時'];

// 選択肢の正規化
const KIND_OPTIONS = ['現金', '振込'];       // 現金/振込
const FLOW_OPTIONS = ['入金', '出金'];       // 入金/出金


// ---- Web アプリのエントリポイント -------------------------------------------
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('入出金入力')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** index.html から他ファイルを読み込む場合に使用（今回は単一ファイルだが将来用） */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// ---- 初期セットアップ（メニュー or 手動実行で1回だけ） ----------------------
/**
 * 4 つの明細シートとマスタシートを作成し、見出し行を用意する。
 * 既に存在する場合は作り直さない（安全に何度でも実行可能）。
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  [SHEETS.CASH_IN, SHEETS.CASH_OUT, SHEETS.BANK_IN, SHEETS.BANK_OUT].forEach(function (name) {
    ensureSheetWithHeaders_(ss, name, DETAIL_HEADERS);
  });
  ensureSheetWithHeaders_(ss, SHEETS.MASTER, MASTER_HEADERS);

  // 既定で作られる空の「シート1」があれば削除（ユーザーデータが無い場合のみ）
  const first = ss.getSheetByName('シート1') || ss.getSheetByName('Sheet1');
  if (first && ss.getSheets().length > 1 && first.getLastRow() === 0) {
    ss.deleteSheet(first);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('セットアップが完了しました。', '入出金アプリ', 5);
}

/** スプレッドシートを開いたときにメニューを追加 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('入出金アプリ')
    .addItem('初期セットアップ', 'setup')
    .addToUI();
}

function ensureSheetWithHeaders_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#efefef');
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}


// ---- フォーム初期化用データの取得 -------------------------------------------
/**
 * 入出金先マスタと既存の仕分け項目一覧を返す（フォームのプルダウン生成に使用）。
 * @return {{payees: Object[], categories: string[]}}
 */
function getFormData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName(SHEETS.MASTER);

  const payees = [];
  const categorySet = {};

  if (master && master.getLastRow() > 1) {
    const values = master.getRange(2, 1, master.getLastRow() - 1, MASTER_HEADERS.length).getValues();
    values.forEach(function (row) {
      const name = String(row[0]).trim();
      if (!name) return;
      const category = String(row[3]).trim();
      payees.push({
        name: name,
        kind: String(row[1]).trim(),      // 現金/振込
        flow: String(row[2]).trim(),      // 入金/出金
        category: category,               // 仕分け項目
      });
      if (category) categorySet[category] = true;
    });
  }

  // 明細シートで実際に使われている仕分け項目も候補に含める
  [SHEETS.CASH_IN, SHEETS.CASH_OUT, SHEETS.BANK_IN, SHEETS.BANK_OUT].forEach(function (sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return;
    const catCol = DETAIL_HEADERS.indexOf('仕分け項目') + 1;
    const cats = sheet.getRange(2, catCol, sheet.getLastRow() - 1, 1).getValues();
    cats.forEach(function (r) {
      const c = String(r[0]).trim();
      if (c) categorySet[c] = true;
    });
  });

  return {
    payees: payees,
    categories: Object.keys(categorySet).sort(),
    kindOptions: KIND_OPTIONS,
    flowOptions: FLOW_OPTIONS,
  };
}


// ---- 明細の登録 -------------------------------------------------------------
/**
 * フォームから受け取った 1 件を、該当する明細シートへ追記し、マスタを更新する。
 * @param {Object} entry {date, amount, payee, kind, flow, category, memo, updateMaster}
 * @return {{ok: boolean, sheet: string, message: string}}
 */
function submitEntry(entry) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30 * 1000); // 同時実行での取りこぼしを防ぐ
  try {
    // --- 入力チェック ---
    const payee = String(entry.payee || '').trim();
    const kind = String(entry.kind || '').trim();
    const flow = String(entry.flow || '').trim();
    const category = String(entry.category || '').trim();
    const memo = String(entry.memo || '').trim();

    if (!entry.date) throw new Error('日付を入力してください。');
    if (entry.amount === '' || entry.amount === null || isNaN(Number(entry.amount))) {
      throw new Error('金額を数値で入力してください。');
    }
    const amount = Number(entry.amount);
    if (amount < 0) throw new Error('金額は 0 以上で入力してください。');
    if (!payee) throw new Error('入出金先名を入力してください。');
    if (KIND_OPTIONS.indexOf(kind) === -1) throw new Error('現金/振込を選択してください。');
    if (FLOW_OPTIONS.indexOf(flow) === -1) throw new Error('入金/出金を選択してください。');
    if (!category) throw new Error('仕分け項目を入力してください。');

    // --- 振り分け先シートの決定（現金/振込 × 入金/出金） ---
    const targetName = resolveTargetSheet_(kind, flow);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ensureSheetWithHeaders_(ss, targetName, DETAIL_HEADERS);

    // --- 日付を Date として保存（表計算で扱いやすくする） ---
    const dateValue = parseDate_(entry.date);

    // --- 明細行を追記 ---
    const row = [dateValue, payee, kind, flow, category, amount, memo, new Date()];
    sheet.appendRow(row);

    // --- マスタを更新（新規追加 or 既定値の上書き） ---
    if (entry.updateMaster !== false) {
      upsertMaster_(ss, payee, kind, flow, category);
    }

    return { ok: true, sheet: targetName, message: '「' + targetName + '」に登録しました。' };
  } finally {
    lock.releaseLock();
  }
}

/** 現金/振込 × 入金/出金 から宛先シート名を返す */
function resolveTargetSheet_(kind, flow) {
  if (kind === '現金' && flow === '入金') return SHEETS.CASH_IN;
  if (kind === '現金' && flow === '出金') return SHEETS.CASH_OUT;
  if (kind === '振込' && flow === '入金') return SHEETS.BANK_IN;
  if (kind === '振込' && flow === '出金') return SHEETS.BANK_OUT;
  throw new Error('振り分け先を判定できませんでした（現金/振込・入金/出金の組み合わせが不正です）。');
}

/** 入出金先マスタに登録（既存なら既定値を上書き更新） */
function upsertMaster_(ss, payee, kind, flow, category) {
  const master = ensureSheetWithHeaders_(ss, SHEETS.MASTER, MASTER_HEADERS);
  const lastRow = master.getLastRow();
  const now = new Date();

  if (lastRow > 1) {
    const names = master.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (String(names[i][0]).trim() === payee) {
        // 既存 → 既定値を最新の入力で更新
        master.getRange(i + 2, 1, 1, MASTER_HEADERS.length)
          .setValues([[payee, kind, flow, category, now]]);
        return;
      }
    }
  }
  // 新規 → 追加
  master.appendRow([payee, kind, flow, category, now]);
}

/** 'YYYY-MM-DD' もしくは Date 文字列を Date に変換 */
function parseDate_(value) {
  if (value instanceof Date) return value;
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  throw new Error('日付の形式が正しくありません。');
}
