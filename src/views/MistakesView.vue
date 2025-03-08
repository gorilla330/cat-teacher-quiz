<template>
  <div class="mistakes-view">
    <!-- ヘッダー -->
    <div class="mistakes-header">
      <GrTitle tag="h1" size="lg" color="primary">間違えた問題</GrTitle>
    </div>

    <!-- 間違えた問題がない場合 -->
    <template v-if="totalMistakes === 0">
      <div class="empty-state">
        <div class="empty-image">
          <CharacterDisplay
            :image="'sleepy_cat.webp'"
            :size="'large'"
          />
        </div>
        <GrBubble>
          <p>まだ間違えた問題はありません。</p>
          <p>クイズに挑戦して、苦手な問題を見つけましょう！</p>
        </GrBubble>
        <div class="back-button">
          <GrButton variant="primary" @click="goToHome">ホームに戻る</GrButton>
        </div>
      </div>
    </template>

    <!-- 間違えた問題がある場合 -->
    <template v-else>
      <!-- 科目タブ -->
      <div class="subject-tabs">
        <div
          v-for="subject in availableSubjects"
          :key="subject.code"
          class="subject-tab"
          :class="{ active: selectedSubject === subject.code }"
          @click="selectSubject(subject.code)"
        >
          <div class="tab-content">
            <span>{{ subject.name }}</span>
            <span class="count">{{ mistakesBySubject[subject.code] || 0 }}</span>
            <span
              v-if="frequentMistakesBySubject[subject.code]"
              class="frequent-marker"
              :title="`よく間違える問題が${frequentMistakesBySubject[subject.code]}個あります`"
            >★</span>
          </div>
        </div>
      </div>
      
      <!-- 問題リスト -->
      <div class="mistakes-content" v-if="selectedSubject && filteredMistakes.length > 0">
        <!-- アクションボタンエリア -->
        <div class="mistake-actions-area">
          <!-- 一括挑戦ボタン -->
          <GrButton
            variant="primary"
            @click="retryAllMistakes(false)"
          >
            すべての問題に挑戦
          </GrButton>
          
          <!-- よく間違える問題に挑戦ボタン -->
          <GrButton
            v-if="hasFrequentMistakes"
            variant="accent4"
            @click="retryAllMistakes(true)"
          >
            よく間違える問題に挑戦
          </GrButton>
          
          <!-- すべてクリアボタン -->
          <GrButton
            v-if="hasClearableMistakes"
            variant="warning"
            @click="showClearAllConfirmation = true"
          >
            すべてクリア
          </GrButton>
        </div>
        
        <!-- 問題カード -->
        <div class="mistake-cards">
          <GrCard
            v-for="mistake in filteredMistakes"
            :key="mistake.questionId"
            :class="{ 'frequent-mistake': mistake.count >= 2 }"
          >
            <div class="mistake-header">
              <div class="mistake-info">
                <span class="mistake-count">{{ mistake.count }}回間違えました</span>
                <span
                  v-if="mistake.count >= 2"
                  class="frequent-badge"
                  title="よく間違える問題"
                >★ よく間違える問題</span>
              </div>
              <div class="mistake-actions">
                <GrButton
                  variant="primary"
                  size="sm"
                  class="retry-button"
                  @click="retryQuestion(mistake)"
                >
                  再挑戦
                </GrButton>
                <GrButton
                  variant="warning"
                  size="sm"
                  @click="confirmClearMistake(mistake.questionId)"
                >
                  クリア
                </GrButton>
              </div>
            </div>
            
            <div class="mistake-question">
              <GrHighlight>{{ mistake.question }}</GrHighlight>
            </div>
            
            <!-- 解説セクション -->
            <div class="mistake-explanation">
              <!-- 解説セクション - データ取得中はローディング表示 -->
              <div class="explanation-section" v-if="isExplanationLoading(mistake)">
                <h4 class="explanation-title">解説を読み込み中...</h4>
                <p class="explanation-loading">お待ちください</p>
              </div>
              
              <!-- 解説が見つからない場合 -->
              <div class="explanation-section" v-else-if="!isExplanationLoading(mistake) && getExplanation(mistake) === null">
                <h4 class="explanation-title">解説が見つかりません</h4>
                <p class="explanation-debug">利用可能なデータキー: {{ Object.keys(mistake).join(', ') }}</p>
              </div>
              
              <!-- 解説データがあれば表示 -->
              <div class="explanation-section" v-else-if="getExplanation(mistake)">
                <h4 class="explanation-title">解説</h4>
                <p class="explanation-text">{{ getExplanation(mistake) }}</p>
              </div>
              
              <!-- 解説が見つからない場合のデバッグ情報 -->
              <div v-else class="explanation-section debug-section">
                <h4 class="explanation-title">解説が見つかりません</h4>
                <p class="explanation-debug">
                  利用可能なデータキー: {{ Object.keys(mistake).join(', ') }}
                </p>
              </div>
            </div>
            

          </GrCard>
        </div>
      </div>
      
      <!-- 戻るボタン -->
      <div class="back-button">
        <GrButton variant="primary" @click="goToHome">ホームに戻る</GrButton>
      </div>
    </template>
    
    <!-- クリア確認モーダル - 個別の問題 -->
    <div v-if="showClearConfirmation" class="confirm-modal">
      <div class="modal-content">
        <h2>確認</h2>
        <p>この問題をクリアしますか？</p>
        <p class="warning-text">※クリアした問題は元に戻せません</p>
        <div class="modal-actions">
          <GrButton
            variant="secondary"
            @click="showClearConfirmation = false"
          >
            キャンセル
          </GrButton>
          <GrButton
            variant="warning"
            @click="clearMistake"
          >
            クリアする
          </GrButton>
        </div>
      </div>
    </div>
    
    <!-- クリア確認モーダル - すべての問題 -->
    <div v-if="showClearAllConfirmation" class="confirm-modal">
      <div class="modal-content">
        <h2>確認</h2>
        <p>クリア可能なすべての問題をクリアしますか？</p>
        <p class="warning-text">※クリアした問題は元に戻せません</p>
        <div class="modal-actions">
          <GrButton
            variant="secondary"
            @click="showClearAllConfirmation = false"
          >
            キャンセル
          </GrButton>
          <GrButton
            variant="warning"
            @click="clearAllMistakes"
          >
            すべてクリアする
          </GrButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import DataManager from '@/services/DataManager';
import GrTitle from '@/components/ui/GrTitle.vue';
import GrButton from '@/components/ui/GrButton.vue';
import GrCard from '@/components/ui/GrCard.vue';
import GrHighlight from '@/components/ui/GrHighlight.vue';
import GrBubble from '@/components/ui/GrBubble.vue';
import CharacterDisplay from '@/components/CharacterDisplay.vue';

export default {
  name: 'MistakesView',
  components: {
    GrTitle,
    GrButton,
    GrCard,
    GrHighlight,
    GrBubble,
    CharacterDisplay
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // リアクティブな状態
    const selectedSubject = ref(null);
    const showClearConfirmation = ref(false);
    const showClearAllConfirmation = ref(false);
    const mistakeToDelete = ref(null);
    
    // 利用可能な科目
    const availableSubjects = [
      { code: 'science', name: '理科' },
      { code: 'social', name: '社会' }
    ];
    
    // 科目をロード（並び替えられた際に使用）
    const loadSubjects = () => {
      // 初期選択科目を設定（間違いが存在する科目を選択）
      if (!selectedSubject.value && Object.keys(mistakesBySubject.value).length > 0) {
        const subjects = Object.keys(mistakesBySubject.value);
        selectedSubject.value = subjects[0];
      }
    };
    
    // 総間違い数
    const totalMistakes = computed(() => {
      return store.getters['mistakes/totalMistakes'];
    });
    
    // 科目ごとの間違い数
    const mistakesBySubject = computed(() => {
      return store.getters['mistakes/mistakesBySubject'];
    });
    
    // よく間違える問題の数（科目ごと）
    const frequentMistakesBySubject = computed(() => {
      return store.getters['mistakes/frequentMistakesBySubject'];
    });
    
    // よく間違える問題があるかどうか
    const hasFrequentMistakes = computed(() => {
      return filteredMistakes.value.some(mistake => mistake.count >= 2);
    });
    
    // フィルタリングされた間違い一覧
    const filteredMistakes = computed(() => {
      if (!selectedSubject.value) return [];
      const mistakes = store.getters['mistakes/mistakesListBySubject'](selectedSubject.value);
      
      // デバッグ用に間違いデータの内容を確認
      console.log('間違い一覧データ:', mistakes);
      if (mistakes.length > 0) {
        console.log('最初の間違いデータサンプル:', {
          問題ID: mistakes[0].questionId,
          問題文: mistakes[0].question,
          正解選択肢: mistakes[0].correctAnswer,
          解説: mistakes[0].explanation,
          データキー: Object.keys(mistakes[0])
        });
      }
      
      return mistakes;
    });
    
    // クリア可能な間違いがあるかどうか
    const hasClearableMistakes = computed(() => {
      return filteredMistakes.value.some(mistake => mistake.isClearable);
    });
    
    // ロックメッセージの取得
    const getLockedMessage = (mistake) => {
      return store.getters['mistakes/getLockedMessage'](mistake);
    };
    
    // 科目を選択
    const selectSubject = (subjectCode) => {
      selectedSubject.value = subjectCode;
    };
    
    // 個別の間違いをクリアする確認
    const confirmClearMistake = (questionId) => {
      mistakeToDelete.value = questionId;
      showClearConfirmation.value = true;
    };
    
    // 個別の間違いをクリア
    const clearMistake = () => {
      if (mistakeToDelete.value) {
        store.dispatch('mistakes/clearMistake', mistakeToDelete.value);
        showClearConfirmation.value = false;
        mistakeToDelete.value = null;
        
        // 間違いがなくなった場合、選択科目をリセット
        if (totalMistakes.value === 0) {
          selectedSubject.value = null;
        } else {
          loadSubjects();
        }
      }
    };
    
    // すべての間違いをクリア
    const clearAllMistakes = () => {
      store.dispatch('mistakes/clearAllMistakes');
      showClearAllConfirmation.value = false;
      
      // 間違いがなくなった場合、選択科目をリセット
      if (totalMistakes.value === 0) {
        selectedSubject.value = null;
      } else {
        loadSubjects();
      }
    };
    
    // ホーム画面に戻る
    const goToHome = () => {
      router.push({ name: 'home' });
    };
    
    // 間違えた問題に再挑戦する
    const retryQuestion = (mistake) => {
      // 間違えた問題のIDと科目、トピックを取得
      const questionId = mistake.questionId;
      const subjectCode = mistake.subject; // mistake.subjectCodeではなくmistake.subjectを使用
      const topicCode = mistake.topic; // mistake.topicCodeではなくmistake.topicを使用
      
      console.log('再挑戦する問題の情報:', {
        問題ID: questionId,
        科目コード: subjectCode,
        トピックコード: topicCode
      });
      
      // 科目コードとトピックコードが正しく取得できているか確認
      if (!subjectCode || !topicCode) {
        console.error('科目コードまたはトピックコードが見つかりません', mistake);
        return;
      }
      
      // 専用のクイズモードを作成（1問だけのクイズ）
      const quizParams = {
        mode: 'retry',
        questionId
      };
      
      // クイズページに遷移
      router.push({
        name: 'quiz',
        params: {
          subjectCode,
          topicCode
        },
        query: quizParams
      });
    };
    
    // すべての間違えた問題またはよく間違える問題に挑戦する
    const retryAllMistakes = (frequentOnly = false) => {
      if (!selectedSubject.value || filteredMistakes.value.length === 0) return;
      
      // 対象となる問題をフィルタリング
      let targetMistakes = [...filteredMistakes.value];
      if (frequentOnly) {
        // よく間違える問題（count >= 2）のみにフィルタリング
        targetMistakes = targetMistakes.filter(mistake => mistake.count >= 2);
      }
      
      if (targetMistakes.length === 0) {
        console.warn('対象となる問題がありません');
        return;
      }
      
      // 問題のIDリストを作成
      const questionIds = targetMistakes.map(mistake => mistake.questionId);
      
      // 選択された科目を使用
      const subjectCode = selectedSubject.value;
      
      // 各問題のトピックコードを取得 (mistakeにはtopicプロパティとして保存されている)
      const uniqueTopicCodes = [...new Set(targetMistakes.map(mistake => mistake.topic))];
      
      // トピックコードの選択 - 共通のコードがあれば使用、なければ最初の問題のコードを使用
      const topicCode = uniqueTopicCodes.length === 1 ? uniqueTopicCodes[0] : targetMistakes[0].topic;
      
      // 問題が複数のトピックにまたがる場合のログ
      if (uniqueTopicCodes.length > 1) {
        console.log('複数のトピックにまたがる問題があります:', uniqueTopicCodes);
      }
      
      console.log('再挑戦パラメータ確認:', {
        科目コード: subjectCode,
        トピックコード: topicCode,
        問題数: questionIds.length,
        対象トピック数: uniqueTopicCodes.length,
        よく間違えるモード: frequentOnly
      });
      
      // 科目コードとトピックコードが存在するか確認
      if (!subjectCode || !topicCode) {
        console.error('科目またはトピックが正しく取得できませんでした');
        return;
      }
      
      // クイズパラメータを作成
      const quizParams = {
        mode: 'retryMultiple',
        questionIds: JSON.stringify(questionIds),
        frequentOnly: frequentOnly ? 'true' : 'false'
      };
      
      // 間違えた問題のクイズページに遷移
      // トピックコードは必須パラメータであるため、確実に渡す
      try {
        router.push({
          name: 'quiz',
          params: {
            subjectCode,
            topicCode
          },
          query: quizParams
        });
        
        console.log('クイズに遷移します:', {
          科目: subjectCode,
          トピック: topicCode,
          問題数: questionIds.length,
          モード: frequentOnly ? 'よく間違える問題' : 'すべての間違えた問題'
        });
      } catch (error) {
        console.error('クイズページへの遷移中にエラーが発生しました:', error);
      }
    };
    
    // コンポーネントマウント時の処理
    onMounted(() => {
      // クリア可能状態を更新
      store.commit('mistakes/updateClearableStatus');
      loadSubjects();
      
      // 全ての間違いに対して解説データを取得
      filteredMistakes.value.forEach(mistake => {
        fetchExplanation(mistake);
      });
    });
    
    // DataManagerインスタンスを作成
    const dataManager = new DataManager();
    
    // 解説データを保持するリアクティブなオブジェクト
    const explanations = ref({});
    const explanationLoading = ref({});
    
    // ローディング状態を確認するヘルパーメソッド
    const isExplanationLoading = (mistake) => {
      return mistake && mistake.questionId && explanationLoading.value[mistake.questionId] === true;
    };
    
    // データファイルから解説を非同期で取得するメソッド
    const fetchExplanation = async (mistake) => {
      const mistakeId = mistake.questionId;
      
      // 既に取得済みまたは取得中なら何もしない
      if (explanations.value[mistakeId] !== undefined || explanationLoading.value[mistakeId]) {
        return;
      }

      // ローディング状態をセット
      explanationLoading.value[mistakeId] = true;

      try {
        // まずはローカルのデータから確認
        if (mistake.explanation) {
          explanations.value[mistakeId] = mistake.explanation;
          return;
        }

        // 問題データファイルから取得してみる
        if (mistake.subject && mistake.topic && mistake.questionId) {
          try {
            // データファイル名を形式に合わせて生成 (`public/data/{subject}_{topic}.json`)
            const fileName = `${mistake.subject}_${mistake.topic}.json`;

            // データファイルからデータを取得
            const problemsData = await dataManager.loadProblemFile(fileName);
            if (problemsData && problemsData.questions) {
              // 問題データを找す
              const question = problemsData.questions.find(q => q.id === mistake.questionId);
              if (question && question.explanation) {
                explanations.value[mistakeId] = question.explanation;
                return;
              }
            }
          } catch (e) {
            console.error('データ取得エラー:', e);
          }
        }

        // 解説が見つからない場合は空に設定
        explanations.value[mistakeId] = null;

      } finally {
        // ローディング状態終了
        explanationLoading.value[mistakeId] = false;
      }
    };
    
    // 解説データをテンプレートで参照するメソッド
    const getExplanation = (mistake) => {
      const mistakeId = mistake.questionId;
      
      // まだ取得していない場合は非同期で取得実行
      if (explanations.value[mistakeId] === undefined) {
        fetchExplanation(mistake);
        return null;  // 取得中は空を返す
      }
      
      return explanations.value[mistakeId];
    };
    
    return {
      selectedSubject,
      availableSubjects,
      isExplanationLoading,
      totalMistakes,
      mistakesBySubject,
      frequentMistakesBySubject,
      filteredMistakes,
      hasClearableMistakes,
      showClearConfirmation,
      showClearAllConfirmation,
      getLockedMessage,
      selectSubject,
      confirmClearMistake,
      clearMistake,
      clearAllMistakes,
      goToHome,
      retryQuestion,
      retryAllMistakes,
      hasFrequentMistakes,
      getExplanation,
      explanations
    };
  }
};
</script>

<style scoped lang="scss">
.mistakes-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.mistakes-header {
  text-align: center;
  margin-bottom: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  
  .empty-image {
    width: 150px;
    height: 150px;
  }
}

.subject-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .subject-tab {
    cursor: pointer;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    background-color: #f0f0f0;
    transition: all 0.3s ease;
    
    &.active {
      background-color: #2194f3;
      color: white;
    }
    
    .tab-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.5rem;
      height: 1.5rem;
      padding: 0 0.25rem;
      border-radius: 1rem;
      background-color: rgba(0, 0, 0, 0.2);
      color: white;
      font-size: 0.75rem;
    }
    
    .frequent-marker {
      color: #ff9800;
      font-weight: bold;
    }
  }
}

.mistakes-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  .mistake-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }
}

.mistake-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .frequent-mistake {
    border-left: 4px solid #ff9800;
  }
}

.mistake-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  .mistake-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .mistake-count {
    font-weight: bold;
    color: #f44336;
  }
  
  .frequent-badge {
    color: #ff9800;
    font-weight: bold;
    font-size: 0.85rem;
  }
}

.mistake-question {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.mistake-choices {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  .mistake-choice {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    
    &.correct-answer {
      background-color: rgba(46, 204, 113, 0.15);
    }
    
    .choice-number {
      font-weight: bold;
      min-width: 1.5rem;
    }
    
    .correct-marker {
      margin-left: auto;
      color: #2ecc71;
      font-weight: bold;
    }
  }
}

.mistake-explanation {
  margin-top: 0.5rem;
  
  .correct-answer-section {
    padding: 1rem;
    background-color: #e8f6f3;
    border-left: 4px solid #2ecc71;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    
    .correct-answer-title {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: #2ecc71;
      font-weight: bold;
    }
    
    .correct-answer-text {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
      font-weight: 500;
    }
  }
  
  .explanation-section {
    padding: 1rem;
    background-color: #f9f9f9;
    border-left: 4px solid #3498db;
    border-radius: 4px;
    
    .explanation-title {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: #3498db;
      font-weight: bold;
    }
    
    .explanation-text {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }
  }
}

.mistake-lock-info {
  padding: 0.75rem;
  background-color: #f8f8f8;
  border-radius: 4px;
  border-left: 4px solid #f44336;
  
  .lock-message {
    color: #f44336;
    font-size: 0.9rem;
  }
}

.back-button {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
    
    h2 {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    
    .warning-text {
      color: #f44336;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
}
</style>
