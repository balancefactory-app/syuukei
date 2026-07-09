import type { PhraseBank } from "@/lib/types";

/**
 * カテゴリID → フレーズ配列（約60フレーズ）。
 * プロトタイプの PHRASES オブジェクトをそのまま移植。
 */
export const PHRASES: PhraseBank = {
  salon: [
    { ja: "バランスファクトリーへようこそ", simple: "Welcome to our salon.", natural: "Welcome to Balance Factory.", kana: "ウェルカム トゥ バランス ファクトリー", useCase: "最初の挨拶", note: "" },
    { ja: "この建物は築100年ほどの古民家です", simple: "This is an old house.", natural: "This building is an old Japanese house, about 100 years old.", kana: "ディス ビルディング イズ アン オールド ジャパニーズ ハウス、アバウト ワン ハンドレッド イヤーズ オールド", useCase: "建物について聞かれたとき", note: "" },
    { ja: "藤沢市片瀬山にあります、江ノ島からすぐです", simple: "We are near Enoshima.", natural: "We're located in Katase-yama, Fujisawa, just a short trip from Enoshima.", kana: "ウィアー ロケイテッド イン カタセヤマ、フジサワ、ジャスト ア ショート トリップ フロム エノシマ", useCase: "アクセスを説明するとき", note: "" },
    { ja: "こちらで靴を脱いでください", simple: "Take off shoes here.", natural: "Please take off your shoes here.", kana: "プリーズ テイク オフ ユア シューズ ヒア", useCase: "入口で靴を脱いでもらうとき", note: "日本の文化として説明すると理解してもらいやすいです。" },
    { ja: "靴はこちらの棚に置いてください", simple: "Put shoes here.", natural: "Please put your shoes on this shelf.", kana: "プリーズ プット ユア シューズ オン ディス シェルフ", useCase: "靴の置き場所を案内するとき", note: "" },
    { ja: "日本の家では靴を脱ぐのが習慣です", simple: "It's Japanese custom.", natural: "It's a Japanese custom to remove your shoes indoors.", kana: "イッツ ア ジャパニーズ カスタム トゥ リムーブ ユア シューズ インドアーズ", useCase: "文化的背景を説明するとき", note: "" },
  ],
  reception: [
    { ja: "ようこそ、本日が初めてのご来店ですね?", simple: "Welcome. First time?", natural: "Welcome! Is this your first time visiting us?", kana: "ウェルカム！ イズ ディス ユア ファースト タイム ヴィジティング アス?", useCase: "新規のお客様を迎えるとき", note: "笑顔でゆっくり話すと伝わりやすいです。" },
    { ja: "こちらの用紙にご記入いただけますか?", simple: "Please write here.", natural: "Could you fill out this form, please?", kana: "クッジュー フィル アウト ディス フォーム、プリーズ?", useCase: "問診票の記入をお願いするとき", note: "用紙を指さしながら伝えると分かりやすいです。" },
    { ja: "お名前をお伺いできますか?", simple: "Your name, please?", natural: "May I have your name, please?", kana: "メイ アイ ハブ ユア ネイム、プリーズ?", useCase: "予約確認の最初に", note: "ゆっくりはっきり発音しましょう。" },
    { ja: "少々お待ちください", simple: "Wait a minute.", natural: "Just a moment, please.", kana: "ジャスト ア モーメント、プリーズ", useCase: "確認のため少し待ってもらうとき", note: '"Wait!"だけだと強い命令に聞こえるので注意しましょう。' },
  ],
  intake: [
    { ja: "本日、気になる部分はどこですか?", simple: "Where is the pain?", natural: "Where do you feel tension or discomfort today?", kana: "ウェア ドゥー ユー フィール テンション オア ディスカンフォート トゥデイ?", useCase: "施術前のヒアリング", note: '"pain"より"discomfort（不快感）"の方が柔らかい印象です。' },
    { ja: "その症状はいつ頃からありますか?", simple: "Since when?", natural: "How long have you had this feeling?", kana: "ハウ ロング ハブ ユー ハド ディス フィーリング?", useCase: "症状の期間を尋ねるとき", note: "" },
    { ja: "アレルギーや過去の怪我はありますか?", simple: "Any allergy? Any injury?", natural: "Do you have any allergies or past injuries I should know about?", kana: "ドゥー ユー ハブ エニー アラジーズ オア パスト インジャリーズ アイ シュド ノウ アバウト?", useCase: "安全に施術するための確認", note: "必ず施術前に確認しましょう。" },
    { ja: "教えていただきありがとうございます", simple: "Thank you.", natural: "Thank you for letting me know.", kana: "サンキュー フォー レティング ミー ノウ", useCase: "問診の最後に", note: "" },
  ],
  pre: [
    { ja: "うつ伏せになってお休みください", simple: "Lie down, face down.", natural: "Please lie face down on the bed.", kana: "プリーズ ライ フェイス ダウン オン ザ ベッド", useCase: "施術開始前の姿勢案内", note: "ジェスチャーを添えると伝わりやすいです。" },
    { ja: "この施術では服を着たままで大丈夫です", simple: "Keep your clothes on.", natural: "You can keep your clothes on for this treatment.", kana: "ユー キャン キープ ユア クローズ オン フォー ディス トリートメント", useCase: "服装についての案内", note: "着替えが必要な場合は別途はっきり伝えましょう。" },
    { ja: "リラックスして自然に呼吸してください", simple: "Please relax.", natural: "Please relax and breathe naturally.", kana: "プリーズ リラックス アンド ブリーズ ナチュラリー", useCase: "施術開始直前の声かけ", note: "穏やかなトーンで話しましょう。" },
    { ja: "日本式のボディケアは穏やかな圧を大切にします", simple: "Japanese style is gentle.", natural: "Japanese-style body care often focuses on gentle, steady pressure.", kana: "ジャパニーズ スタイル ボディ ケア オフン フォーカシズ オン ジェントル、ステディ プレッシャー", useCase: "外国人のお客様への説明", note: '"treatment"より"body care"の方が安全な表現です。' },
    { ja: "施術内容にご同意いただけますか?", simple: "Is this okay?", natural: "Do you agree to receive this treatment?", kana: "ドゥー ユー アグリー トゥ リシーブ ディス トリートメント?", useCase: "施術前の同意確認", note: "" },
    { ja: "いつでも中止をお伝えください", simple: "Tell me to stop anytime.", natural: "Please tell me anytime if you'd like to stop.", kana: "プリーズ テル ミー エニータイム イフ ユード ライク トゥ ストップ", useCase: "安心して受けてもらうための一言", note: "" },
    { ja: "ご不明な点があれば聞いてください", simple: "Any questions?", natural: "Please let me know if you have any questions before we begin.", kana: "プリーズ レット ミー ノウ イフ ユー ハブ エニー クエスチョンズ ビフォー ウィー ビギン", useCase: "施術前の最終確認", note: "" },
    { ja: "では始めてもよろしいですか?", simple: "Can we start?", natural: "Is it okay if we begin now?", kana: "イズ イット オーケー イフ ウィー ビギン ナウ?", useCase: "施術開始の確認", note: "" },
  ],
  during: [
    { ja: "圧の強さは大丈夫ですか?", simple: "Is this okay?", natural: "Is the pressure okay for you?", kana: "イズ ザ プレッシャー オーケー フォー ユー?", useCase: "施術中に圧を確認するとき", note: "" },
    { ja: "もう少し強くすることもできます", simple: "I can make it stronger.", natural: "I can make it a bit stronger if you'd like.", kana: "アイ キャン メイク イット ア ビット ストロンガー イフ ユード ライク", useCase: "強めが好きな方への対応", note: "強くしすぎないよう、様子を見ながら調整しましょう。" },
    { ja: "弱くすることもできますので教えてください", simple: "Tell me if it's too strong.", natural: "I can make it softer — just let me know.", kana: "アイ キャン メイク イット ソフター、ジャスト レット ミー ノウ", useCase: "圧を弱めてほしいとき", note: "" },
    { ja: "強すぎると感じたらいつでも教えてください", simple: "Tell me if it hurts.", natural: "Please tell me anytime if it feels too strong.", kana: "プリーズ テル ミー エニータイム イフ イット フィールズ トゥー ストロング", useCase: "施術中の安全確認", note: "痛みを我慢させないよう、必ず伝えましょう。" },
  ],
  position: [
    { ja: "仰向けになっていただけますか?", simple: "Please turn over.", natural: "Could you please turn onto your back now?", kana: "クッジュー プリーズ ターン オントゥ ユア バック ナウ?", useCase: "姿勢を変えてもらうとき", note: "" },
    { ja: "頭を支えますので、リラックスしてください", simple: "I will hold your head.", natural: "I'll help support your head — please relax.", kana: "アイル ヘルプ サポート ユア ヘッド、プリーズ リラックス", useCase: "仰向けになった際のサポート", note: "" },
    { ja: "準備ができたら教えてください", simple: "Tell me when ready.", natural: "Let me know when you're ready.", kana: "レット ミー ノウ ウェン ユアー レディ", useCase: "姿勢を整える時間を与えるとき", note: "" },
    { ja: "ゆっくりで大丈夫ですよ", simple: "No rush.", natural: "Take your time, there is no rush.", kana: "テイク ユア タイム、ゼア イズ ノー ラッシュ", useCase: "マイペースな方への声かけ", note: "" },
  ],
  post: [
    { ja: "本日は水分を多めに摂ることをおすすめします", simple: "Please drink water.", natural: "I'd recommend drinking plenty of water today.", kana: "アイド レコメンド ドリンキング プレンティ オブ ウォーター トゥデイ", useCase: "施術後のセルフケア案内", note: '断定せず"recommend（おすすめ）"を使いましょう。' },
    { ja: "明日、少し筋肉痛のようになることもありますが、よくあることです", simple: "You might feel sore tomorrow.", natural: "You might feel a little sore tomorrow, and that can be normal.", kana: "ユー マイト フィール ア リトル ソー トゥモロウ、アンド ザット キャン ビー ノーマル", useCase: "施術後の反応について説明するとき", note: '"will"ではなく"might（〜かもしれません）"を使うと安全です。' },
    { ja: "今夜は体を温めてゆっくりお休みください", simple: "Please rest well.", natural: "Please try to stay warm and rest well tonight.", kana: "プリーズ トライ トゥ ステイ ウォーム アンド レスト ウェル トゥナイト", useCase: "アフターケアの案内", note: "" },
    { ja: "またのご来店をお待ちしております", simple: "See you again.", natural: "We hope to see you again soon.", kana: "ウィー ホープ トゥ シー ユー アゲイン スーン", useCase: "施術終了後の挨拶", note: "" },
  ],
  checkout: [
    { ja: "本日の合計は8,000円です", simple: "Total is 8,000 yen.", natural: "Your total today is 8,000 yen.", kana: "ユア トータル トゥデイ イズ エイト サウザンド イェン", useCase: "会計金額を伝えるとき", note: "" },
    { ja: "クレジットカードもご利用いただけます", simple: "Card is okay.", natural: "Yes, we accept credit cards.", kana: "イエス、ウィー アクセプト クレジット カーズ", useCase: "支払い方法を聞かれたとき", note: "" },
    { ja: "次回のご予約をお取りしましょうか?", simple: "Book next time?", natural: "Would you like to book your next appointment now?", kana: "ウッジュー ライク トゥ ブック ユア ネクスト アポイントメント ナウ?", useCase: "リピート予約の案内", note: "" },
    { ja: "ありがとうございました、またお越しくださいませ", simple: "Thank you, bye.", natural: "Thank you very much, see you again soon.", kana: "サンキュー ベリー マッチ、シー ユー アゲイン スーン", useCase: "お見送りのとき", note: "" },
  ],
  trouble: [
    { ja: "ご不便をおかけして申し訳ございません", simple: "Sorry for that.", natural: "I'm sorry for the inconvenience.", kana: "アイム ソーリー フォー ジ インコンヴィニエンス", useCase: "クレームやトラブルへの最初の対応", note: "まず謝ることで安心してもらえます。" },
    { ja: "どのようなことでお困りですか?", simple: "What's wrong?", natural: "Could you tell me a bit more about what happened?", kana: "クッジュー テル ミー ア ビット モア アバウト ワット ハプンド?", useCase: "状況を詳しく聞くとき", note: "" },
    { ja: "少々お時間をいただき、確認いたします", simple: "Let me check.", natural: "Let me check on that for you right away.", kana: "レット ミー チェック オン ザット フォー ユー ライト アウェイ", useCase: "対応を保留して確認する場合", note: "" },
    { ja: "スタッフに確認して参りますので少々お待ちください", simple: "I will ask staff.", natural: "Let me check with our staff, just a moment please.", kana: "レット ミー チェック ウィズ アワー スタッフ、ジャスト ア モーメント プリーズ", useCase: "自分だけで判断できないとき", note: "無理に一人で解決しようとしなくて大丈夫です。" },
  ],
  medical: [
    { ja: "この施術はリラクゼーションとボディケアが目的です", simple: "This is for relaxing.", natural: "This treatment is for relaxation and body care.", kana: "ディス トリートメント イズ フォー リラクセイション アンド ボディ ケア", useCase: "施術の目的を伝えるとき", note: "診断・治療を保証する表現ではなく、この言い方を基本にしましょう。" },
    { ja: "医学的な診断ではありません", simple: "Not a diagnosis.", natural: "It is not a medical diagnosis.", kana: "イット イズ ノット ア メディカル ダイアグノーシス", useCase: "誤解を避けるための一言", note: "" },
    { ja: "診断や治療はできませんが、リラックスのお手伝いはできます", simple: "I can't cure it, but I can help you relax.", natural: "I'm not able to diagnose or treat conditions, but I can help you relax.", kana: "アイム ノット エイブル トゥ ダイアグノーズ オア トリート コンディションズ、バット アイ キャン ヘルプ ユー リラックス", useCase: "「治りますか?」と聞かれたとき", note: '"cure/treat/heal"は使わないようにしましょう。' },
    { ja: "このサービスはリラクゼーションとボディケアを目的としています", simple: "This is for relaxing.", natural: "This service is designed for relaxation and body care, not medical treatment.", kana: "ディス サービス イズ デザインド フォー リラクセイション アンド ボディ ケア、ノット メディカル トリートメント", useCase: "施術の目的を説明するとき", note: "" },
    { ja: "慢性的な痛みについては、医師にもご相談ください", simple: "Please see a doctor too.", natural: "For chronic pain, I'd also recommend seeing a doctor.", kana: "フォー クロニック ペイン、アイド オールソー レコメンド シーイング ア ドクター", useCase: "長引く痛みを訴えられたとき", note: "医療的アドバイスをする必要はありません。" },
    { ja: "施術中は快適に過ごせるようサポートいたします", simple: "I will help you feel better.", natural: "I can help support your comfort during the session.", kana: "アイ キャン ヘルプ サポート ユア カンフォート デュアリング ザ セッション", useCase: "安心してもらうための一言", note: "" },
  ],
  menu: [
    { ja: "国家資格を持つスタッフが施術いたします", simple: "Our staff has a license.", natural: "Our therapists are all nationally licensed professionals.", kana: "アワー セラピスツ アー オール ナショナリー ライセンスト プロフェッショナルズ", useCase: "高価格メニューの価値を説明するとき", note: "" },
    { ja: "こちらのコースは鍼と整体を組み合わせています", simple: "This course has acupuncture and seitai.", natural: "This course combines acupuncture and seitai body adjustment.", kana: "ディス コース コンバインズ アキュパンクチャー アンド セイタイ ボディ アジャストメント", useCase: "メニュー内容を説明するとき", note: "" },
    { ja: "加圧トレーニングもお試しいただけます", simple: "You can try kaatsu training.", natural: "You can also try our blood flow restriction training, called kaatsu.", kana: "ユー キャン オールソー トライ アワー ブラッド フロー リストリクション トレーニング、コールド カアツ", useCase: "加圧トレーニングの案内", note: "" },
    { ja: "小顔とパーソナルストレッチのコースもございます", simple: "We have face and stretch courses.", natural: "We also offer small-face treatment and personal stretch sessions.", kana: "ウィー オールソー オファー スモール フェイス トリートメント アンド パーソナル ストレッチ セッションズ", useCase: "メニューの幅を紹介するとき", note: "" },
  ],
  photo: [
    { ja: "店内のお写真は大丈夫ですよ", simple: "Photos are okay.", natural: "Yes, feel free to take photos of the interior.", kana: "イエス、フィール フリー トゥ テイク フォトス オブ ジ インテリア", useCase: "撮影許可を伝えるとき", note: "" },
    { ja: "施術中の撮影はご遠慮いただいています", simple: "No photos during treatment.", natural: "We kindly ask you not to take photos during the treatment.", kana: "ウィー カインドリー アスク ユー ノット トゥ テイク フォトス デュアリング ザ トリートメント", useCase: "施術中の撮影を控えてもらうとき", note: "他のお客様のプライバシーにも配慮しましょう。" },
    { ja: "SNSへの投稿もぜひどうぞ", simple: "You can post on SNS.", natural: "Please feel free to share it on social media.", kana: "プリーズ フィール フリー トゥ シェア イット オン ソーシャル メディア", useCase: "SNS投稿を歓迎するとき", note: "" },
    { ja: "タグ付けしていただけると嬉しいです", simple: "Please tag us.", natural: "We'd love it if you tagged us.", kana: "ウィード ラブ イット イフ ユー タグド アス", useCase: "店舗タグを促すとき", note: "" },
  ],
  sightseeing: [
    { ja: "たくさん歩いて疲れましたね、ゆっくりしていってください", simple: "You look tired. Please relax.", natural: "You must be tired from all that walking — please relax here.", kana: "ユー マスト ビー タイアード フロム オール ザット ウォーキング、プリーズ リラックス ヒア", useCase: "観光帰りの客を迎えるとき", note: "" },
    { ja: "江ノ島や鎌倉はいかがでしたか?", simple: "How was Enoshima?", natural: "How was your trip to Enoshima and Kamakura?", kana: "ハウ ワズ ユア トリップ トゥ エノシマ アンド カマクラ?", useCase: "観光の様子を尋ねるとき", note: "" },
    { ja: "この施術で足の疲れも和らぐと思います", simple: "This will help your legs.", natural: "This treatment may help ease the tiredness in your legs.", kana: "ディス トリートメント メイ ヘルプ イーズ ザ タイアードネス イン ユア レッグズ", useCase: "観光疲れへの配慮を伝えるとき", note: '"may help（和らぐかもしれません）"を使い、断定は避けましょう。' },
    { ja: "良い旅の締めくくりになりますように", simple: "Enjoy the rest of your trip.", natural: "We hope this is a nice way to end your day of sightseeing.", kana: "ウィー ホープ ディス イズ ア ナイス ウェイ トゥ エンド ユア デイ オブ サイトシーイング", useCase: "見送りの際の一言", note: "" },
  ],
  language: [
    { ja: "英語が得意ではありませんが、頑張ります", simple: "My English is not good.", natural: "My English is limited, but I will do my best to help you.", kana: "マイ イングリッシュ イズ リミテッド、バット アイ ウィル ドゥー マイ ベスト トゥ ヘルプ ユー", useCase: "最初にやんわり伝えるとき", note: "謙遜しすぎず、笑顔で伝えると好印象です。" },
    { ja: "ゆっくり話していただけますか?", simple: "Speak slowly, please.", natural: "Could you please speak a little slowly?", kana: "クッジュー プリーズ スピーク ア リトル スローリー?", useCase: "聞き取りが難しいとき", note: "" },
    { ja: "翻訳アプリを使ってもよろしいですか?", simple: "Can I use an app?", natural: "I may use a translation app. Thank you for your understanding.", kana: "アイ メイ ユーズ ア トランスレイション アプリ、サンキュー フォー ユア アンダースタンディング", useCase: "翻訳アプリの使用を伝えるとき", note: "" },
    { ja: "うまく伝わっていますか?", simple: "Understand?", natural: "Does that make sense to you?", kana: "ダズ ザット メイク センス トゥ ユー?", useCase: "伝わったか確認するとき", note: "" },
    { ja: "ご理解ありがとうございます", simple: "Thank you.", natural: "Thank you for your understanding.", kana: "サンキュー フォー ユア アンダースタンディング", useCase: "配慮してもらったお礼", note: "" },
    { ja: "ご協力ありがとうございます", simple: "Thank you for waiting.", natural: "Thank you so much for your patience.", kana: "サンキュー ソー マッチ フォー ユア ペイシェンス", useCase: "待ってもらったお礼", note: "" },
  ],
};
