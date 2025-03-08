それぞれのファイルの完全な内容を提供します。そのままコピー＆ペーストして使用できます。
docs/data-spec.md の完全内容
markdownCopy# 学習アプリのデータ設計仕様書

## データモデル概要

「猫先生のクイズチャレンジ」のデータ構造は、学習効率を最大化するために専門的に設計されています。この仕様書では、アプリケーションで使用するデータモデルについて詳細に説明します。

## 1. 問題データ構造（JSON Schema）

### 1.1 メタデータ

```json
{
  "metadata": {
    "subject": "社会",                 // 科目名
    "topic": "水産業・資源・工業",      // トピック
    "keyTerms": [                     // 重要キーワード
      "水産業",
      "養殖漁業",
      "エネルギー",
      "石灰石",
      "工業地帯",
      "太平洋ベルト"
    ],
    "targetAge": 10,                  // 対象年齢
    "questionCount": 80,              // 問題数
    "inputType": "OCR処理結果",        // データソース
    "memoryOptimization": {           // 記憶最適化設定
      "repetitionPattern": "同じ概念を段階的に繰り返す問題構成",
      "reviewSchedule": [
        "初回学習後",
        "1日後",
        "3日後",
        "1週間後"
      ]
    }
  }
}
1.2 問題データ
jsonCopy{
  "questions": [
    {
      "id": "q001",                    // 問題ID（一意）
      "type": "text",                  // 問題タイプ（text/image）
      "difficulty": 1,                 // 難易度（1-3）
      "character": "ねこ先生",          // 出題キャラクター
      "question": "問題文",             // 問題テキスト
      "options": [                     // 選択肢（配列）
        "選択肢1",
        "選択肢2",
        "選択肢3",
        "選択肢4"
      ],
      "correctAnswer": 1,              // 正解のインデックス（0起点）
      "explanation": "解説文",          // 解説
      "memoryTip": "覚え方のヒント",    // 記憶のコツ
      "tags": ["タグ1", "タグ2"]        // 分類タグ
    },
    {
      "id": "q002",
      "type": "image",                 // 画像問題の場合
      "difficulty": 2,
      "character": "うさぎコーチ",
      "question": "画像に関する問題文",
      "imageRequirements": {           // 画像要件
        "description": "画像の説明",
        "key_elements": ["要素1", "要素2"],
        "searchTerms": ["検索語1", "検索語2"],
        "fileName": "example.jpg"
      },
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 0,
      "explanation": "解説文",
      "memoryTip": "覚え方のヒント",
      "tags": ["タグ1", "タグ2"]
    }
    // 他の問題...
  ]
}
1.3 学習パス情報
jsonCopy{
  "learningPath": {
    "recommendedSequence": [          // 推奨学習順序
      "q001", "q002", "q003", "q004"  // 問題IDの配列
    ],
    "repetitionGroups": {             // 復習グループ
      "漁業": ["q001", "q005", "q009"],  // テーマごとのグループ
      "資源": ["q002", "q006", "q010"]
    }
  }
}
2. 画像リソース仕様
2.1 猫ミーム画像
Copyassets/
└── cat-memes/
    ├── cat_meme_gentle_1.webp     // 優しいレベルの煽り画像
    ├── cat_meme_gentle_2.webp
    ├── cat_meme_medium_1.webp     // 中程度の煽り画像
    ├── cat_meme_medium_2.webp
    ├── cat_meme_harsh_1.webp      // 厳しい煽り画像
    └── cat_meme_harsh_2.webp
2.2 ランクアイコン
Copyassets/
└── rank-icons/
    ├── genius.webp               // 天才児ランク
    ├── excellent.webp            // 秀才ランク
    ├── average.webp              // 普通の子ランク
    ├── below-average.webp        // ちょっと残念な子ランク
    ├── try-harder.webp           // がんばれランク
    └── below-cat.webp            // 猫以下ランク
2.3 問題画像
Copyassets/
└── question-images/
    ├── teichi_ami_2.jpg          // 定置網の写真
    ├── oil_conbinate.jpg         // 石油化学コンビナート
    ├── car_assembly_line.jpg     // 自動車工場の組立ライン
    └── wind_farm.jpg             // 風力発電施設
3. ユーザーデータモデル
3.1 ユーザープロファイル
jsonCopy{
  "user": {
    "lastActive": "2023-06-15T10:30:00",  // 最終アクティブ日時
    "currentRank": "genius",              // 現在のランク
    "previousRank": "genius",             // 前日のランク
    "mistakePoints": 0,                   // ミスポイント（ランク計算用）
    "consecutiveCorrect": 0,              // 連続正解数
    "settings": {
      "catMemeLevel": "medium",           // 煽りレベル設定
      "soundEnabled": true,               // 効果音設定
      "theme": "default"                  // テーマ設定
    }
  }
}
3.2 学習進捗データ
jsonCopy{
  "progress": {
    "completedQuestions": [               // 完了済み問題
      {
        "id": "q001",                     // 問題ID
        "lastAnswered": "2023-06-15T10:25:00",  // 最後に解答した日時
        "attempts": 2,                    // 挑戦回数
        "correct": 1,                     // 正解回数
        "lastCorrect": true               // 最後の回答が正解だったか
      },
      // 他の問題...
    ],
    "mistakeQuestions": [                 // 間違えた問題リスト
      {
        "id": "q003",                     // 問題ID
        "mistakeCount": 2,                // 間違えた回数
        "lastMistake": "2023-06-15T10:28:00",  // 最後に間違えた日時
        "tags": ["資源", "エネルギー"]      // 問題のタグ
      },
      // 他の間違えた問題...
    ],
    "stats": {
      "totalAnswered": 10,                // 回答した問題数
      "totalCorrect": 8,                  // 正解した問題数
      "accuracyRate": 80,                 // 正答率（%）
      "studyTimeToday": 15,               // 今日の学習時間（分）
      "totalStudyTime": 120               // 累計学習時間（分）
    },
    "sessions": [                         // 学習セッション履歴
      {
        "date": "2023-06-15",             // 日付
        "duration": 15,                   // 時間（分）
        "questionsAnswered": 10,          // 回答数
        "correctAnswers": 8,              // 正解数
      },
      // 他のセッション...
    ]
  }
}
3.3 復習スケジュール
jsonCopy{
  "reviewSchedule": {
    "today": ["q003", "q008"],            // 今日復習すべき問題
    "tomorrow": ["q001", "q005"],         // 明日復習すべき問題
    "threeDaysLater": ["q002"],           // 3日後に復習すべき問題
    "oneWeekLater": ["q004"]              // 1週間後に復習すべき問題
  }
}
4. データ永続化
4.1 ローカルストレージ構造
javascriptCopy// LocalStorageのキー構成
{
  'cat-quiz-user': JSON.stringify(userProfile),  // ユーザープロファイル
  'cat-quiz-progress': JSON.stringify(progress),  // 学習進捗
  'cat-quiz-mistakes': JSON.stringify(mistakes),  // 間違えた問題
  'cat-quiz-settings': JSON.stringify(settings),  // アプリ設定
  'cat-quiz-lastSession': JSON.stringify(lastSession)  // 最後のセッション情報
}
4.2 IndexedDB構造（オプション）
javascriptCopy// データベース名: cat-quiz-db
// オブジェクトストア一覧
const dbStores = [
  {
    name: 'questions',             // 問題データストア
    keyPath: 'id',                 // キーパス
    indices: [                     // インデックス
      { name: 'difficulty', keyPath: 'difficulty', options: { unique: false } },
      { name: 'tags', keyPath: 'tags', options: { unique: false, multiEntry: true } }
    ]
  },
  {
    name: 'user-progress',         // ユーザー進捗ストア
    keyPath: 'questionId',
    indices: [
      { name: 'lastAnswered', keyPath: 'lastAnswered', options: { unique: false } },
      { name: 'correct', keyPath: 'correct', options: { unique: false } }
    ]
  },
  {
    name: 'mistakes',              // 間違えた問題ストア
    keyPath: 'questionId',
    indices: [
      { name: 'mistakeCount', keyPath: 'mistakeCount', options: { unique: false } },
      { name: 'lastMistake', keyPath: 'lastMistake', options: { unique: false } }
    ]
  },
  {
    name: 'sessions',              // セッション履歴ストア
    keyPath: 'timestamp',
    indices: [
      { name: 'date', keyPath: 'date', options: { unique: false } }
    ]
  }
];
5. アルゴリズムと計算ロジック
5.1 ランク計算ロジック
javascriptCopy/**
 * ミスポイントに基づくランク計算
 * @param {number} mistakePoints - ミスの累積ポイント
 * @return {string} ランク名
 */
function calculateRank(mistakePoints) {
  if (mistakePoints < 10) return 'genius';         // 天才児
  if (mistakePoints < 25) return 'excellent';      // 秀才
  if (mistakePoints < 45) return 'average';        // 普通の子
  if (mistakePoints < 70) return 'below-average';  // ちょっと残念な子
  if (mistakePoints < 100) return 'try-harder';    // がんばれ
  return 'below-cat';                              // 猫以下
}

/**
 * ミスポイントの増加計算
 * @param {number} currentPoints - 現在のポイント
 * @param {number} difficulty - 問題の難易度(1-3)
 * @return {number} 新しいミスポイント
 */
function increaseMistakePoints(currentPoints, difficulty) {
  // 難易度に応じたポイント増加
  const pointIncrease = difficulty === 1 ? 5 : 
                       (difficulty === 2 ? 3 : 2);
  return currentPoints + pointIncrease;
}

/**
 * 連続正解によるミスポイント回復
 * @param {number} currentPoints - 現在のポイント
 * @param {number} streak - 連続正解数
 * @return {number} 回復後のポイント
 */
function recoverPoints(currentPoints, streak) {
  if (streak < 3) return currentPoints;  // 3回未満は回復なし
  
  // 連続正解数に応じた回復量
  const recovery = Math.min(
    Math.floor(streak / 3) * 2,  // 3問ごとに2ポイント回復
    currentPoints * 0.1          // 最大でも現在ポイントの10%まで
  );
  
  return Math.max(0, currentPoints - recovery);  // 0未満にはならない
}
5.2 問題選択アルゴリズム
javascriptCopy/**
 * 適応型問題選択アルゴリズム
 * 
 * このアルゴリズムは以下の要素を考慮して次の問題を選びます：
 * 1. ユーザーの学習履歴（間違えた問題の優先）
 * 2. 難易度の適応（成績に基づく調整）
 * 3. 問題の多様性（同じ種類が続かないように）
 * 4. 学習効果の最適化（復習タイミングの考慮）
 * 
 * @param {Array} allQuestions - 全問題リスト
 * @param {Object} userProgress - ユーザーの進捗データ
 * @param {Array} answeredQuestions - 現セッションで既に回答した問題ID
 * @return {Object} 次に出題する問題オブジェクト
 */
function selectNextQuestion(allQuestions, userProgress, answeredQuestions) {
  // 未回答の問題をフィルタリング
  const unansweredQuestions = allQuestions.filter(q => 
    !answeredQuestions.includes(q.id)
  );
  
  if (unansweredQuestions.length === 0) return null;  // 全問回答済み
  
  // ユーザーの正答率から適切な難易度を推定
  const userAccuracy = calculateUserAccuracy(userProgress);
  const targetDifficulty = determineTargetDifficulty(userAccuracy);
  
  // 復習が必要な問題を優先
  const dueForReview = getDueForReviewQuestions(userProgress);
  
  // 間違えた問題の中から出題（30%の確率）
  if (Math.random() < 0.3 && userProgress.mistakeQuestions.length > 0) {
    const mistakeIds = userProgress.mistakeQuestions.map(m => m.id);
    const availableMistakes = unansweredQuestions.filter(q => 
      mistakeIds.includes(q.id)
    );
    
    if (availableMistakes.length > 0) {
      // 間違えた回数が多い問題ほど出題確率を高める
      return weightedRandomChoice(availableMistakes, q => {
        const mistake = userProgress.mistakeQuestions.find(m => m.id === q.id);
        return mistake ? mistake.mistakeCount : 1;
      });
    }
  }
  
  // 復習タイミングの問題を優先（40%の確率）
  if (Math.random() < 0.4 && dueForReview.length > 0) {
    const availableReview = unansweredQuestions.filter(q => 
      dueForReview.includes(q.id)
    );
    
    if (availableReview.length > 0) {
      return randomChoice(availableReview);
    }
  }
  
  // ターゲット難易度に近い問題を選択
  const byDifficulty = unansweredQuestions.filter(q => 
    Math.abs(q.difficulty - targetDifficulty) <= 1
  );
  
  if (byDifficulty.length > 0) {
    return randomChoice(byDifficulty);
  }
  
  // どれも条件に合わない場合はランダム選択
  return randomChoice(unansweredQuestions);
}

// 加重ランダム選択（重みが高いほど選ばれやすい）
function weightedRandomChoice(items, weightFn) {
  const weights = items.map(weightFn);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  
  return items[0];  // フォールバック
}

// 単純なランダム選択
function randomChoice(items) {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}
5.3 記憶最適化アルゴリズム
javascriptCopy/**
 * 記憶定着のための最適な復習スケジュール生成
 * エビングハウスの忘却曲線に基づいたスパーシング効果を活用
 * 
 * @param {Object} question - 問題オブジェクト
 * @param {Date} answeredDate - 回答日時
 * @param {boolean} wasCorrect - 正解だったか
 * @return {Object} 復習スケジュール
 */
function generateReviewSchedule(question, answeredDate, wasCorrect) {
  // 基本的な復習間隔設定（日数）
  const baseIntervals = [1, 3, 7, 14, 30, 90];
  
  // 難易度による調整（難しい問題はより頻繁に復習）
  const difficultyFactor = 1 + (0.2 * (question.difficulty - 1));
  
  // 不正解だった場合はより頻繁に復習
  const correctnessFactor = wasCorrect ? 1 : 0.5;
  
  // 最終的な復習間隔計算
  const adjustedIntervals = baseIntervals.map(interval => 
    Math.max(1, Math.round(interval * correctnessFactor / difficultyFactor))
  );
  
  // 復習日時の計算
  const reviewDates = adjustedIntervals.map(interval => {
    const date = new Date(answeredDate);
    date.setDate(date.getDate() + interval);
    return date.toISOString().split('T')[0];  // YYYY-MM-DD形式
  });
  
  return {
    questionId: question.id,
    difficulty: question.difficulty,
    reviewDates: reviewDates
  };
}
6. データの拡張性と互換性
6.1 科目拡張スキーマ
jsonCopy{
  "subjects": [
    {
      "id": "social",
      "name": "社会",
      "icon": "social.webp",
      "topics": [
        {
          "id": "industry",
          "name": "水産業・資源・工業",
          "questionCount": 80
        },
        {
          "id": "geography",
          "name": "地理",
          "questionCount": 65
        }
      ]
    },
    {
      "id": "science",
      "name": "理科",
      "icon": "science.webp",
      "topics": [
        {
          "id": "plants",
          "name": "植物",
          "questionCount": 40
        },
        {
          "id": "electricity",
          "name": "電気",
          "questionCount": 35
        }
      ]
    }
  ]
}
6.2 問題タイプ拡張
jsonCopy{
  "questionTypes": [
    {
      "type": "text",
      "description": "テキストのみの問題",
      "component": "TextQuestion"
    },
    {
      "type": "image",
      "description": "画像を含む問題",
      "component": "ImageQuestion"
    },
    {
      "type": "matching",
      "description": "マッチング問題",
      "component": "MatchingQuestion"
    },
    {
      "type": "sorting",
      "description": "並べ替え問題",
      "component": "SortingQuestion"
    },
    {
      "type": "fill-in",
      "description": "穴埋め問題",
      "component": "FillInQuestion"
    }
  ]
}
6.3 バージョン互換性管理
javascriptCopy/**
 * データスキーマのバージョン管理と移行
 */
const schemaVersions = {
  "1.0": {
    // 初期スキーマ定義
  },
  "1.1": {
    // 変更点とマイグレーション関数
    migrate: function(oldData) {
      // 1.0から1.1へのデータ変換ロジック
      return newData;
    }
  },
  "1.2": {
    // 次のバージョンの変更点
    migrate: function(oldData) {
      // 1.1から1.2へのデータ変換ロジック
      return newData;
    }
  }
};

/**
 * 現在のデータをチェックして必要ならマイグレーション
 */
function checkAndMigrateData(userData) {
  const currentVersion = userData.schemaVersion || "1.0";
  const latestVersion = Object.keys(schemaVersions).pop();
  
  if (currentVersion === latestVersion) return userData;
  
  // バージョンのインデックスを特定
  const versions = Object.keys(schemaVersions);
  const currentIndex = versions.indexOf(currentVersion);
  
  // 順番に各バージョンのマイグレーションを適用
  let migratedData = {...userData};
  for (let i = currentIndex + 1; i < versions.length; i++) {
    const version = versions[i];
    migratedData = schemaVersions[version].migrate(migratedData);
    migratedData.schemaVersion = version;
  }
  
  return migratedData;
}