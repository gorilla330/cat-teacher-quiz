<template>
  <div class="topic-select">
    <div class="header-section">
      <GrTitle tag="h1" size="lg" color="primary" class="page-title">
        {{ currentSubject ? currentSubject.name : '単元を選んでください' }}
      </GrTitle>
      <GrBubble direction="right" color="accent2" class="instruction-bubble">
        学習したい単元を選んでください
      </GrBubble>
    </div>
    
    <div v-if="loading" class="loading-container">
      <p>データを読み込み中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>エラーが発生しました: {{ error }}</p>
    </div>
    <div v-else-if="!currentSubject" class="error-container">
      <p>科目が見つかりません。科目選択画面に戻ってください。</p>
      <GrButton 
        variant="primary" 
        size="md" 
        @click="navigateToSubjects"
        class="mt-4"
      >
        科目選択に戻る
      </GrButton>
    </div>
    <div v-else class="topics-grid">
      <GrCard 
        v-for="topic in currentSubject.topics" 
        :key="topic.code" 
        class="topic-card"
        :border="topic.code"
        elevation="md"
        @click="navigateToQuiz(currentSubject.code, topic.code)"
      >
        <div class="topic-content">
          <div class="topic-header">
            <div class="topic-icon" :style="{ backgroundColor: currentSubject.color }">
              <img :src="topic.icon" :alt="topic.name" v-if="topic.icon" />
              <span v-else>{{ topic.name.charAt(0) }}</span>
            </div>
            <h3 class="topic-name">{{ topic.name }}</h3>
          </div>
          
          <div class="topic-details">
            <div class="detail-item">
              <span class="detail-label">問題数:</span>
              <GrHighlight color="yellow" :inline="true">{{ topic.questionCount }}問</GrHighlight>
            </div>
            <div class="detail-item">
              <span class="detail-label">難易度:</span>
              <GrHighlight color="accent3" :inline="true">{{ topic.difficulty }}</GrHighlight>
            </div>
            <div class="detail-item">
              <span class="detail-label">対象年齢:</span>
              <GrHighlight color="accent2" :inline="true">{{ topic.targetAge }}</GrHighlight>
            </div>
          </div>
        </div>
      </GrCard>
    </div>
    
    <div class="navigation-buttons">
      <GrButton 
        variant="primary" 
        size="md" 
        @click="navigateToSubjects"
      >
        科目選択に戻る
      </GrButton>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import GrTitle from '@/components/ui/GrTitle.vue';
import GrCard from '@/components/ui/GrCard.vue';
import GrButton from '@/components/ui/GrButton.vue';
import GrBubble from '@/components/ui/GrBubble.vue';
import GrHighlight from '@/components/ui/GrHighlight.vue';

export default {
  name: 'TopicSelectView',
  components: {
    GrTitle,
    GrCard,
    GrButton,
    GrBubble,
    GrHighlight
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    const subjectCode = route.params.subjectCode;

    // コンピューテッドプロパティ
    const subjects = computed(() => store.getters.getSubjects);
    const currentSubject = computed(() => 
      subjects.value.find(subject => subject.code === subjectCode)
    );
    const loading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.getError);

    // マウント時に科目データを読み込む
    onMounted(async () => {
      if (!subjects.value.length) {
        await store.dispatch('loadSubjectsData');
      }
    });

    // クイズ画面へのナビゲーション
    const navigateToQuiz = (subjectCode, topicCode) => {
      router.push({ 
        name: 'quiz', 
        params: { subjectCode, topicCode }
      });
    };

    // 科目選択画面へのナビゲーション
    const navigateToSubjects = () => {
      router.push({ name: 'subjects' });
    };

    return {
      subjects,
      currentSubject,
      loading,
      error,
      navigateToQuiz,
      navigateToSubjects
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.topic-select {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-md;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-xl;
  position: relative;
  
  .page-title {
    text-align: center;
    margin-bottom: $spacing-md;
  }
  
  .instruction-bubble {
    margin-top: $spacing-md;
  }
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

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.topic-card {
  cursor: pointer;
  transition: transform $transition-speed $transition-function;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .topic-content {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    height: 100%;
    
    .topic-header {
      display: flex;
      align-items: center;
      margin-bottom: $spacing-md;
      
      .topic-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: $spacing-md;
        flex-shrink: 0;
        
        img {
          max-width: 60%;
          max-height: 60%;
        }
        
        span {
          font-size: 1.5rem;
          color: white;
          font-weight: bold;
        }
      }
      
      .topic-name {
        font-family: $font-title;
        font-size: 1.3rem;
      }
    }
    
    .topic-details {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
      
      .detail-item {
        display: flex;
        align-items: center;
        
        .detail-label {
          font-family: $font-body;
          font-size: 0.9rem;
          margin-right: $spacing-sm;
          min-width: 70px;
        }
      }
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
  .topics-grid {
    grid-template-columns: 1fr;
  }
}

.mt-4 {
  margin-top: $spacing-md;
}
</style>
