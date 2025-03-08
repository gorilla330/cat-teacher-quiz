<template>
  <div class="quiz-view">
    <div class="quiz-header">
      <div class="quiz-info">
        <GrTitle tag="h2" size="md" color="primary">
          {{ currentSubject ? currentSubject.name : '' }} - {{ currentTopic ? currentTopic.name : '' }}
        </GrTitle>
        <div class="quiz-progress">
          <div class="progress-text">問題 {{ currentQuestionIndex + 1 }} / {{ questions.length }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <p>データを読み込み中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>エラーが発生しました: {{ error }}</p>
    </div>
    <div v-else-if="!currentQuestion" class="error-container">
      <p>問題が見つかりません。別の単元を選んでください。</p>
      <GrButton 
        variant="primary" 
        size="md" 
        @click="navigateToTopics"
        class="mt-4"
      >
        単元選択に戻る
      </GrButton>
    </div>
    <div v-else class="quiz-content">
      <div class="question-section">
        <GrCard class="question-card" elevation="md" border="primary">
          <GrTitle tag="h3" size="md" color="primary" class="question-title">問題</GrTitle>
          <p class="question-text">{{ currentQuestion.question }}</p>
        </GrCard>
      </div>
      
      <div class="choices-section">
        <div class="choices-grid">
          <GrButton 
            v-for="(choice, index) in currentQuestion.options" 
            :key="index"
            :variant="getChoiceVariant(index)"
            size="lg"
            class="choice-button"
            :disabled="answerSubmitted"
            @click="selectAnswer(index)"
          >
            {{ choice }}
          </GrButton>
        </div>
      </div>
      
      <div class="feedback-section" v-if="answerSubmitted">
        <GrCard class="feedback-card" :elevation="feedbackCardElevation" :border="feedbackCardBorder">
          <div class="feedback-content">
            <GrTitle tag="h3" size="md" :color="isCorrect ? 'accent2' : 'accent4'" class="feedback-title">
              {{ isCorrect ? '正解！' : '不正解...' }}
            </GrTitle>
            <p class="explanation">{{ currentQuestion.explanation }}</p>
          </div>
        </GrCard>
        
        <div class="navigation-buttons">
          <GrButton 
            variant="accent2" 
            size="lg" 
            @click="nextQuestion"
          >
            {{ isLastQuestion ? '結果を見る' : '次の問題へ' }}
          </GrButton>
        </div>
      </div>
    </div>
    
    <div class="character-section">
      <CharacterDisplay 
        :character="characterType" 
        :state="characterState" 
        :message="characterMessage"
      />
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import GrTitle from '@/components/ui/GrTitle.vue';
import GrCard from '@/components/ui/GrCard.vue';
import GrButton from '@/components/ui/GrButton.vue';
import GrBubble from '@/components/ui/GrBubble.vue';
import CharacterDisplay from '@/components/CharacterDisplay.vue';

export default {
  name: 'QuizView',
  components: {
    GrTitle,
    GrCard,
    GrButton,
    GrBubble,
    CharacterDisplay
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    const subjectCode = route.params.subjectCode;
    const topicCode = route.params.topicCode;
    
    // リアクティブな状態
    const questions = ref([]);
    const currentQuestionIndex = ref(0);
    const selectedAnswer = ref(null);
    const answerSubmitted = ref(false);
    const isCorrect = ref(false);
    const characterMessage = ref('問題を解いてみよう！');
    const characterType = ref('neko_sensei'); // デフォルトのキャラクター
    const characterState = ref('normal'); // デフォルトの状態

    // コンピューテッドプロパティ
    const subjects = computed(() => store.getters.getSubjects);
    const currentSubject = computed(() => 
      subjects.value.find(subject => subject.code === subjectCode)
    );
    const currentTopic = computed(() => {
      if (!currentSubject.value) return null;
      return currentSubject.value.topics.find(topic => topic.code === topicCode);
    });
    const loading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.getError);
    const currentQuestion = computed(() => {
      if (questions.value.length === 0) return null;
      return questions.value[currentQuestionIndex.value];
    });
    const progressPercentage = computed(() => {
      if (questions.value.length === 0) return 0;
      return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
    });
    const isLastQuestion = computed(() => {
      return currentQuestionIndex.value === questions.value.length - 1;
    });
    const feedbackCardElevation = computed(() => isCorrect.value ? 'lg' : 'sm');
    const feedbackCardBorder = computed(() => isCorrect.value ? 'accent2' : 'accent4');
    const characterBubbleColor = computed(() => {
      if (!answerSubmitted.value) return 'primary';
      return isCorrect.value ? 'accent2' : 'accent4';
    });

    // マウント時にデータを読み込む
    onMounted(async () => {
      try {
        // 科目データを読み込む
        if (!subjects.value.length) {
          await store.dispatch('loadSubjectsData');
        }
        
        // 問題データを読み込む
        await store.dispatch('loadProblems', {
          subjectCode,
          topicCode
        });
        
        // ストアから問題データを取得
        const problemsData = store.getters.getProblems;
        console.log('取得した問題データ:', problemsData);
        
        if (!problemsData || problemsData.length === 0) {
          throw new Error('問題データが見つかりませんでした。');
        }
        
        questions.value = problemsData;
        
        // 問題をランダムに並び替え（オプション）
        questions.value = shuffleArray([...questions.value]);
        
      } catch (err) {
        console.error('問題データの読み込み中にエラーが発生しました:', err);
        store.commit('SET_ERROR', err.message);
      }
    });
    
    // 配列をランダムに並び替える関数
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // 回答を選択
    const selectAnswer = (index) => {
      selectedAnswer.value = index;
      answerSubmitted.value = true;
      isCorrect.value = index === currentQuestion.value.correctAnswer;
      
      // キャラクターのメッセージと状態を更新
      if (isCorrect.value) {
        characterMessage.value = getRandomCorrectMessage();
        characterState.value = 'happy';
      } else {
        characterMessage.value = getRandomIncorrectMessage();
        characterState.value = 'teasing';
      }
    };

    // 次の問題へ
    const nextQuestion = () => {
      if (isLastQuestion.value) {
        // 結果画面へ遷移
        router.push({ 
          name: 'result', 
          params: { subjectCode, topicCode }
        });
      } else {
        // 次の問題へ
        currentQuestionIndex.value++;
        selectedAnswer.value = null;
        answerSubmitted.value = false;
        characterMessage.value = '次の問題です！がんばって！';
        characterState.value = 'normal'; // キャラクターの状態をリセット
      }
    };

    // 選択肢のスタイルを取得
    const getChoiceVariant = (index) => {
      if (!answerSubmitted.value) return 'primary';
      
      if (index === currentQuestion.value.correctAnswer) {
        return 'accent2';
      } else if (index === selectedAnswer.value) {
        return 'accent4';
      } else {
        return 'primary';
      }
    };

    // ランダムな正解メッセージ
    const getRandomCorrectMessage = () => {
      const messages = [
        'すごい！正解だにゃ！',
        'さすがだにゃ！',
        'その調子だにゃ！',
        '完璧だにゃ！',
        '君は天才かもしれないにゃ！'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    };

    // ランダムな不正解メッセージ
    const getRandomIncorrectMessage = () => {
      const messages = [
        'ざんねん！もう少しだったにゃ...',
        'にゃんと！間違えたにゃ...',
        '次は頑張るにゃ！',
        'ドンマイにゃ～',
        'ねこだって間違えることはあるにゃ'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    };

    // 単元選択画面へのナビゲーション
    const navigateToTopics = () => {
      router.push({ 
        name: 'topics', 
        params: { subjectCode }
      });
    };

    return {
      subjects,
      currentSubject,
      currentTopic,
      loading,
      error,
      questions,
      currentQuestionIndex,
      currentQuestion,
      selectedAnswer,
      answerSubmitted,
      isCorrect,
      progressPercentage,
      isLastQuestion,
      characterMessage,
      characterType,
      characterState,
      feedbackCardElevation,
      feedbackCardBorder,
      characterBubbleColor,
      selectAnswer,
      nextQuestion,
      getChoiceVariant,
      navigateToTopics
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.quiz-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
}

.quiz-header {
  margin-bottom: $spacing-lg;
  
  .quiz-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .quiz-progress {
      width: 100%;
      max-width: 500px;
      margin-top: $spacing-md;
      
      .progress-text {
        font-family: $font-body;
        font-size: 1rem;
        margin-bottom: $spacing-xs;
        text-align: center;
      }
      
      .progress-bar {
        height: 10px;
        background-color: rgba($primary, 0.2);
        border-radius: $border-radius-sm;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background-color: $accent2;
          transition: width 0.3s ease;
        }
      }
    }
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

.quiz-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.question-section {
  .question-card {
    padding: $spacing-md;
    
    .question-title {
      margin-bottom: $spacing-md;
    }
    
    .question-text {
      font-family: $font-body;
      font-size: 1.2rem;
      line-height: 1.6;
    }
  }
}

.choices-section {
  .choices-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
    
    .choice-button {
      min-height: 80px;
      white-space: normal;
      text-align: left;
      padding: $spacing-md;
      font-size: 1.1rem;
    }
  }
}

.feedback-section {
  margin-top: $spacing-md;
  
  .feedback-card {
    padding: $spacing-md;
    margin-bottom: $spacing-lg;
    
    .feedback-content {
      .feedback-title {
        margin-bottom: $spacing-md;
      }
      
      .explanation {
        font-family: $font-body;
        font-size: 1.1rem;
        line-height: 1.6;
      }
    }
  }
  
  .navigation-buttons {
    display: flex;
    justify-content: center;
  }
}

.character-section {
  margin-top: $spacing-xl;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
}

.mt-4 {
  margin-top: $spacing-md;
}

// レスポンシブデザイン
@media (max-width: $breakpoint-md) {
  .choices-section {
    .choices-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
