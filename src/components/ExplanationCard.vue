<template>
  <GrCard 
    class="explanation-card" 
    :elevation="isCorrect ? 'lg' : 'md'" 
    :border="isCorrect ? 'accent2' : 'accent4'"
  >
    <div class="explanation-header">
      <GrTitle tag="h3" size="md" :color="isCorrect ? 'accent2' : 'accent4'" class="explanation-title">
        {{ isCorrect ? '正解！' : '不正解...' }}
      </GrTitle>
      <div class="explanation-icon">
        <span v-if="isCorrect" class="icon-correct">✓</span>
        <span v-else class="icon-incorrect">✗</span>
      </div>
    </div>
    
    <div class="explanation-content">
      <p class="explanation-text">{{ explanation }}</p>
      
      <div v-if="memoryTip" class="memory-tip-container">
        <GrHighlight color="secondary" class="memory-tip">
          <div class="memory-tip-header">
            <span class="memory-tip-icon">💡</span>
            <span class="memory-tip-title">覚え方のヒント</span>
          </div>
          <p class="memory-tip-text">{{ memoryTip }}</p>
        </GrHighlight>
      </div>
      
      <div v-if="tags && tags.length > 0" class="tags-container">
        <span v-for="(tag, index) in tags" :key="index" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>
    
    <div class="actions">
      <slot name="actions">
        <GrButton 
          :variant="isCorrect ? 'accent2' : 'primary'"
          size="md"
          @click="$emit('next')"
          class="next-button"
        >
          {{ nextButtonText }}
        </GrButton>
      </slot>
    </div>
  </GrCard>
</template>

<script>
import { computed } from 'vue';
import GrCard from '@/components/ui/GrCard.vue';
import GrTitle from '@/components/ui/GrTitle.vue';
import GrButton from '@/components/ui/GrButton.vue';
import GrHighlight from '@/components/ui/GrHighlight.vue';

export default {
  name: 'ExplanationCard',
  components: {
    GrCard,
    GrTitle,
    GrButton,
    GrHighlight
  },
  props: {
    isCorrect: {
      type: Boolean,
      required: true
    },
    explanation: {
      type: String,
      required: true
    },
    memoryTip: {
      type: String,
      default: ''
    },
    tags: {
      type: Array,
      default: () => []
    },
    isLastQuestion: {
      type: Boolean,
      default: false
    }
  },
  emits: ['next'],
  setup(props) {
    const nextButtonText = computed(() => {
      return props.isLastQuestion ? '結果を見る' : '次の問題へ';
    });

    return {
      nextButtonText
    };
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.explanation-card {
  width: 100%;
  margin-bottom: 1.5rem;
}

.explanation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.explanation-title {
  margin: 0;
}

.explanation-icon {
  font-size: 1.5rem;
  font-weight: bold;
  
  .icon-correct {
    color: $color-accent2;
  }
  
  .icon-incorrect {
    color: $color-accent4;
  }
}

.explanation-content {
  margin-bottom: 1.5rem;
}

.explanation-text {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.memory-tip-container {
  margin: 1rem 0;
}

.memory-tip {
  padding: 1rem;
  border-radius: 8px;
}

.memory-tip-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.memory-tip-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.memory-tip-title {
  font-size: 1rem;
}

.memory-tip-text {
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  background-color: $color-secondary-light;
  color: $color-secondary-dark;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.next-button {
  min-width: 120px;
}
</style>
