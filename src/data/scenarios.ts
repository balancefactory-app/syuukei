import type { Scenario } from "@/lib/types";

/**
 * 19シナリオ。プロトタイプの SCENARIOS をそのまま移植。
 * category は PHRASES のキーに対応（ヒント表示・スコアリングに使用）。
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "first-visit", icon: "🧳", ja: "初回来店", en: "First-time visit", category: "reception",
    persona: { name: "Emily", emoji: "🧳", trait: "初めての施術で少し緊張・不安気味な観光客" },
    desc: "初めてご来店されたお客様をお迎えします。",
    turns: [
      { customer: "Um, hi... is this my first time? I'm not really sure what I should do.", keywords: ["welcome", "form", "fill", "first", "worry", "fine"], hintJa: "安心してもらえるよう、笑顔でウェルカムの一言を。" },
      { customer: "Oh, okay. Um... will it hurt? I've never done this before.", keywords: ["relax", "gentle", "worry", "hurt", "comfortable"], hintJa: "痛くないことや、途中で調整できることを伝えましょう。" },
      { customer: "Okay... I feel a little better now, thank you.", keywords: ["welcome", "glad", "relax", "today"], hintJa: "安心してもらえたことに一言添えましょう。" },
    ],
  },
  {
    id: "reservation", icon: "💼", ja: "予約確認", en: "Reservation check", category: "reception",
    persona: { name: "David", emoji: "💼", trait: "出張の合間で時間に余裕がないビジネス客" },
    desc: "ご予約内容を確認する場面です。",
    turns: [
      { customer: "Hi, I have a 3pm reservation. I only have about an hour before my next meeting.", keywords: ["name", "reservation", "check", "moment"], hintJa: "お名前を確認しましょう。" },
      { customer: "My name is David Chen. How long will the session take exactly?", keywords: ["minute", "hour", "usually", "session", "long"], hintJa: "施術時間の目安を具体的に伝えましょう。" },
      { customer: "Perfect, that works with my schedule.", keywords: ["great", "ready", "wait", "moment"], hintJa: "ご案内できることを伝えましょう。" },
    ],
  },
  {
    id: "intake", ja: "問診", icon: "🧑", en: "Health intake", category: "intake",
    persona: { name: "Grace", emoji: "🧑", trait: "デスクワークで肩こりと腰痛を訴える常連客" },
    desc: "体の状態や気になる点をヒアリングします。",
    turns: [
      { customer: "I have some tightness in my shoulders and lower back.", keywords: ["shoulder", "back", "since", "when", "pain"], hintJa: "いつから、どの程度かを尋ねましょう。" },
      { customer: "About two weeks now, mostly from sitting at a desk.", keywords: ["injury", "condition", "allerg", "medic", "pressure"], hintJa: "既往症やアレルギーの有無を確認しましょう。" },
      { customer: "No allergies, and no major injuries.", keywords: ["good", "thank", "start", "today"], hintJa: "情報のお礼を伝え、施術に進みましょう。" },
    ],
  },
  {
    id: "pre-treatment", ja: "施術前の案内", icon: "🙂", en: "Pre-treatment guidance", category: "pre",
    persona: { name: "Tom", emoji: "🙂", trait: "施術の流れを知らず、少し戸惑っている客" },
    desc: "施術を始める前の流れを説明します。",
    turns: [
      { customer: "What should I do — just lie down like this?", keywords: ["lie", "face", "down", "please", "comfortable"], hintJa: "うつ伏せ・仰向けなど姿勢を案内しましょう。" },
      { customer: "Okay, got it. Should I keep my clothes on?", keywords: ["clothes", "keep", "remove", "towel", "comfortable"], hintJa: "服装についての案内をしましょう。" },
      { customer: "Perfect, I'm ready.", keywords: ["relax", "breathe", "start", "let"], hintJa: "リラックスするよう声をかけましょう。" },
    ],
  },
  {
    id: "pressure", ja: "圧の確認", icon: "💪", en: "Checking pressure", category: "during",
    persona: { name: "Mike", emoji: "💪", trait: "スポーツをしていて、強めの圧を好む客" },
    desc: "施術中の力加減を確認する場面です。",
    turns: [
      { customer: "Actually, could you press a little harder? I like it pretty firm.", keywords: ["stronger", "firm", "sure", "can", "little"], hintJa: "応じられる範囲で調整することを伝えましょう。" },
      { customer: "Yes, that's much better. Maybe even a bit stronger, if that's okay?", keywords: ["let", "know", "careful", "okay", "little"], hintJa: "強くしすぎないよう様子を伺いながら答えましょう。" },
      { customer: "Perfect, that's exactly right, thank you.", keywords: ["glad", "good", "let", "know"], hintJa: "安心してもらえる一言を添えましょう。" },
    ],
  },
  {
    id: "position", ja: "体勢変更", icon: "😌", en: "Changing position", category: "position",
    persona: { name: "Lily", emoji: "😌", trait: "のんびりした性格でマイペースにリラックスしている客" },
    desc: "仰向けやうつ伏せなど姿勢を変える場面です。",
    turns: [
      { customer: "Should I turn over now?", keywords: ["please", "turn", "over", "face", "up", "now"], hintJa: "仰向けになるタイミングを案内しましょう。" },
      { customer: "Like this, on my back?", keywords: ["yes", "perfect", "good", "like", "that"], hintJa: "その通りだと伝えましょう。" },
      { customer: "Okay, I'm ready.", keywords: ["relax", "again", "start", "time"], hintJa: "再びリラックスを促しましょう。" },
    ],
  },
  {
    id: "post-treatment", ja: "施術後の説明", icon: "🙋‍♀️", en: "Post-treatment explanation", category: "post",
    persona: { name: "Anna", emoji: "🙋‍♀️", trait: "施術の効果やアフターケアが気になる客" },
    desc: "施術後の体の変化や過ごし方を伝えます。",
    turns: [
      { customer: "That felt amazing. Is there anything I should do after this?", keywords: ["water", "drink", "rest", "warm", "recommend"], hintJa: "水分補給や過ごし方のアドバイスをしましょう。" },
      { customer: "Okay, I'll drink some water. Will I feel sore tomorrow?", keywords: ["may", "might", "little", "normal", "feel"], hintJa: "断定せず、可能性として伝えましょう。" },
      { customer: "Good to know, thank you so much.", keywords: ["welcome", "glad", "care", "again"], hintJa: "また来てほしい気持ちを伝えましょう。" },
    ],
  },
  {
    id: "checkout", ja: "会計", icon: "⏱", en: "Checkout", category: "checkout",
    persona: { name: "Ben", emoji: "⏱", trait: "次の予定があり少し急いでいる客" },
    desc: "お会計と次回予約のご案内をします。",
    turns: [
      { customer: "That was great. How much do I owe you? I'm a bit short on time.", keywords: ["total", "yen", "today", "card"], hintJa: "合計金額を手短に伝えましょう。" },
      { customer: "Can I pay by credit card?", keywords: ["yes", "sure", "card", "accept"], hintJa: "支払い方法について答えましょう。" },
      { customer: "Great, I'll book my next visit online later, thanks!", keywords: ["thank", "again", "soon", "see"], hintJa: "お見送りの一言を伝えましょう。" },
    ],
  },
  {
    id: "medical-question", ja: "医療的な質問への安全な返答", icon: "🤕", en: "Safe answers to medical questions", category: "medical",
    persona: { name: "Robert", emoji: "🤕", trait: "慢性的な腰痛に悩み、治療効果を期待している客" },
    desc: "診断や治療を断定しない、安全な伝え方を練習します。",
    turns: [
      { customer: "I've had this back pain for years. Can this cure it completely?", keywords: ["support", "relax", "doctor", "recommend", "cannot"], hintJa: "「治せる」と断定せず、医師への相談を勧めましょう。" },
      { customer: "I see. So what exactly can this treatment do for me?", keywords: ["relax", "support", "comfort", "circulation", "help"], hintJa: "リラクゼーションやサポートという言葉を使いましょう。" },
      { customer: "That makes sense, thank you for being honest.", keywords: ["welcome", "glad", "care", "today"], hintJa: "誠実に答えたことに感謝を伝えましょう。" },
    ],
  },
  {
    id: "tourist-explain", ja: "日本式施術体験の説明", icon: "🎎", en: "Explaining Japanese-style treatment", category: "pre",
    persona: { name: "Sophie", emoji: "🎎", trait: "江ノ島観光の後に立ち寄った、日本の文化や伝統に興味津々な観光客" },
    desc: "古民家サロンならではの日本式の施術体験を観光客向けに紹介します。",
    turns: [
      { customer: "I've never tried a Japanese-style treatment before, especially in a place like this. What makes it different?", keywords: ["japan", "traditional", "focus", "body", "style", "old", "house"], hintJa: "古民家の雰囲気や日本式の特徴を簡単に紹介しましょう。" },
      { customer: "That's interesting! Will it hurt at all?", keywords: ["comfortable", "strong", "tell", "gentle", "adjust"], hintJa: "痛みについて安心させる説明をしましょう。" },
      { customer: "Good, I'm excited to try it.", keywords: ["enjoy", "relax", "hope", "experience"], hintJa: "楽しんでもらえるよう声をかけましょう。" },
    ],
  },
  {
    id: "salon-intro", ja: "古民家サロンの説明", icon: "🏯", en: "Introducing the old house salon", category: "salon",
    persona: { name: "Chloe", emoji: "🏯", trait: "江ノ島観光のついでに立ち寄った、建物に興味津々な観光客" },
    desc: "バランスファクトリーの建物や場所について紹介します。",
    turns: [
      { customer: "Wow, this building is beautiful! Is it an old traditional house?", keywords: ["old", "house", "japanese", "traditional", "year"], hintJa: "古民家であることを紹介しましょう。" },
      { customer: "That's amazing! How far are we from Enoshima?", keywords: ["near", "enoshima", "fujisawa", "katase", "away"], hintJa: "江ノ島からのアクセスを伝えましょう。" },
      { customer: "I love it, thank you for explaining!", keywords: ["welcome", "glad", "hope", "enjoy"], hintJa: "楽しんでもらえる一言を添えましょう。" },
    ],
  },
  {
    id: "shoes-off", ja: "靴を脱ぐ案内", icon: "👟", en: "Asking guests to remove shoes", category: "salon",
    persona: { name: "Jake", emoji: "👟", trait: "靴を脱ぐ習慣に慣れていない観光客" },
    desc: "古民家サロンならではの、靴を脱いでもらう案内をします。",
    turns: [
      { customer: "Oh, should I take my shoes off here?", keywords: ["yes", "please", "shoes", "off", "here"], hintJa: "靴を脱いでほしいことをはっきり伝えましょう。" },
      { customer: "Okay, where should I put them?", keywords: ["shelf", "box", "here", "put", "shoes"], hintJa: "靴の置き場所を案内しましょう。" },
      { customer: "Got it, thank you!", keywords: ["welcome", "thank", "please", "custom"], hintJa: "日本の習慣について一言添えると親切です。" },
    ],
  },
  {
    id: "consent", ja: "施術前の同意確認", icon: "📝", en: "Pre-treatment consent check", category: "pre",
    persona: { name: "Nora", emoji: "📝", trait: "施術内容についてしっかり確認したい慎重な客" },
    desc: "施術を始める前に、内容への同意を確認します。",
    turns: [
      { customer: "Before we start, can you tell me exactly what this treatment involves?", keywords: ["relax", "body", "care", "treatment", "explain"], hintJa: "施術内容を簡単に説明しましょう。" },
      { customer: "Is it okay if I ask you to stop at any time?", keywords: ["yes", "anytime", "stop", "sure", "tell"], hintJa: "いつでも中止できることを伝えましょう。" },
      { customer: "Great, I feel comfortable starting now.", keywords: ["good", "let", "begin", "start", "ready"], hintJa: "安心して始められるよう声をかけましょう。" },
    ],
  },
  {
    id: "language-limit", ja: "英語が得意ではないことを丁寧に伝える", icon: "🗣️", en: "Politely explaining limited English", category: "language",
    persona: { name: "Mia", emoji: "🗣️", trait: "早口で英語を話す観光客" },
    desc: "英語が得意でないことを、失礼にならないように伝えます。",
    turns: [
      { customer: "Hi! So can you walk me through everything about the treatment process today?", keywords: ["sorry", "english", "limited", "try", "best"], hintJa: "英語が得意でないことを丁寧に伝えましょう。" },
      { customer: "Oh, no worries! Should I speak slowly?", keywords: ["yes", "please", "slow", "thank", "appreciate"], hintJa: "ゆっくり話してもらえるようお願いしましょう。" },
      { customer: "Sure, that's totally fine!", keywords: ["thank", "understand", "help"], hintJa: "配慮してもらえたことへの感謝を伝えましょう。" },
    ],
  },
  {
    id: "translation-app", ja: "翻訳アプリを使う説明", icon: "📱", en: "Explaining the use of a translation app", category: "language",
    persona: { name: "Daniel", emoji: "📱", trait: "スタッフが翻訳アプリを使うことに気づく客" },
    desc: "翻訳アプリを使うことを、あらかじめ伝えます。",
    turns: [
      { customer: "Oh, are you using a translation app? That's smart!", keywords: ["yes", "translat", "app", "sorry", "use"], hintJa: "翻訳アプリを使うことを伝えましょう。" },
      { customer: "No problem at all, take your time.", keywords: ["thank", "appreciate", "patient", "moment"], hintJa: "待ってもらえることへのお礼を伝えましょう。" },
      { customer: "This is working really well, thanks!", keywords: ["glad", "happy", "help", "great"], hintJa: "伝わってよかったという気持ちを伝えましょう。" },
    ],
  },
  {
    id: "premium-menu", ja: "高価格メニューの説明", icon: "💴", en: "Explaining premium menu options", category: "menu",
    persona: { name: "William", emoji: "💴", trait: "料金が気になるが、良いメニューを探している客" },
    desc: "国家資格者による高価格メニューの価値を説明します。",
    turns: [
      { customer: "This menu looks a bit expensive. What makes it special?", keywords: ["national", "license", "quality", "special", "include"], hintJa: "国家資格者が施術することを説明しましょう。" },
      { customer: "I see, that sounds worth it. How long does it take?", keywords: ["minute", "hour", "session", "include"], hintJa: "施術時間や内容を伝えましょう。" },
      { customer: "Great, let's do that one.", keywords: ["good", "choice", "sure", "ready"], hintJa: "選んでもらえたことへの一言を添えましょう。" },
    ],
  },
  {
    id: "photo-sns", ja: "写真撮影やSNS投稿への対応", icon: "📸", en: "Handling photos and social media", category: "photo",
    persona: { name: "Zoe", emoji: "📸", trait: "SNSに投稿するために写真を撮りたい観光客" },
    desc: "古民家サロンでの撮影やSNS投稿への対応をします。",
    turns: [
      { customer: "This place is so photogenic! Can I take a few photos?", keywords: ["yes", "sure", "photo", "okay", "please"], hintJa: "撮影が可能な範囲を案内しましょう。" },
      { customer: "Is it okay if I post them on Instagram?", keywords: ["yes", "sure", "fine", "okay", "please"], hintJa: "SNS投稿について答えましょう。" },
      { customer: "Awesome, thank you so much!", keywords: ["welcome", "glad", "enjoy"], hintJa: "楽しんでもらえたことへの一言を添えましょう。" },
    ],
  },
  {
    id: "sightseeing", ja: "江ノ島・鎌倉観光ついでの対応", icon: "🏖️", en: "Guests visiting after sightseeing", category: "sightseeing",
    persona: { name: "Oliver", emoji: "🏖️", trait: "江ノ島や鎌倉を観光した後で疲れている客" },
    desc: "観光の合間や後に立ち寄ったお客様に対応します。",
    turns: [
      { customer: "We walked around Enoshima and Kamakura all day, I'm exhausted!", keywords: ["tired", "walk", "relax", "perfect", "today"], hintJa: "観光で疲れた様子に共感しましょう。" },
      { customer: "Do you have any recommendations for after this?", keywords: ["recommend", "nearby", "suggest", "area"], hintJa: "施術後の過ごし方を案内しましょう。" },
      { customer: "Thanks, that's really helpful.", keywords: ["welcome", "glad", "enjoy", "trip"], hintJa: "良い旅になるよう一言添えましょう。" },
    ],
  },
  {
    id: "trouble", ja: "トラブル対応", icon: "😟", en: "Handling concerns", category: "trouble",
    persona: { name: "Karen", emoji: "😟", trait: "施術に少し不安や不満を感じている客" },
    desc: "施術後に不安や不満を伝えるお客様に対応します。",
    turns: [
      { customer: "Um, excuse me... I think the treatment felt shorter than I expected. Is that normal?", keywords: ["sorry", "check", "explain", "inconven"], hintJa: "まず謝り、状況を確認する姿勢を見せましょう。" },
      { customer: "Oh, I see. Actually, my shoulder feels a little sore now, is that okay?", keywords: ["normal", "may", "might", "sorry", "check"], hintJa: "断定せず、様子を見ることや必要なら相談することを伝えましょう。" },
      { customer: "Okay, thank you for explaining. I feel better about it now.", keywords: ["welcome", "glad", "anytime", "care"], hintJa: "安心してもらえたことへの一言を添えましょう。" },
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
