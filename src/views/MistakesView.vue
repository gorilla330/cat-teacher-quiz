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
        <!-- すべてクリアボタン -->
        <div class="mistake-actions" v-if="hasClearableMistakes">
          <GrButton
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
              <div class="mistake-actions" v-if="mistake.isClearable">
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
            
            <div class="mistake-choices">
              <div
                v-for="(choice, index) in mistake.choices"
                :key="index"
                class="mistake-choice"
                :class="{ 'correct-answer': index === mistake.correctAnswer }"
              >
                <span class="choice-number">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
                <span class="choice-text">{{ choice }}</span>
                <span
                  v-if="index === mistake.correctAnswer"
                  class="correct-marker"
                >✓</span>
              </div>
            </div>
            
            <div class="mistake-lock-info" v-if="!mistake.isClearable">
              <div class="lock-message">
                {{ getLockedMessage(mistake) }}
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
    
    // フィルタリングされた間違い一覧
    const filteredMistakes = computed(() => {
      if (!selectedSubject.value) return [];
      return store.getters['mistakes/mistakesListBySubject'](selectedSubject.value);
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
    
    // コンポーネントマウント時の処理
    onMounted(() => {
      // クリア可能状態を更新
      store.commit('mistakes/updateClearableStatus');
      loadSubjects();
    });
    
    return {
      selectedSubject,
      availableSubjects,
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
      goToHome
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
