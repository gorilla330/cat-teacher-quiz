<template>
  <div class="component-preview">
    <h1 class="text-center mb-5">グラフィックレコーディング風UIコンポーネント</h1>
    
    <section class="preview-section">
      <h2 class="section-title">タイトルコンポーネント (GrTitle)</h2>
      <div class="preview-container">
        <GrTitle tag="h1" size="xl" color="primary">プライマリーの特大タイトル</GrTitle>
        <GrTitle tag="h2" size="lg" color="accent1">アクセント1の大タイトル</GrTitle>
        <GrTitle tag="h3" size="md" color="accent2">アクセント2の中タイトル</GrTitle>
        <GrTitle tag="h4" size="sm" color="accent3">アクセント3の小タイトル</GrTitle>
        <GrTitle tag="div" size="sm" color="accent4">アクセント4のdivタイトル</GrTitle>
      </div>
    </section>
    
    <section class="preview-section">
      <h2 class="section-title">カードコンポーネント (GrCard)</h2>
      <div class="preview-container cards-grid">
        <GrCard elevation="sm" border="primary">
          <p>プライマリーの枠線と小さい影のカード</p>
        </GrCard>
        <GrCard elevation="md" border="accent1">
          <p>アクセント1の枠線と中くらいの影のカード</p>
        </GrCard>
        <GrCard elevation="lg" border="accent2">
          <p>アクセント2の枠線と大きい影のカード</p>
        </GrCard>
        <GrCard elevation="md" border="accent3">
          <p>アクセント3の枠線と中くらいの影のカード</p>
        </GrCard>
        <GrCard elevation="md" border="accent4">
          <p>アクセント4の枠線と中くらいの影のカード</p>
        </GrCard>
        <GrCard elevation="none" border="none">
          <p>枠線なし、影なしのカード</p>
        </GrCard>
      </div>
    </section>
    
    <section class="preview-section">
      <h2 class="section-title">ボタンコンポーネント (GrButton)</h2>
      <div class="preview-container buttons-container">
        <div class="button-row">
          <GrButton variant="primary" size="sm">小さいボタン</GrButton>
          <GrButton variant="primary" size="md">中くらいボタン</GrButton>
          <GrButton variant="primary" size="lg">大きいボタン</GrButton>
        </div>
        <div class="button-row">
          <GrButton variant="primary">プライマリー</GrButton>
          <GrButton variant="accent1">アクセント1</GrButton>
          <GrButton variant="accent2">アクセント2</GrButton>
          <GrButton variant="accent3">アクセント3</GrButton>
          <GrButton variant="accent4">アクセント4</GrButton>
        </div>
        <div class="button-row">
          <GrButton variant="primary" disabled>無効ボタン</GrButton>
          <GrButton variant="accent2" fullWidth>全幅ボタン</GrButton>
        </div>
      </div>
    </section>
    
    <section class="preview-section">
      <h2 class="section-title">吹き出しコンポーネント (GrBubble)</h2>
      <div class="preview-container bubbles-container">
        <div class="bubble-row">
          <GrBubble direction="bottom" color="white">
            <p>下向き白吹き出し</p>
          </GrBubble>
          <GrBubble direction="top" color="accent1">
            <p>上向きアクセント1吹き出し</p>
          </GrBubble>
        </div>
        <div class="bubble-row">
          <GrBubble direction="right" color="accent2">
            <p>右向きアクセント2吹き出し</p>
          </GrBubble>
          <GrBubble direction="left" color="accent3">
            <p>左向きアクセント3吹き出し</p>
          </GrBubble>
        </div>
        <div class="bubble-row">
          <GrBubble direction="bottom" color="primary">
            <p>下向きプライマリー吹き出し</p>
          </GrBubble>
          <GrBubble direction="bottom" color="accent4">
            <p>下向きアクセント4吹き出し</p>
          </GrBubble>
        </div>
      </div>
    </section>
    
    <section class="preview-section">
      <h2 class="section-title">ハイライトコンポーネント (GrHighlight)</h2>
      <div class="preview-container">
        <p>
          これは<GrHighlight color="yellow">黄色のハイライト</GrHighlight>です。
          これは<GrHighlight color="orange">オレンジのハイライト</GrHighlight>です。
          これは<GrHighlight color="red">赤のハイライト</GrHighlight>です。
        </p>
        <p>
          <GrHighlight color="yellow" :inline="false">
            インラインではないハイライトブロックです。これはより長いテキストに使用できます。
            複数行にまたがる場合もあります。
          </GrHighlight>
        </p>
      </div>
    </section>
    
    <section class="preview-section">
      <h2 class="section-title">組み合わせ例</h2>
      <div class="preview-container">
        <GrCard elevation="md" border="primary">
          <GrTitle tag="h3" size="md" color="accent2">猫先生からの挑戦状</GrTitle>
          <p>
            <GrHighlight color="yellow">算数の問題</GrHighlight>に挑戦してみましょう！
          </p>
          <div class="mt-4">
            <GrBubble direction="left" color="accent1">
              <p>この問題、<GrHighlight color="red">難しい</GrHighlight>かもしれないニャ〜</p>
            </GrBubble>
          </div>
          <div class="mt-4 text-center">
            <GrButton variant="accent3" size="lg">挑戦する</GrButton>
          </div>
        </GrCard>
      </div>
    </section>
  </div>
</template>

<script>
import GrTitle from '@/components/ui/GrTitle.vue';
import GrCard from '@/components/ui/GrCard.vue';
import GrButton from '@/components/ui/GrButton.vue';
import GrBubble from '@/components/ui/GrBubble.vue';
import GrHighlight from '@/components/ui/GrHighlight.vue';

export default {
  name: 'ComponentPreview',
  components: {
    GrTitle,
    GrCard,
    GrButton,
    GrBubble,
    GrHighlight
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.component-preview {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-xl;
}

.preview-section {
  margin-bottom: $spacing-xxl;
  
  .section-title {
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-xs;
    border-bottom: 2px solid $primary;
  }
}

.preview-container {
  background-color: #f5f5f5;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-lg;
}

.buttons-container {
  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.bubbles-container {
  .bubble-row {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
