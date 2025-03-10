<template>
  <div class="character-display">
    <GrBubble
      v-if="message"
      direction="left"
      :color="bubbleColor"
      class="character-bubble"
    >
      {{ message }}
    </GrBubble>
    
    <div class="character-image">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="characterName"
        class="character-img"
      />
      <div v-else class="character-placeholder" :style="{ backgroundColor: characterColor }">
        {{ characterName }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import GrBubble from '@/components/ui/GrBubble.vue';

export default {
  name: 'CharacterDisplay',
  components: {
    GrBubble
  },
  props: {
    // キャラクター識別子（'neko_sensei', 'usagi_coach', 'fukurou_professor', 'wanwan_doctor'）
    character: {
      type: String,
      default: 'neko_sensei',
      validator: (value) => ['neko_sensei', 'usagi_coach', 'fukurou_professor', 'wanwan_doctor'].includes(value)
    },
    // キャラクターの状態（'normal', 'happy', 'teasing'）
    state: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'happy', 'teasing'].includes(value)
    },
    // 表示するメッセージ
    message: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    // キャラクター名
    const characterName = computed(() => {
      const names = {
        neko_sensei: 'ねこ先生',
        usagi_coach: 'うさぎコーチ',
        fukurou_professor: 'ふくろう教授',
        wanwan_doctor: 'わんわん博士'
      };
      return names[props.character] || '不明なキャラクター';
    });

    // キャラクターの色
    const characterColor = computed(() => {
      const colors = {
        neko_sensei: '#FFD166',
        usagi_coach: '#06D6A0',
        fukurou_professor: '#118AB2',
        wanwan_doctor: '#EF476F'
      };
      return colors[props.character] || '#CCCCCC';
    });
    
    // 状態に基づく吹き出しの色
    const bubbleColor = computed(() => {
      const stateColors = {
        normal: 'primary',
        happy: 'accent2',
        teasing: 'accent4'
      };
      
      return stateColors[props.state] || 'primary';
    });

    // 画像URL
    const imageUrl = computed(() => {
      // GitHub Pages環境で正しく表示されるようにパスを修正
      // 本番環境ではベースURLが「/cat-teacher-quiz/」、開発環境では「/」
      const isProd = process.env.NODE_ENV === 'production';
      const basePathForAssets = isProd ? '/cat-teacher-quiz/assets/' : '/assets/';
      
      // デバッグ用にパス情報を出力
      console.log(`環境: ${isProd ? '本番' : '開発'}, ベースパス: ${basePathForAssets}`);
      
      // 絶対パスで指定
      return `${basePathForAssets}characters/${props.character}/${props.character}_${props.state}.png`;
    });

    return {
      characterName,
      characterColor,
      bubbleColor,
      imageUrl
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.character-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 300px;
  margin: 0 auto;
}

.character-bubble {
  margin-bottom: 1rem;
  max-width: 250px;
}

.character-image {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.character-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.character-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
