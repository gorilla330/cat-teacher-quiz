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
            :disabled="!answerSubmitted"
          >
            {{ isLastQuestion ? '結果を見る' : '次の問題へ' }}
          </GrButton>
        </div>
      </div>
    </div>
    
    <div class="character-section">
      <character-display
        :character="getCharacterType()"
        :state="getCharacterState()"
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
// GrBubbleは使用していないため削除
import CharacterDisplay from '@/components/CharacterDisplay.vue';

export default {
  name: 'QuizView',
  components: {
    GrTitle,
    GrCard,
    GrButton,
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
      return (currentQuestionIndex.value / questions.value.length) * 100;
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

    // クイズモードを確認
    const quizMode = ref(route.query.mode || 'normal');
    const retryQuestionId = ref(route.query.questionId || null);
    const retryQuestionIds = ref([]);
    const isFrequentMistakesMode = ref(route.query.frequentOnly === 'true');
    
    // 複数の問題に挑戦する場合、問題 ID リストを取得
    if (quizMode.value === 'retryMultiple' && route.query.questionIds) {
      try {
        retryQuestionIds.value = JSON.parse(route.query.questionIds);
        console.log('複数問題再挑戦モード:', {
          問題数: retryQuestionIds.value.length,
          よく間違える問題モード: isFrequentMistakesMode.value
        });
      } catch (err) {
        console.error('問題 ID リストの解析エラー:', err);
      }
    }
    
    // マウント時にデータを読み込む
    onMounted(async () => {
      try {
        // クイズ開始時に結果を完全に初期化
        const initialQuizResults = {
          correctCount: 0,
          totalQuestions: 0,
          incorrectIds: [],
          subjectCode: route.params.subjectCode,
          topicCode: route.params.topicCode
        };
        
        // キャッシュ問題を避けるため、旧データを済みチェック
        console.log('全ローカルストレージキー:', Object.keys(localStorage));
        
        // quizResultsとその他のキャッシュをクリア
        localStorage.setItem('quizResults', JSON.stringify(initialQuizResults));
        console.log('クイズ結果を初期化しました:', initialQuizResults);
        
        // デバッグ情報: 指定されたパラメータを表示
        console.log('クイズパラメータ:', { 
          科目コード: subjectCode, 
          トピックコード: topicCode, 
          モード: quizMode.value 
        });
        
        // 再挑戦モードの場合はキャラクターメッセージを変更
        if (quizMode.value === 'retry') {
          characterMessage.value = '間違えた問題に再挑戦してみよう！';
        } else if (quizMode.value === 'retryMultiple') {
          if (isFrequentMistakesMode.value) {
            characterMessage.value = 'よく間違える問題に挑戦してみよう！克服できるかにゃ？';
          } else {
            characterMessage.value = '間違えた問題に挑戦してみよう！今度はできるかにゃ？';
          }
        }
        
        // 科目データを強制的に再読み込み
        await store.dispatch('loadSubjectsData', { forceRefresh: true });
        console.log('科目データを強制的に再読み込みしました');
        
        // 問題データを読み込む - 強制再読み込みオプションを指定
        await store.dispatch('loadProblems', {
          subjectCode,
          topicCode,
          forceRefresh: true // 強制的に再読み込みする
        });
        
        // ストアから問題データを取得
        const problemsData = store.getters.getProblems;
        console.log('取得した問題データ:', problemsData.length, '個');
        
        if (!problemsData || problemsData.length === 0) {
          throw new Error('問題データが見つかりませんでした。');
        }
        
        questions.value = problemsData;
        
        // 再挑戦モードの場合の処理
        if (quizMode.value === 'retry' && retryQuestionId.value) {
          // 単一問題再挑戦モード
          const targetQuestion = questions.value.find(q => q.id === retryQuestionId.value);
          if (targetQuestion) {
            questions.value = [targetQuestion]; // 特定の問題だけを設定
            console.log('再挑戦モード: 問題 ID', retryQuestionId.value);
          } else {
            console.error('指定された問題 ID が見つかりません:', retryQuestionId.value);
          }
        } else if (quizMode.value === 'retryMultiple' && retryQuestionIds.value.length > 0) {
          // 複数問題再挑戦モード
          const targetQuestions = [];
          
          // 指定された問題 ID に一致する問題を取得
          for (const id of retryQuestionIds.value) {
            const question = questions.value.find(q => q.id === id);
            if (question) {
              targetQuestions.push(question);
            }
          }
          
          if (targetQuestions.length > 0) {
            questions.value = targetQuestions; // 対象の問題だけを設定
            questions.value = shuffleArray([...questions.value]); // 問題をシャッフル
            console.log('複数問題再挑戦モード: 読み込み完了', {
              読み込み成功数: targetQuestions.length,
              対象問題数: retryQuestionIds.value.length
            });
          } else {
            console.error('指定された問題が見つかりません');
          }
        } else {
          // 通常モードの場合はランダムに並び替え
          questions.value = shuffleArray([...questions.value]);
        }
        
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
      
      // 正答数と間違えた問題を記録
      const quizResults = JSON.parse(localStorage.getItem('quizResults'));
      
      // 正解か不正解かに応じてカウントを更新
      
      if (isCorrect.value) {
        quizResults.correctCount += 1; // 正解数をカウント
      } else {
        // 間違えた問題のIDを記録
        const incorrectId = currentQuestion.value.id;
        // 重複を確実に防ぐために配列に存在しない場合のみ追加
        if (!quizResults.incorrectIds.includes(incorrectId)) {
          quizResults.incorrectIds.push(incorrectId);
          
          // デバッグ用に問題データをログ出力
          console.log('間違えた問題データ:', {
            id: currentQuestion.value.id,
            question: currentQuestion.value.question,
            explanation: currentQuestion.value.explanation
          });
          
          // 間違えた問題のデータをストアに保存（解説を含む）
          store.commit('addMistake', {
            questionId: currentQuestion.value.id,
            subject: route.params.subjectCode,
            topic: route.params.topicCode,
            question: currentQuestion.value.question,
            options: currentQuestion.value.options,
            correctAnswer: currentQuestion.value.correctAnswer,
            explanation: currentQuestion.value.explanation
          });
        }
      }
      
      // デバッグ用に詳細ログ出力
      console.log('回答後の状態:', {
        問題番号: currentQuestionIndex.value + 1,
        正解: isCorrect.value,
        正答数: quizResults.correctCount,
        不正解問題数: quizResults.incorrectIds.length
      });
      
      // 必ず科目とトピックコードを記録
      quizResults.subjectCode = route.params.subjectCode;
      quizResults.topicCode = route.params.topicCode;
      
      // デバッグ用にログ出力
      console.log('クイズ結果更新:', quizResults);
      localStorage.setItem('quizResults', JSON.stringify(quizResults));
      
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
      // まだ回答が提出されていなければ何もしない
      if (answerSubmitted.value === false) {
        console.log('まだ回答が提出されていないため、nextQuestionをスキップします');
        return;
      }

      if (isLastQuestion.value) {
        // 結果を保存して結果画面へ遷移
        const quizResults = JSON.parse(localStorage.getItem('quizResults'));
        
        // 実際の問題数を正しく記録
        quizResults.totalQuestions = questions.value.length;

        // 間違えた問題の数を問題数から得た正解数を引いた値に修正
        const incorrectCount = quizResults.incorrectIds.length;
        
        // 正確な表示のため正答数を再計算
        // 正答数 = 全問題数 - 不正解数
        quizResults.correctCount = quizResults.totalQuestions - incorrectCount;
        
        // 科目とトピックコードを確実に記録
        quizResults.subjectCode = route.params.subjectCode;
        quizResults.topicCode = route.params.topicCode;
        
        // デバッグ用に詳細ログ出力
        console.log('クイズ結果を保存して結果画面へ遷移');
        console.log('クイズ結果最終:', {
          総問題数: quizResults.totalQuestions,
          正答数: quizResults.correctCount,
          不正解数: incorrectCount,
          正答率: Math.round((quizResults.correctCount / quizResults.totalQuestions) * 100) + '%',
          間違えた問題数: quizResults.incorrectIds.length,
          間違えた問題IDs: quizResults.incorrectIds
        });
        
        localStorage.setItem('quizResults', JSON.stringify(quizResults));
        
        router.push({ 
          name: 'result', 
          params: { subjectCode, topicCode }
        });
      } else {
        console.log('次の問題へ移動: ', currentQuestionIndex.value + 1);
        
        // `nextQuestion` が二重実行されないようにフラグを入れる
        if (!answerSubmitted.value) return;
        
        // 先にフラグをリセットしてからインデックスを増やす
        answerSubmitted.value = false;
        selectedAnswer.value = null;
        
        // `currentQuestionIndex` を1回だけ増やす
        if (currentQuestionIndex.value < questions.value.length - 1) {
          currentQuestionIndex.value += 1;
        }
        
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

    const getCharacterType = () => {
      if (!currentQuestion.value) return 'neko_sensei';

      const difficulty = currentQuestion.value.difficulty;
      if (difficulty === 3) return 'wanwan_doctor';
      if (difficulty === 2) return 'fukurou_professor';
      if (difficulty === 1.5) return 'usagi_coach';
      return 'neko_sensei';
    };

    const getCharacterState = () => {
      if (!answerSubmitted.value) return 'normal';
      return isCorrect.value ? 'happy' : 'teasing';
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
      quizMode,
      retryQuestionId,
      retryQuestionIds,
      isFrequentMistakesMode,
      selectAnswer,
      nextQuestion,
      getChoiceVariant,
      navigateToTopics,
      getCharacterType,
      getCharacterState
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
