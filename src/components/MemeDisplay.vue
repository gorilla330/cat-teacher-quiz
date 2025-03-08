<template>
  <div 
    v-if="show" 
    class="meme-display" 
    :class="{ 
      'animate-in': animateIn, 
      'animate-out': animateOut,
      [`sass-level-${sassLevel}`]: true
    }"
  >
    <div class="meme-container">
      <div class="meme-image-container">
        <!-- 実際のミーム画像を使用するときはこちら -->
        <img 
          v-if="currentMeme.imageUrl" 
          :src="currentMeme.imageUrl" 
          :alt="currentMeme.text" 
          class="meme-image"
        />
        <!-- 開発中はプレースホルダー -->
        <div v-else class="meme-placeholder">
          <div class="meme-emoji">{{ currentMeme.emoji }}</div>
        </div>
      </div>
      
      <div class="meme-text">{{ currentMeme.text }}</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'MemeDisplay',
  props: {
    // 表示するかどうか
    show: {
      type: Boolean,
      default: false
    },
    // 煽りレベル (1-3, 1:優しい, 2:普通, 3:厳しい)
    sassLevel: {
      type: Number,
      default: 1,
      validator: (value) => [1, 2, 3].includes(value)
    },
    // 問題の難易度 (1-3)
    difficulty: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    const animateIn = ref(false);
    const animateOut = ref(false);
    const currentMeme = ref({});
    
    // 煽りレベルに応じたミームのリスト
    const memes = computed(() => {
      // レベル1（優しい）
      const level1 = [
        { text: 'まだまだこれからにゃ！', emoji: '😺', level: 1 },
        { text: 'にゃんとまあ、惜しかったにゃ', emoji: '🐱', level: 1 },
        { text: 'ドンマイにゃ～次があるにゃ', emoji: '😸', level: 1 },
        { text: 'にゃにゃ？間違えちゃったにゃ？', emoji: '😿', level: 1 },
        { text: 'にゃるほど、難しかったにゃ', emoji: '🙀', level: 1 }
      ];
      
      // レベル2（普通）
      const level2 = [
        { text: 'にゃーんだそれは！？', emoji: '😹', level: 2 },
        { text: '猫でも分かるよにゃ...', emoji: '😼', level: 2 },
        { text: 'その程度も分からないのかにゃ？', emoji: '🙄', level: 2 },
        { text: 'ちょっと勉強し直した方がいいかもにゃ', emoji: '📚', level: 2 },
        { text: 'ホントに考えたのかにゃ？', emoji: '🤔', level: 2 }
      ];
      
      // レベル3（厳しい）
      const level3 = [
        { text: '猫に勉強教わる日が来るとは...', emoji: '🐈', level: 3 },
        { text: 'これが人間の限界かにゃ？', emoji: '😾', level: 3 },
        { text: '本気で答えたのかにゃ？冗談かにゃ？', emoji: '⁉️', level: 3 },
        { text: 'ため息が出るレベルにゃ...', emoji: '😤', level: 3 },
        { text: '猫より賢くなってからまた来るにゃ！', emoji: '👑', level: 3 }
      ];
      
      // 選択されたレベルに応じて表示するミームを絞り込む
      let availableMemes = [];
      
      if (props.sassLevel >= 1) availableMemes = [...availableMemes, ...level1];
      if (props.sassLevel >= 2) availableMemes = [...availableMemes, ...level2];
      if (props.sassLevel >= 3) availableMemes = [...availableMemes, ...level3];
      
      return availableMemes;
    });
    
    // ランダムなミームを選択する
    const selectRandomMeme = () => {
      const availableMemes = memes.value;
      if (availableMemes.length === 0) return;
      
      const randomIndex = Math.floor(Math.random() * availableMemes.length);
      currentMeme.value = availableMemes[randomIndex];
    };
    
    // 表示状態が変わったときにアニメーションを制御
    watch(() => props.show, (newVal) => {
      if (newVal) {
        // 表示開始時
        selectRandomMeme();
        animateIn.value = true;
        animateOut.value = false;
        
        // 3秒後に自動で閉じる
        setTimeout(() => {
          animateOut.value = true;
          // アニメーション完了後にemitするか、別の方法で閉じる
          setTimeout(() => {
            // ここでコンポーネントを非表示にするためのイベントを発火できる
          }, 500); // アニメーションの時間
        }, 3000);
      } else {
        // 非表示時
        animateIn.value = false;
      }
    }, { immediate: true });
    
    return {
      animateIn,
      animateOut,
      currentMeme
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.meme-display {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  &.animate-in {
    opacity: 1;
    pointer-events: auto;
    animation: fadeIn 0.5s ease forwards;
  }
  
  &.animate-out {
    opacity: 0;
    pointer-events: none;
    animation: fadeOut 0.5s ease forwards;
  }
}

.meme-container {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 80%;
  max-height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
  
  .animate-in & {
    transform: scale(1);
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  .animate-out & {
    transform: scale(0.9);
  }
}

.meme-image-container {
  width: 100%;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.meme-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.meme-placeholder {
  width: 280px;
  height: 280px;
  background-color: $color-primary-light;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.meme-emoji {
  font-size: 8rem;
}

.meme-text {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
  color: $color-primary-dark;
  font-family: $font-family-accent;
  line-height: 1.4;
}

// 煽りレベルによるスタイル調整
.sass-level-1 .meme-text {
  color: $color-accent1;
}

.sass-level-2 .meme-text {
  color: $color-accent3;
}

.sass-level-3 .meme-text {
  color: $color-accent4;
}

// アニメーション
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
