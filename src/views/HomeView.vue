<template>
  <div class="home">
    <div class="hero-section">
      <GrTitle tag="h1" size="xl" color="accent2" class="app-title">猫先生のクイズチャレンジ</GrTitle>
      <div class="cat-image-container">
        <!-- 猫先生の画像（絶対パスで指定） -->
        <img :src="`${assetBaseUrl}assets/characters/neko_sensei/top_neko.png`" alt="猫先生" class="cat-image" />
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <p>データを読み込み中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>エラーが発生しました: {{ error }}</p>
    </div>
    <div v-else class="main-menu">
      <!-- ランク表示は削除 -->
      
      <div class="menu-buttons">
        <GrButton 
          variant="accent2" 
          size="lg" 
          class="menu-button"
          @click="navigateToSubjects"
        >
          学習を始める
        </GrButton>
        
        <div class="mistakes-button-container">
          <GrButton 
            variant="accent3" 
            size="lg" 
            class="menu-button"
            @click="navigateToMistakes"
          >
            間違えた問題
          </GrButton>
          
          <!-- 間違えた問題の数を表示 -->
          <div class="mistake-badges" v-if="hasMistakes">
            <div 
              v-for="subject in subjectsWithMistakes" 
              :key="subject"
              class="mistake-badge"
              :class="{'has-frequent': frequentMistakesBySubject[subject]}"
            >
              <span class="subject-name">{{ subject === 'science' ? '理科' : '社会' }}</span>
              <span class="count">{{ mistakesBySubject[subject] }}</span>
              <span 
                v-if="frequentMistakesBySubject[subject]" 
                class="frequent-marker" 
                title="よく間違える問題があります"
              >★</span>
            </div>
          </div>
        </div>
        
        <!-- 設定ボタンを削除 -->
      </div>
      
      <div class="last-played" v-if="userData.lastPlayed">
        <p>最終プレイ日時: {{ formatDate(userData.lastPlayed) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import GrTitle from '@/components/ui/GrTitle.vue';
import GrButton from '@/components/ui/GrButton.vue';

export default {
  name: 'HomeView',
  components: {
    GrTitle,
    GrButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const userData = ref({
      currentRank: '初級',
      score: 0,
      lastPlayed: null
    });

    // コンピューテッドプロパティ
    const subjects = computed(() => store.getters.getSubjects);
    const loading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.getError);
    
    // 間違えた問題の情報
    const mistakesBySubject = computed(() => store.getters['mistakes/mistakesBySubject']);
    const frequentMistakesBySubject = computed(() => store.getters['mistakes/frequentMistakesBySubject']);
    
    // 間違えた問題がある科目の配列
    const subjectsWithMistakes = computed(() => {
      return ['science', 'social'].filter(subject => mistakesBySubject.value[subject]);
    });
    
    // 間違えた問題があるかどうか
    const hasMistakes = computed(() => {
      return Object.keys(mistakesBySubject.value).length > 0;
    });

    // マウント時に科目データを読み込む
    onMounted(async () => {
      await store.dispatch('loadSubjectsData');
      // 間違えた問題データをロード
      store.dispatch('mistakes/loadFromLocalStorage');
      // クリア可能状態を更新
      store.commit('mistakes/updateClearableStatus');
      // ユーザーデータの読み込み（実際にはlocalStorageから取得する予定）
      userData.value = {
        currentRank: 'ねこ見習い',
        score: 120,
        lastPlayed: new Date().toISOString()
      };
    });

    // 日付のフォーマット
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 画面遷移関数
    const navigateToSubjects = () => {
      router.push({ name: 'subjects' });
    };

    const navigateToMistakes = () => {
      router.push({ name: 'mistakes' });
    };

    // 設定ボタン関連の機能を削除

    return {
      subjects,
      loading,
      error,
      userData,
      formatDate,
      mistakesBySubject,
      frequentMistakesBySubject,
      hasMistakes,
      subjectsWithMistakes,
      navigateToSubjects,
      navigateToMistakes
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-md;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-xl;
  
  .app-title {
    margin-bottom: $spacing-lg;
  }
  
  .cat-image-container {
    width: 200px;
    height: 200px;
    margin: $spacing-md auto;
    position: relative;
    
    .cat-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: $shadow-md;
    }
  }
}

.loading-container, .error-container {
  margin: $spacing-xl auto;
  max-width: 600px;
  padding: $spacing-md;
  
  p {
    font-family: $font-body;
    font-size: 1.2rem;
  }
}

.error-container {
  color: $accent4;
}

.main-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xl;
  max-width: 600px;
  margin: 0 auto;
  
  .rank-card {
    width: 100%;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    
    .rank-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-sm;
      
      h3 {
        font-family: $font-title;
        font-size: 1.4rem;
        margin-bottom: $spacing-sm;
      }
      
      .rank-badge {
        font-size: 2rem;
        font-weight: bold;
        margin: $spacing-sm 0;
      }
      
      p {
        font-family: $font-body;
        font-size: 1.1rem;
      }
    }
  }
  
  .menu-buttons {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: $spacing-md;
    
    .menu-button {
      width: 100%;
    }
  }
  
  .last-played {
    margin-top: $spacing-md;
    font-size: 0.9rem;
    color: rgba($primary, 0.7);
    font-family: $font-body;
  }
}

// レスポンシブデザイン
@media (min-width: $breakpoint-md) {
  .menu-buttons {
    flex-direction: row !important;
    flex-wrap: wrap;
    justify-content: center;
    
    .menu-button {
      width: auto !important;
      min-width: 180px;
    }
  }
}

.menu-button {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.subject-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  object-fit: contain;
}

h3 {
  font-size: 1.5rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
/* 間違えた問題バッジのスタイル */
.mistakes-button-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mistake-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.mistake-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background-color: $background-light;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &.has-frequent {
    background-color: lighten($warning, 35%);
    border: 1px solid $warning;
  }
  
  .subject-name {
    font-weight: bold;
  }
  
  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 0.25rem;
    border-radius: 1rem;
    background-color: rgba(0, 0, 0, 0.1);
    font-size: 0.75rem;
  }
  
  .frequent-marker {
    color: $warning;
    font-weight: bold;
  }
}
</style>
