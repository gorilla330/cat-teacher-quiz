# グラフィックレコーディング風デザイン仕様

## 1. デザインコンセプト

「猫先生のクイズチャレンジ」アプリは、超一流デザイナーが作成したような、日本語で完璧なグラフィックレコーディング風のビジュアルデザインを目指します。手書き風の図形やアイコンを活用して内容を視覚的に表現し、子供が親しみやすく直感的に操作できる環境を提供します。

## 2. カラースキーム

```xml
<palette>
  <color name='ファッション-1' rgb='593C47' r='89' g='59' b='70' />
  <color name='ファッション-2' rgb='F2E63D' r='242' g='230' b='60' />
  <color name='ファッション-3' rgb='F2C53D' r='242' g='196' b='60' />
  <color name='ファッション-4' rgb='F25C05' r='242' g='91' b='4' />
  <color name='ファッション-5' rgb='F24405' r='242' g='68' b='4' />
</palette>
```

### 2.1 色の使用ガイドライン

- **プライマリーカラー** (`#593C47`): 見出し、重要テキスト、フレームのアウトライン
- **アクセントカラー1** (`#F2E63D`): 強調ポイント、マーカーハイライト
- **アクセントカラー2** (`#F2C53D`): セカンダリーアクセント、装飾要素
- **アクセントカラー3** (`#F25C05`): ボタン、重要UI要素
- **アクセントカラー4** (`#F24405`): 警告、注意喚起、特別な状態

## 3. タイポグラフィ

### 3.1 フォント指定

```html
<style> 
@import url('https://fonts.googleapis.com/css2?family=Kaisei+Decol&family=Yomogi&family=Zen+Kurenaido&display=swap'); 
</style>
```

### 3.2 フォント階層

- **タイトル**: Yomogi, 32px, グラデーション効果, 太字
  ```css
  .gr-title {
    font-family: 'Yomogi', cursive;
    font-size: 32px;
    font-weight: bold;
    background: linear-gradient(to right, #F25C05, #F24405);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  ```

- **サブタイトル**: Zen Kurenaido, 16px, #475569
  ```css
  .gr-subtitle {
    font-family: 'Zen Kurenaido', sans-serif;
    font-size: 16px;
    color: #475569;
  }
  ```

- **セクション見出し**: Zen Kurenaido, 18px, #1e40af, アイコン付き
  ```css
  .gr-section {
    font-family: 'Zen Kurenaido', sans-serif;
    font-size: 18px;
    color: #1e40af;
    position: relative;
    padding-left: 28px;
  }
  
  .gr-section::before {
    content: '✏️';
    position: absolute;
    left: 0;
  }
  ```

- **本文**: Kaisei Decol, 14px, #334155, 行間1.4
  ```css
  .gr-text {
    font-family: 'Kaisei Decol', serif;
    font-size: 14px;
    line-height: 1.4;
    color: #334155;
  }
  ```

## 4. グラフィックレコーディング要素

### 4.1 基本レイアウト

- 左上から右へ、上から下へと情報を順次配置
- 情報のまとまりごとに空間を明確に区切る
- 関連する情報をグループ化して視覚的に接近させる

### 4.2 視覚要素

- **囲み線**: 手描き風の不規則な線
  ```css
  .gr-frame {
    border: 3px solid #593C47;
    border-radius: 15px;
    position: relative;
    box-shadow: 3px 3px 0 rgba(89, 60, 71, 0.3);
  }
  
  /* 手描き風効果 */
  .gr-frame::after {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    width: 20px;
    height: 8px;
    background: #593C47;
    border-radius: 50% 50% 0 0;
  }
  ```

- **矢印・線**: 直線ではなく曲線で表現
  ```css
  .gr-arrow {
    position: relative;
    padding-right: 30px;
  }
  
  .gr-arrow::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    width: 20px;
    height: 10px;
    background: url('path/to/hand-drawn-arrow.svg') no-repeat;
    background-size: contain;
  }
  ```

- **マーカー/ハイライト**: 色付き下線、マーカー効果
  ```css
  .gr-highlight {
    background: linear-gradient(transparent 60%, #F2E63D 40%);
    font-weight: bold;
  }
  ```

- **吹き出し**: 手描き風の不規則な形状
  ```css
  .gr-bubble {
    position: relative;
    background: white;
    border: 2px solid #593C47;
    border-radius: 15px;
    padding: 10px 15px;
  }
  
  .gr-bubble::before {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 30px;
    width: 20px;
    height: 15px;
    background: url('path/to/hand-drawn-bubble-tail.svg') no-repeat;
    background-size: contain;
  }
  ```

### 4.3 アイコン・装飾

- **手描き風アイコン**: 各セクションの特性を表現
  ```html
  <div class="gr-icon gr-icon-question">問題</div>
  <div class="gr-icon gr-icon-answer">答え</div>
  ```

- **区切り線**: 波線やジグザグ線で区切り
  ```css
  .gr-divider {
    height: 20px;
    background: url('path/to/hand-drawn-divider.svg') repeat-x;
    background-size: 50px 20px;
    border: none;
    margin: 20px 0;
  }
  ```

- **コーナー装飾**: ページの角や余白を活用した装飾
  ```css
  .gr-corner-deco {
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: url('path/to/hand-drawn-corner.svg') no-repeat;
    background-size: contain;
    pointer-events: none; /* 操作の妨げにならないように */
  }
  ```

## 5. カード型コンポーネント

### 5.1 基本カード

```css
.gr-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  padding: 20px;
  position: relative;
  margin-bottom: 25px;
}

.gr-card::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 20px;
  width: 30px;
  height: 30px;
  background: url('path/to/hand-drawn-pin.svg') no-repeat;
  background-size: contain;
}
```

### 5.2 機能別カード

```css
/* 問題表示カード */
.gr-card-question {
  border-left: 5px solid #F25C05;
}

/* 答え表示カード */
.gr-card-answer {
  border-left: 5px solid #F2E63D;
}

/* 結果表示カード */
.gr-card-result {
  border-left: 5px solid #593C47;
}
```

## 6. ボタンとインタラクション

### 6.1 手描き風ボタン

```css
.gr-button {
  position: relative;
  padding: 10px 20px;
  background: #F25C05;
  color: white;
  font-family: 'Zen Kurenaido', sans-serif;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 0 #F24405;
  transform: translateY(0);
  transition: transform 0.2s, box-shadow 0.2s;
}

.gr-button:hover {
  background: #F24405;
}

.gr-button:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #F24405;
}
```

### 6.2 アニメーション効果

```css
/* 正解時の喜びアニメーション */
@keyframes celebrate {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.gr-celebrate {
  animation: celebrate 0.5s ease;
}

/* 間違った時のアニメーション */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.gr-shake {
  animation: shake 0.5s ease;
}
```

## 7. グラスモーフィズム活用

```css
.gr-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
}
```

## 8. レスポンシブデザイン

```css
/* モバイル基本設定 */
.gr-container {
  padding: 15px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

/* タブレット以上 */
@media (min-width: 768px) {
  .gr-container {
    padding: 20px;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* デスクトップ */
@media (min-width: 1024px) {
  .gr-container {
    padding: 30px;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
}
```

## 9. 実装サンプル

### 9.1 グラフィックレコーディング風ヘッダー

```html
<header class="gr-header">
  <h1 class="gr-title">猫先生のクイズチャレンジ</h1>
  <div class="gr-bubble gr-subtitle">
    <span class="gr-highlight">楽しく学んで、賢く煽られよう！</span>
  </div>
  <div class="gr-corner-deco"></div>
</header>
```

### 9.2 問題表示コンポーネント

```html
<div class="gr-card gr-card-question">
  <div class="gr-section">問題 1</div>
  <p class="gr-text">日本人1人あたりの魚介類の消費量は、2001年頃をピークにどうなっているのか教えてほしいニャ？</p>
  <div class="gr-options">
    <button class="gr-button gr-option">少しずつ増え続けているニャ</button>
    <button class="gr-button gr-option">減少傾向にあるニャ</button>
    <button class="gr-button gr-option">ずっと一定だニャ</button>
    <button class="gr-button gr-option">一気にゼロになったニャ</button>
  </div>
</div>
```

### 9.3 猫ミーム表示

```html
<div class="gr-card gr-card-feedback">
  <div class="gr-character">
    <img src="assets/characters/neko_sensei/neko_sensei_teasing.webp" alt="ねこ先生" class="gr-character-img">
  </div>
  <div class="gr-bubble">
    <p class="gr-text">ええっ、そんなの小学生でも分かるにゃー</p>
  </div>
  <div class="gr-explanation">
    <div class="gr-section">解説</div>
    <p class="gr-text">2001年に約40kgだった消費量が2021年には約23kgと減少しているんだニャ。</p>
    <p class="gr-text gr-highlight">2001年→40kg→今は約半分、と数字で覚えるニャ！</p>
  </div>
</div>
```

## 10. 注意事項

- すべての要素に手描き感を与えることが重要
- 完璧な直線や角を避け、わずかな「ゆれ」や不規則性を意図的に入れる
- 子供が楽しめるデザインだが、読みやすさと操作性を最優先する
- カラーコントラストを十分に確保し、アクセシビリティにも配慮する
- アニメーションは控えめに使い、学習を妨げないようにする

このグラフィックレコーディング風デザイン仕様に従うことで、手書きの温かみと親しみやすさを持ちながらも、プロフェッショナルで効果的な学習アプリUIを実現できます。