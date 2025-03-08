# 猫先生のクイズチャレンジ

**完成版開発仕様書**

---

## 🎯 プロジェクト概要

「猫先生のクイズチャレンジ」は、小学生向けの学習強化アプリです。クイズ形式の問題に答えながら楽しく学べる一方、ユニークな「煽り機能」と「ランクシステム」により、ユーザーの競争心と向上心を刺激する設計になっています。

複数の教科（社会、理科など）に対応し、問題データをJSONで柔軟に管理できる拡張性の高いシステムを実現します。グラフィックレコーディング風の親しみやすいデザインで、子供が自発的に学習したくなる環境を提供します。

## 📁 プロジェクト構成

```
project/
├── public/
│   ├── data/                      # JSONデータファイル
│   │   ├── subjects.json           # 教科・トピック情報
│   │   ├── social_industry.json    # 社会（水産業・資源・工業）
│   │   ├── science_plants.json     # 理科（植物）
│   │   └── ...
│   └── assets/                    # 画像・音声リソース
│       ├── characters/             # キャラクター画像
│       ├── ranks/                  # ランクアイコン
│       ├── questions/              # 問題関連画像
│       └── ui/                     # UI要素
├── src/
│   ├── components/                # Vue/Reactコンポーネント
│   ├── views/                     # ページコンポーネント
│   ├── store/                     # 状態管理
│   ├── services/                  # データ管理・外部サービス連携
│   ├── styles/                    # グラフィックレコーディングスタイル
│   ├── router/                    # ルーティング
│   └── utils/                     # ユーティリティ関数
└── ...
```

## 📱 UI/UX設計

### ホーム画面
- **メインメニュー**：大きなアイコンとテキストの組み合わせ
- **主要ボタン**：
  - 「学習を始める」→ 教科選択画面へ
  - 「間違えた問題」→ 復習モードへ
  - 「設定」→ 環境設定画面へ
- **ランク表示**：現在のランクをアニメーション付きで表示
- **グラフィックレコーディング風**：手書き風フォントと装飾要素

### 教科選択画面
- 各教科をカードで表示（社会、理科など）
- カードに教科アイコンと名前を表示
- タップで単元選択画面へ遷移

### 単元選択画面
- 選択した教科の単元をカードで表示
- 各カードに問題数・難易度・対象年齢を表示
- タップで学習開始

### 学習画面
- 問題表示エリア：十分な余白を確保し、読みやすさ重視
- 選択肢：大きなボタンで、タップしやすいサイズに設計
- 進捗表示：現在の問題番号と全体の進捗バーを上部に表示
- キャラクター表示：問題の難易度に応じたキャラクターを表示
- フィードバック：解答後のフィードバックは画面中央に大きく表示

## 🐱 特徴的な機能

### 猫ミームによる煽り機能
- **不正解時**：様々な表情の猫ミームがランダムで登場
- **煽りテキスト例**：
  - 「ええっ、そんなの小学生でも分かるにゃー」
  - 「その調子だと猫の方が賢いかも...」
  - 「本気出してにゃいの？」
- **煽りレベル**：設定で調整可能（優しめ〜本格的な煽りまで）

### ランク下落システム
- **初期ランク**：「天才児」からスタート
- **ランク段階**：天才児→秀才→普通の子→ちょっと残念な子→がんばれ→猫以下
- **視覚効果**：ランクごとに異なるアイコンや背景色を適用
- **回復システム**：連続正解でランクが回復する仕組み
- **比較表示**：「昨日までのランク」と「現在のランク」を表示

### 間違えた問題の管理
- **専用ページ**：「間違えた問題」専用セクション
- **表示方法**：日付ごとにグループ化して表示
- **機能**：
  - 各問題の横に「クリア」ボタン
  - 「すべてクリア」ボタン
  - 間違えた回数の表示（特に何度も間違える問題を強調）

### 複数教科対応
- 様々な教科の問題データに対応
- 教科や単元の追加が容易なJSON構造
- 教科ごとの進捗状況を個別に管理

## 📊 データ構造

### 教科・単元マネージャー（subjects.json）

```json
{
  "version": "1.0",
  "lastUpdated": "2023-06-15",
  "subjects": [
    {
      "code": "social",
      "name": "社会",
      "icon": "social_icon.webp",
      "color": "#4B89DC",
      "topics": [
        {
          "code": "industry",
          "name": "水産業・資源・工業",
          "icon": "industry_icon.webp",
          "dataFile": "social_industry.json",
          "questionCount": 80,
          "difficulty": "初級〜中級",
          "targetAge": 10
        }
      ]
    },
    {
      "code": "science",
      "name": "理科",
      "icon": "science_icon.webp",
      "color": "#2ECC71",
      "topics": [
        {
          "code": "plants",
          "name": "植物",
          "icon": "plants_icon.webp",
          "dataFile": "science_plants.json",
          "questionCount": 40,
          "difficulty": "初級",
          "targetAge": 9
        }
      ]
    }
  ]
}
```

### 問題データ（各教科・単元ごとのJSON）

```json
{
  "metadata": {
    "version": "1.0",
    "subject": "社会",
    "subjectCode": "social",
    "topic": "水産業・資源・工業",
    "topicCode": "industry",
    "keyTerms": ["水産業", "養殖漁業", "エネルギー", "石灰石", "工業地帯", "太平洋ベルト"],
    "targetAge": 10,
    "questionCount": 80,
    "lastUpdated": "2023-06-15",
    "inputType": "OCR処理結果",
    "memoryOptimization": {
      "repetitionPattern": "同じ概念を段階的に繰り返す問題構成",
      "reviewSchedule": ["初回学習後", "1日後", "3日後", "1週間後"]
    }
  },
  "questions": [
    {
      "id": "q001",
      "type": "text",
      "difficulty": 1,
      "character": "ねこ先生",
      "question": "にゃにゃ？日本人1人あたりの魚介類の消費量は、2001年頃をピークにどうなっているのか教えてほしいニャ？",
      "options": [
        "少しずつ増え続けているニャ",
        "減少傾向にあるニャ",
        "ずっと一定だニャ",
        "一気にゼロになったニャ"
      ],
      "correctAnswer": 1,
      "explanation": "2001年に約40kgだった消費量が2021年には約23kgと減少しているんだニャ。",
      "memoryTip": "2001年→40kg→今は約半分、と数字で覚えるニャ！",
      "tags": ["水産業", "消費動向"]
    }
  ],
  "learningPath": {
    "recommendedSequence": ["q001", "q002", "q003"],
    "repetitionGroups": {
      "漁業": ["q001", "q005", "q009"],
      "資源・エネルギー": ["q002", "q006", "q010"]
    }
  }
}
```

### ユーザーデータ（ローカルストレージ）

```json
{
  "user": {
    "lastActive": "2023-06-15T10:30:00",
    "settings": {
      "catMemeLevel": "medium",
      "soundEnabled": true,
      "theme": "default"
    },
    "subjects": {
      "social": {
        "industry": {
          "progress": 0.35,
          "currentRank": "excellent",
          "previousRank": "genius",
          "mistakePoints": 15,
          "consecutiveCorrect": 0,
          "lastQuestion": "q025",
          "completedQuestions": ["q001", "q002", "..."],
          "mistakes": [
            {
              "id": "q003",
              "mistakeCount": 2,
              "lastMistake": "2023-06-15T10:28:00"
            }
          ]
        }
      },
      "science": {
        "plants": {
          "progress": 0.15,
          "currentRank": "genius",
          "previousRank": "genius",
          "mistakePoints": 5,
          "consecutiveCorrect": 2,
          "lastQuestion": "sci_plant_006",
          "completedQuestions": ["sci_plant_001", "..."],
          "mistakes": []
        }
      }
    },
    "statistics": {
      "totalAnswered": 40,
      "totalCorrect": 32,
      "accuracyRate": 80,
      "studyTimeToday": 15,
      "totalStudyTime": 120,
      "lastStudyDate": "2023-06-15"
    }
  }
}
```

## 🎨 グラフィックレコーディング風デザイン

### カラースキーム

```xml
<palette>
  <color name='ファッション-1' rgb='593C47' r='89' g='59' b='70' />
  <color name='ファッション-2' rgb='F2E63D' r='242' g='230' b='60' />
  <color name='ファッション-3' rgb='F2C53D' r='242' g='196' b='60' />
  <color name='ファッション-4' rgb='F25C05' r='242' g='91' b='4' />
  <color name='ファッション-5' rgb='F24405' r='242' g='68' b='4' />
</palette>
```

### タイポグラフィ

- **フォント**:
  - Yomogi: タイトル用
  - Zen Kurenaido: 見出し用
  - Kaisei Decol: 本文用

### デザイン要素

- 手描き風のフレーム、ボタン、アイコン
- マーカーや下線によるキーワード強調
- 手描き風の矢印や吹き出し
- 賑やかで親しみやすいキャラクターイラスト

## 🧩 必要な画像リソース

### キャラクター画像
- **ねこ先生**（難易度1）: 通常、喜び、煽り表情
- **うさぎコーチ**（難易度1-2）: 通常、喜び、煽り表情
- **ふくろう教授**（難易度2）: 通常、喜び、煽り表情
- **わんわん博士**（難易度3）: 通常、喜び、煽り表情

### ランクアイコン
- 天才児、秀才、普通の子、ちょっと残念な子、がんばれ、猫以下

### 問題関連画像
- 各教科・単元に対応した問題画像
- 例：teichi_ami_2.jpg（定置網）, daikon_root.webp（大根の根）など

### UI要素
- 手描き風ボタン、フレーム、装飾要素、背景素材

## 🔧 技術スタック

### フロントエンド
- **言語**: HTML, CSS, JavaScript
- **フレームワーク**: Vue.js（推奨）またはReact
- **スタイリング**: CSS/SCSS（グラフィックレコーディング風カスタムスタイル）
- **アニメーション**: CSS Animations + GreenSock

### バックエンド
- **データ保存**:
  - ローカルストレージ: ユーザー設定と進捗データ
  - IndexedDB: 問題データのキャッシュ
- **問題データ管理**: 静的JSONファイル

## 👨‍💻 実装ステップ

1. **基盤構築**
   - プロジェクト初期化と環境設定
   - ディレクトリ構造とコンポーネント設計
   - グラフィックレコーディング風スタイルシートの作成

2. **データ管理システム**
   - 教科・単元管理システムの実装
   - JSONローダーとパーサーの作成
   - ユーザーデータ管理システムの実装

3. **UI/UXコンポーネント実装**
   - ホーム画面、教科選択画面、単元選択画面
   - 問題表示コンポーネント
   - フィードバックと結果表示

4. **特殊機能実装**
   - 猫ミームシステム
   - ランクシステム
   - 間違えた問題管理システム

5. **データ永続化**
   - ローカルストレージ統合
   - 進捗データ管理
   - 設定と環境設定システム

6. **最適化・検証**
   - パフォーマンス最適化
   - レスポンシブ対応
   - ブラウザ互換性テスト

## 🔄 ユーザーフロー

```
アプリ起動
   │
   ▼
ホーム画面
   │
   ├───────────────────┐             ┌───────────────────┐
   ▼                   │             │                   ▼
「学習を始める」         │             │          「間違えた問題」
   │                   │             │                   │
   ▼                   │             │                   ▼
教科選択画面            │             │            間違えた問題リスト
   │                   │             │                   │
   ▼                   │             │                   ▼
単元選択画面            │             │            問題をランダム選択
   │                   │             │                   │
   ▼                   │             │                   │
問題をランダムに表示 ◀───┘             └───────────▶ 問題表示
   │                                                     │
   ▼                                                     ▼
回答選択                                               回答選択
   │                                                     │
   ├───────┬───────┐                           ├───────┬───────┐
   ▼        ▼        ▼                           ▼        ▼        ▼
 正解     不正解     パス                       正解     不正解     パス
   │         │        │                           │        │        │
   │         ▼        ▼                           │        ▼        ▼
   │     猫ミーム表示  解説                        │      解説      解説
   │         │        │                           │        │        │
   └───────▶│◀───────┘                           └────────┴────────┘
            │                                                │
            ▼                                                │
        次の問題                                             │
            │                                                │
            ▼                                                │
   問題が残っているか？                                       │
   ├── はい ──┐                                             │
   │          ▼                                             │
   │     次の問題表示 ◀────────────────────────────────────┘
   │          │
   │          ▼
   └── いいえ ──▶ 結果画面
                   │
                   ▼
               ホーム画面へ戻る
```

## ⚡ 実装上のポイント

### データ管理
- JSONファイルは教科・単元ごとに分割管理
- subjects.jsonで全体構造を制御し、柔軟な拡張性を確保
- ユーザー進捗も教科・単元ごとに保存

### UI/UX
- タッチ操作に最適化した大きなボタンとタップターゲット
- 十分な余白と読みやすいフォント
- 視覚的な進捗表示でモチベーション維持

### パフォーマンス
- 画像は最適化されたWebP形式（フォールバックとしてJPG/PNG）
- 問題データは初回起動時にIndexedDBにキャッシュ
- 必要なデータのみを事前読み込み

## 🔍 テスト戦略

- **単体テスト**: 各コンポーネント・関数のテスト
- **統合テスト**: データフローとコンポーネント連携のテスト
- **E2Eテスト**: ユーザーフローの検証
- **パフォーマンステスト**: 読み込み時間と応答性のテスト
- **ユーザビリティテスト**: 子供による実際の使用感テスト

## 📈 拡張性と今後の展望

- **教科・単元の追加**: JSONファイルの追加のみで新しい学習コンテンツを拡張可能
- **協力学習モード**: 友達や家族との競争・協力モード
- **カスタマイズ問題**: 教師や保護者が独自の問題セットを作成できる機能
- **学習分析ダッシュボード**: 進捗や弱点を視覚的に確認できる分析機能

## 📝 最終チェックリスト

- [ ] 必要な画像リソースの準備
- [ ] グラフィックレコーディング風スタイルの実装
- [ ] JSONデータの準備と検証
- [ ] ユーザーデータ管理システムの実装
- [ ] 主要UI/UXコンポーネントの実装
- [ ] 特殊機能（猫ミーム、ランクシステム）の実装
- [ ] パフォーマンス最適化とテスト
- [ ] ブラウザ互換性の確認
- [ ] ユーザビリティテスト

---

**注意**: この仕様書は開発の基盤となるものです。実装の詳細については、必要に応じて各セクションを追加の技術文書で補完してください。