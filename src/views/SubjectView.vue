<template>
  <div class="subject-view">
    <div v-if="loading" class="loading">
      <p>データを読み込み中...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>エラーが発生しました: {{ error }}</p>
    </div>
    <div v-else class="subject-content">
      <div class="subject-header" :style="{ backgroundColor: currentSubject?.color }">
        <button class="back-button" @click="goBack">
          ← 戻る
        </button>
        <h1>{{ currentSubject?.name }}</h1>
        <img :src="`/assets/${currentSubject?.icon}`" :alt="currentSubject?.name" class="subject-icon" />
      </div>

      <div class="topics-container">
        <h2>トピックを選んでください</h2>
        <div class="topics-grid">
          <div 
            v-for="topic in topics" 
            :key="topic.code" 
            class="topic-card"
            @click="navigateToTopic(topic.code)"
          >
            <div class="topic-icon-container">
              <img :src="`/assets/${topic.icon}`" :alt="topic.name" class="topic-icon" />
            </div>
            <div class="topic-info">
              <h3>{{ topic.name }}</h3>
              <p class="topic-details">
                <span class="difficulty">難易度: {{ topic.difficulty }}</span>
                <span class="question-count">問題数: {{ topic.questionCount }}</span>
                <span class="target-age">対象年齢: {{ topic.targetAge }}</span>
              </p>
              <div class="completion-badge" v-if="isTopicCompleted(topic.code)">
                完了済み
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'SubjectView',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    const subjectCode = ref(route.params.subjectCode);
    
    // コンピューテッドプロパティ
    const loading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.getError);
    const subjects = computed(() => store.getters.getSubjects);
    const currentSubject = computed(() => subjects.value.find(s => s.code === subjectCode.value));
    const topics = computed(() => currentSubject.value?.topics || []);
    const userData = computed(() => store.getters.getUserData);
    
    // マウント時に科目データを読み込む
    onMounted(async () => {
      if (subjects.value.length === 0) {
        await store.dispatch('loadSubjectsData');
      }
      await store.dispatch('loadUserData');
    });
    
    // トピックが完了しているかどうかを確認
    const isTopicCompleted = (topicCode) => {
      const completedTopics = userData.value.completedTopics[subjectCode.value] || {};
      return completedTopics[topicCode]?.completed || false;
    };
    
    // 前のページに戻る
    const goBack = () => {
      router.push({ name: 'home' });
    };
    
    // トピックページへのナビゲーション
    const navigateToTopic = (topicCode) => {
      router.push({ 
        name: 'topic', 
        params: { 
          subjectCode: subjectCode.value, 
          topicCode 
        } 
      });
    };
    
    return {
      loading,
      error,
      currentSubject,
      topics,
      isTopicCompleted,
      goBack,
      navigateToTopic
    };
  }
};
</script>

<style scoped lang="scss">
.subject-view {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.loading, .error {
  margin-top: 2rem;
  padding: 1rem;
  text-align: center;
  border-radius: 8px;
  background-color: #f8f9fa;
  
  p {
    font-size: 1.2rem;
  }
}

.error {
  background-color: #fff3f3;
  color: #d32f2f;
}

.subject-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-radius: 0 0 12px 12px;
  color: white;
  position: relative;
  
  h1 {
    font-size: 2.2rem;
    margin: 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  .subject-icon {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  
  .back-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.topics-container {
  padding: 2rem;
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #555;
    text-align: center;
  }
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.topic-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
  
  .topic-icon-container {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    
    .topic-icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  
  .topic-info {
    flex: 1;
    
    h3 {
      font-size: 1.3rem;
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    
    .topic-details {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #666;
      
      span {
        background-color: #eee;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
      }
    }
  }
  
  .completion-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #4caf50;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }
}
</style>
