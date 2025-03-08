<template>
  <div class="subject-select">
    <GrTitle tag="h1" size="lg" color="primary" class="page-title">教科を選んでください</GrTitle>
    
    <div v-if="loading" class="loading-container">
      <p>データを読み込み中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>エラーが発生しました: {{ error }}</p>
    </div>
    <div v-else class="subjects-grid">
      <GrCard 
        v-for="subject in subjects" 
        :key="subject.code" 
        class="subject-card"
        :border="subject.code"
        elevation="md"
        @click="navigateToTopics(subject.code)"
      >
        <div class="subject-content" :style="{ backgroundColor: subject.color + '33' }">
          <div class="subject-icon" :style="{ backgroundColor: subject.color }">
            <img :src="subject.icon" :alt="subject.name" v-if="subject.icon" />
            <span v-else>{{ subject.name.charAt(0) }}</span>
          </div>
          <h3 class="subject-name">{{ subject.name }}</h3>
          <p class="subject-topics">{{ subject.topics.length }}個の単元</p>
        </div>
      </GrCard>
    </div>
    
    <div class="navigation-buttons">
      <GrButton 
        variant="primary" 
        size="md" 
        @click="navigateToHome"
      >
        ホームに戻る
      </GrButton>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import GrTitle from '@/components/ui/GrTitle.vue';
import GrCard from '@/components/ui/GrCard.vue';
import GrButton from '@/components/ui/GrButton.vue';

export default {
  name: 'SubjectSelectView',
  components: {
    GrTitle,
    GrCard,
    GrButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    // コンピューテッドプロパティ
    const subjects = computed(() => store.getters.getSubjects);
    const loading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.getError);

    // マウント時に科目データを読み込む
    onMounted(async () => {
      if (!subjects.value.length) {
        await store.dispatch('loadSubjectsData');
      }
    });

    // 単元選択画面へのナビゲーション
    const navigateToTopics = (subjectCode) => {
      router.push({ 
        name: 'topics', 
        params: { subjectCode }
      });
    };

    // ホーム画面へのナビゲーション
    const navigateToHome = () => {
      router.push({ name: 'home' });
    };

    return {
      subjects,
      loading,
      error,
      navigateToTopics,
      navigateToHome
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.subject-select {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-md;
}

.page-title {
  text-align: center;
  margin-bottom: $spacing-xl;
}

.loading-container, .error-container {
  margin: $spacing-xl auto;
  max-width: 600px;
  padding: $spacing-md;
  text-align: center;
  
  p {
    font-family: $font-body;
    font-size: 1.2rem;
  }
}

.error-container {
  color: $accent4;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.subject-card {
  cursor: pointer;
  transition: transform $transition-speed $transition-function;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .subject-content {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-radius: $border-radius-md;
    height: 100%;
    
    .subject-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: $spacing-md;
      
      img {
        max-width: 60%;
        max-height: 60%;
      }
      
      span {
        font-size: 2rem;
        color: white;
        font-weight: bold;
      }
    }
    
    .subject-name {
      font-family: $font-title;
      font-size: 1.5rem;
      margin-bottom: $spacing-sm;
    }
    
    .subject-topics {
      font-family: $font-body;
      font-size: 1rem;
      color: rgba($primary, 0.7);
    }
  }
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  margin-top: $spacing-xl;
}

// レスポンシブデザイン
@media (max-width: $breakpoint-sm) {
  .subjects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
