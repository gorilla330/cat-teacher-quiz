# 複数教科対応JSONデータ仕様

## 1. 概要

「猫先生のクイズチャレンジ」アプリは、社会科に加えて理科など複数の教科に対応できるよう拡張します。このドキュメントでは、複数教科のJSONデータを柔軟に追加・削除・切り替えるための標準化されたデータ構造と実装方法を定義します。

## 2. 標準化されたJSONデータ構造

### 2.1 ルート構造

```json
{
  "metadata": {
    "version": "1.0",
    "subject": "社会",               // 教科名
    "subjectCode": "social",         // 教科コード（一意）
    "topic": "水産業・資源・工業",    // トピック/単元名
    "topicCode": "industry",         // トピックコード（一意）
    "keyTerms": [...],               // キーワード
    "targetAge": 10,                 // 対象年齢
    "questionCount": 80,             // 問題数
    "lastUpdated": "2023-06-15",     // 最終更新日
    "inputType": "OCR処理結果",
    "memoryOptimization": {...}
  },
  "questions": [...],
  "learningPath": {...}
}
```

### 2.2 教科情報ファイル

各教科・単元の一覧と、それぞれに対応するJSONファイルのマッピングを管理するファイルを別途作成します。

**subjects.json**:
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
        },
        {
          "code": "geography",
          "name": "地理",
          "icon": "geography_icon.webp",
          "dataFile": "social_geography.json",
          "questionCount": 65,
          "difficulty": "初級〜上級",
          "targetAge": 11
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
        },
        {
          "code": "electricity",
          "name": "電気",
          "icon": "electricity_icon.webp",
          "dataFile": "science_electricity.json",
          "questionCount": 35,
          "difficulty": "中級",
          "targetAge": 10
        }
      ]
    }
  ]
}
```

## 3. データファイル命名規則

教科や単元を特定しやすいよう、一貫した命名規則を導入します。

### 3.1 JSONファイル名

```
{教科コード}_{トピックコード}.json
```

例：
- `social_industry.json`（社会科・水産業・資源・工業）
- `science_plants.json`（理科・植物）

### 3.2 画像ファイル名

問題で使用される画像ファイルも教科・トピックごとに整理します。

```
{教科コード}_{トピックコード}_{画像ID}.{拡張子}
```

例：
- `social_industry_teichi_ami.webp`
- `science_plants_photosynthesis.webp`

## 4. データローディングシステム

### 4.1 技術実装

ウェブアプリケーション内で複数JSONファイルを読み込み、切り替える基本的な実装例です。

```javascript
// データ管理サービス
class DataManager {
  constructor() {
    this.subjects = null;        // 教科情報
    this.currentData = null;     // 現在表示中の問題データ
    this.currentSubject = null;  // 現在選択中の教科
    this.currentTopic = null;    // 現在選択中のトピック
  }
  
  // 初期化: 教科情報の読み込み
  async initialize() {
    try {
      const response = await fetch('/data/subjects.json');
      this.subjects = await response.json();
      return this.subjects;
    } catch (error) {
      console.error('教科情報の読み込みに失敗しました:', error);
      throw error;
    }
  }
  
  // 教科とトピックを指定してデータを読み込む
  async loadQuestions(subjectCode, topicCode) {
    // 教科情報から該当するトピックを検索
    const subject = this.subjects.subjects.find(s => s.code === subjectCode);
    if (!subject) throw new Error(`教科「${subjectCode}」が見つかりません`);
    
    const topic = subject.topics.find(t => t.code === topicCode);
    if (!topic) throw new Error(`トピック「${topicCode}」が見つかりません`);
    
    // JSONデータを読み込む
    try {
      const response = await fetch(`/data/${topic.dataFile}`);
      this.currentData = await response.json();
      this.currentSubject = subject;
      this.currentTopic = topic;
      return this.currentData;
    } catch (error) {
      console.error(`問題データの読み込みに失敗しました: ${topic.dataFile}`, error);
      throw error;
    }
  }
  
  // 利用可能な教科の一覧を取得
  getAvailableSubjects() {
    return this.subjects ? this.subjects.subjects : [];
  }
  
  // 特定の教科の利用可能なトピック一覧を取得
  getAvailableTopics(subjectCode) {
    const subject = this.subjects.subjects.find(s => s.code === subjectCode);
    return subject ? subject.topics : [];
  }
}

// 使用例
async function initApp() {
  const dataManager = new DataManager();
  await dataManager.initialize();
  
  // 教科選択UI
  renderSubjectSelector(dataManager.getAvailableSubjects());
  
  // デフォルト: 最初の教科と最初のトピックを読み込む
  const firstSubject = dataManager.getAvailableSubjects()[0];
  const firstTopic = firstSubject.topics[0];
  await dataManager.loadQuestions(firstSubject.code, firstTopic.code);
  
  // アプリケーション開始
  startQuiz(dataManager.currentData);
}
```

### 4.2 ユーザーインターフェース

複数の教科・トピックをユーザーが選択するための直感的なUIを提供します。

```html
<!-- 教科選択画面 -->
<div class="gr-subject-selector">
  <h2 class="gr-title">学習する教科を選んでね</h2>
  
  <div class="gr-subjects-grid">
    <!-- 教科カード（各教科ごとに生成） -->
    <div class="gr-subject-card" data-subject="social">
      <img src="assets/icons/social_icon.webp" alt="社会" class="gr-subject-icon">
      <h3>社会</h3>
    </div>
    
    <div class="gr-subject-card" data-subject="science">
      <img src="assets/icons/science_icon.webp" alt="理科" class="gr-subject-icon">
      <h3>理科</h3>
    </div>
    
    <!-- 他の教科... -->
  </div>
</div>

<!-- トピック選択画面（教科選択後に表示） -->
<div class="gr-topic-selector" data-subject="social">
  <h2 class="gr-title">どの単元で学習する？</h2>
  
  <div class="gr-topics-grid">
    <!-- トピックカード（選択した教科のトピックごとに生成） -->
    <div class="gr-topic-card" data-topic="industry">
      <img src="assets/icons/industry_icon.webp" alt="水産業・資源・工業" class="gr-topic-icon">
      <h3>水産業・資源・工業</h3>
      <p>問題数: 80問</p>
      <p>難易度: 初級〜中級</p>
    </div>
    
    <div class="gr-topic-card" data-topic="geography">
      <img src="assets/icons/geography_icon.webp" alt="地理" class="gr-topic-icon">
      <h3>地理</h3>
      <p>問題数: 65問</p>
      <p>難易度: 初級〜上級</p>
    </div>
    
    <!-- 他のトピック... -->
  </div>
</div>
```

## 5. 理科問題のJSONサンプル

以下は、理科（植物）の問題データJSONサンプルです。社会科のJSONとの互換性を確保しつつ、理科特有の要素も取り入れています。

```json
{
  "metadata": {
    "version": "1.0",
    "subject": "理科",
    "subjectCode": "science",
    "topic": "植物",
    "topicCode": "plants",
    "keyTerms": [
      "光合成",
      "根・茎・葉",
      "花と実",
      "植物の成長",
      "植物の分類"
    ],
    "targetAge": 9,
    "questionCount": 40,
    "lastUpdated": "2023-06-20",
    "inputType": "教材作成",
    "memoryOptimization": {
      "repetitionPattern": "関連性のある概念をグループ化した問題構成",
      "reviewSchedule": [
        "初回学習後",
        "1日後",
        "3日後",
        "1週間後"
      ]
    }
  },
  "questions": [
    {
      "id": "sci_plant_001",
      "type": "text",
      "difficulty": 1,
      "character": "ねこ先生",
      "question": "植物が光合成を行うために必要なものは何かニャ？",
      "options": [
        "二酸化炭素と水と太陽の光ニャ",
        "酸素と土だけニャ",
        "塩と砂糖ニャ",
        "月の光だけニャ"
      ],
      "correctAnswer": 0,
      "explanation": "植物は二酸化炭素と水と太陽の光を使って、光合成を行っているんだニャ。",
      "memoryTip": "「光合成＝光＋CO2＋H2O→酸素＋栄養」と覚えるニャ！",
      "tags": ["光合成", "基本"]
    },
    {
      "id": "sci_plant_002",
      "type": "image",
      "difficulty": 1,
      "character": "うさぎコーチ",
      "question": "次の写真の植物の根はどんな特徴があるかぴょん？",
      "imageRequirements": {
        "description": "大根の根の断面図",
        "key_elements": ["主根（太い根）", "側根（細い根）"],
        "searchTerms": ["大根の根", "根の構造"],
        "fileName": "science_plants_daikon_root.webp"
      },
      "options": [
        "養分を蓄えて太くなっているぴょん",
        "空気を吸うための気孔があるぴょん",
        "光合成しているぴょん",
        "花が咲くぴょん"
      ],
      "correctAnswer": 0,
      "explanation": "大根のような根は、養分をたくさん蓄えて太くなっているんだぴょん。",
      "memoryTip": "「大根の太い部分=養分の貯蔵庫」と覚えるぴょん！",
      "tags": ["根", "貯蔵"]
    }
    // 他の問題...
  ],
  "learningPath": {
    "recommendedSequence": [
      "sci_plant_001", "sci_plant_002", "sci_plant_003"
      // ...
    ],
    "repetitionGroups": {
      "光合成": ["sci_plant_001", "sci_plant_005", "sci_plant_009"],
      "植物の器官": ["sci_plant_002", "sci_plant_006", "sci_plant_010"]
      // 他のグループ...
    }
  }
}
```

## 6. データ拡張と更新戦略

### 6.1 新しい教科・トピックの追加手順

1. 教科・トピックのJSONファイルを作成（既存フォーマットに準拠）
2. `subjects.json` に新しい教科・トピック情報を追加
3. 必要な問題画像ファイルを適切なディレクトリに配置

### 6.2 データ更新とバージョン管理

```javascript
// 起動時にデータの更新を確認
async function checkForUpdates() {
  try {
    // ローカルに保存されたバージョン情報
    const localVersion = localStorage.getItem('data-version');
    
    // サーバー側のバージョン情報を取得
    const response = await fetch('/data/version.json');
    const serverVersion = await response.json();
    
    // バージョンチェック
    if (!localVersion || localVersion !== serverVersion.version) {
      // 更新が必要なデータを特定
      const updates = await fetchUpdatesInfo(localVersion, serverVersion.version);
      
      // 更新の適用
      await applyUpdates(updates);
      
      // ローカルバージョン情報を更新
      localStorage.setItem('data-version', serverVersion.version);
      
      return true; // 更新があった
    }
    
    return false; // 更新なし
  } catch (error) {
    console.error('更新の確認に失敗しました:', error);
    return false;
  }
}
```

### 6.3 Gitリポジトリとの連携

```shell
# 新しい問題データをリポジトリに追加
git add data/science_electricity.json
git commit -m "電気の単元に関する問題を追加"
git push

# データ更新時のワークフロー
git pull                       # 最新のデータを取得
npm run validate-json          # JSONの検証
npm run build                  # アプリケーションビルド
npm run deploy                 # デプロイ
```

## 7. データ検証と整合性チェック

### 7.1 JSONスキーマバリデーション

```javascript
// JSON検証スクリプト
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

// JSONスキーマを読み込み
const questionSchema = require('./schemas/question-schema.json');

// バリデーター初期化
const ajv = new Ajv();
const validate = ajv.compile(questionSchema);

// 指定ディレクトリのすべてのJSONファイルを検証
function validateAllJsonFiles(directory) {
  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith('.json'));
  
  let hasErrors = false;
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const valid = validate(data);
    if (!valid) {
      console.error(`${file} は無効です:`, validate.errors);
      hasErrors = true;
    } else {
      console.log(`${file} は有効です`);
    }
  });
  
  return !hasErrors;
}

// 使用例
const isValid = validateAllJsonFiles('./data');
process.exit(isValid ? 0 : 1);
```

### 7.2 クロスリファレンスチェック

```javascript
// subjects.jsonとの整合性チェック
function checkCrossReferences() {
  // subjects.jsonを読み込み
  const subjects = JSON.parse(fs.readFileSync('./data/subjects.json', 'utf8'));
  
  // 各ファイルが実際に存在するか確認
  let allValid = true;
  
  subjects.subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      const filePath = path.join('./data', topic.dataFile);
      
      // ファイルの存在チェック
      if (!fs.existsSync(filePath)) {
        console.error(`Error: ${topic.dataFile} not found`);
        allValid = false;
        return;
      }
      
      // ファイル内容の整合性チェック
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // 教科コードとトピックコードのチェック
      if (data.metadata.subjectCode !== subject.code) {
        console.error(`Error: ${topic.dataFile} has incorrect subjectCode`);
        allValid = false;
      }
      
      if (data.metadata.topicCode !== topic.code) {
        console.error(`Error: ${topic.dataFile} has incorrect topicCode`);
        allValid = false;
      }
      
      // 問題数のチェック
      if (data.questions.length !== topic.questionCount) {
        console.warn(`Warning: ${topic.dataFile} claims ${topic.questionCount} questions but has ${data.questions.length}`);
      }
    });
  });
  
  return allValid;
}
```

## 8. 複数科目間の連携

異なる教科の問題を組み合わせたミックスモードなど、教科連携機能も実装可能です。

```javascript
// 複数科目混合モード
async function createMixedSubjectQuiz(options = {}) {
  const { subjects = [], questionCount = 20, difficulty = null } = options;
  
  let allQuestions = [];
  
  // 指定した教科のデータを読み込む
  for (const subject of subjects) {
    for (const topic of subject.topics) {
      const data = await loadQuestionData(subject.code, topic.code);
      
      // 難易度でフィルタリング（指定がある場合）
      let filteredQuestions = difficulty !== null 
        ? data.questions.filter(q => q.difficulty === difficulty)
        : data.questions;
        
      // 教科・トピック情報を各問題に追加
      filteredQuestions = filteredQuestions.map(q => ({
        ...q,
        subjectCode: subject.code,
        subjectName: subject.name,
        topicCode: topic.code,
        topicName: topic.name
      }));
      
      allQuestions = [...allQuestions, ...filteredQuestions];
    }
  }
  
  // ランダムに問題を選択
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, questionCount);
}
```

この複数教科対応JSONデータ仕様に基づいて実装することで、将来的に様々な教科のデータを柔軟に追加・管理できるシステムが実現します。