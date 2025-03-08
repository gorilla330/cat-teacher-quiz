<template>
  <div class="result-view">
    <div class="result-header">
      <GrTitle tag="h1" size="lg" color="primary">結果発表</GrTitle>
    </div>

    <div class="result-content">
      <div class="score-display">
        <GrTitle tag="h2" size="md" color="primary">
          正答数: {{ correctCount }} / {{ totalQuestions }}
        </GrTitle>
        <p class="percentage">正答率: {{ percentageCorrect }}%</p>
        
        <!-- 間違えた問題の通知 -->
        <div v-if="incorrectIds.length > 0" class="mistake-info">
          <GrCard elevation="sm" border="warning" class="mistake-card">
            <p>あなたは {{ incorrectIds.length }} 問の問題に間違えました。</p>
            <p v-if="hasFrequentMistakes" class="frequent-mistake-warning">
              <span class="warning-icon">⚠️</span> よく間違える問題があります！
            </p>
            <p>
              <GrButton variant="accent3" size="sm" @click="navigateToMistakes">間違えた問題を確認</GrButton>
            </p>
          </GrCard>
        </div>
      </div>
      
      <!-- キャラクターフィードバック -->
      <div class="character-feedback">
        <CharacterDisplay 
          :emotion="getFeedbackEmotion()"
          :speechText="getFeedbackMessage()"
        />
      </div>

      <div class="action-buttons">
        <GrButton variant="secondary" size="lg" @click="tryAgain">
          もう一度チャレンジ
        </GrButton>

        <GrButton variant="primary" size="lg" @click="goToHome">
          ホームに戻る
        </GrButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import GrTitle from '@/components/ui/GrTitle.vue';
import GrButton from '@/components/ui/GrButton.vue';
import GrCard from '@/components/ui/GrCard.vue';
import CharacterDisplay from '@/components/CharacterDisplay.vue';

export default {
  name: 'ResultView',
  components: {
    GrTitle,
    GrButton,
    GrCard,
    CharacterDisplay
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const correctCount = ref(0);
    const totalQuestions = ref(0);
    const incorrectIds = ref([]);
    const subjectCode = ref('');
    const topicCode = ref('');
    const hasFrequentMistakes = ref(false);

    const percentageCorrect = computed(() => {
      if (!totalQuestions.value) return 0;
      return Math.round((correctCount.value / totalQuestions.value) * 100);
    });

    onMounted(async () => {
      // 結果データの取得
      const storedResults = JSON.parse(localStorage.getItem('quizResults')) || {};
      correctCount.value = storedResults.correctCount || 0;
      totalQuestions.value = storedResults.totalQuestions || 1;
      incorrectIds.value = storedResults.incorrectIds || [];
      subjectCode.value = storedResults.subjectCode || '';
      topicCode.value = storedResults.topicCode || '';
      
      // 間違えた問題の記録
      if (incorrectIds.value.length > 0) {
        await recordMistakes();
      }
    });
    
    const recordMistakes = async () => {
      // クイズデータを読み込む
      if (subjectCode.value && topicCode.value) {
        await store.dispatch('loadProblems', {
          subjectCode: subjectCode.value,
          topicCode: topicCode.value
        });
        
        const problems = store.getters.getProblems;
        const metadata = store.getters.getMetadata;
        
        // 間違えた問題を記録
        incorrectIds.value.forEach(id => {
          const problem = problems.find(p => p.id === id);
          if (problem) {
            store.commit('mistakes/addMistake', {
              questionId: problem.id,
              subject: metadata.subject,
              topic: metadata.topic,
              question: problem.question,
              choices: problem.choices,
              correctAnswer: problem.correctAnswer
            });
          }
        });
        
        // ローカルストレージに保存
        store.dispatch('mistakes/saveToLocalStorage');
        
        // よく間違える問題があるかチェック
        const frequentMistakes = store.getters['mistakes/frequentMistakesBySubject'];
        hasFrequentMistakes.value = frequentMistakes[metadata.subject] > 0;
      }
    };
    
    // フィードバックメッセージとキャラクターの表情
    const getFeedbackEmotion = () => {
      const percentage = percentageCorrect.value;
      if (percentage === 100) return 'excited';
      if (percentage >= 80) return 'happy';
      if (percentage >= 60) return 'normal';
      if (percentage >= 40) return 'confused';
      return 'sad';
    };
    
    const getFeedbackMessage = () => {
      const percentage = percentageCorrect.value;
      if (percentage === 100) {
        return '完璧だニャ！さすがですニャ！';
      } else if (percentage >= 80) {
        return 'とても良くできましたニャ！この調子で頑張りましょうニャ！';
      } else if (percentage >= 60) {
        return 'まあまあできていますニャ。もう少し頑張りましょうニャ！';
      } else if (percentage >= 40) {
        return 'もう少し勉強が必要ですニャ。間違えた問題を復習しましょうニャ。';
      } else {
        return 'もっと真面目に勉強しないとダメニャ！逆にランクが下がるよニャ！';
      }
    };
    
    const navigateToMistakes = () => {
      router.push({ name: 'mistakes' });
    };

    const tryAgain = () => {
      router.push({ name: 'quiz', params: route.params });
    };

    const goToHome = () => {
      router.push({ name: 'home' });
    };

    return {
      correctCount,
      totalQuestions,
      percentageCorrect,
      incorrectIds,
      hasFrequentMistakes,
      getFeedbackEmotion,
      getFeedbackMessage,
      navigateToMistakes,
      tryAgain,
      goToHome
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.result-view {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.result-header {
  margin-bottom: 2rem;
}

.score-display {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: lighten($primary, 60%);
  border-radius: $border-radius-md;
  
  .percentage {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0.5rem 0;
  }
  
  .mistake-info {
    margin-top: 1rem;
  }
  
  .mistake-card {
    padding: 0.75rem;
    
    p {
      margin: 0.5rem 0;
    }
    
    .frequent-mistake-warning {
      color: $warning;
      font-weight: bold;
      
      .warning-icon {
        margin-right: 0.25rem;
      }
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    width: 100%;
  }
  
  .gr-button {
    min-width: 200px;
    
    @media (max-width: $breakpoint-sm) {
      margin-bottom: 1rem;
      width: 100%;
    }
  }
}
.character-feedback {
  margin: 2rem 0;
}
</style>
