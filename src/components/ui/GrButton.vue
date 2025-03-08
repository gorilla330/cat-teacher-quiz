<template>
  <button 
    :class="['gr-button', variantClass, sizeClass, { 'full-width': fullWidth }]" 
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'GrButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'accent1', 'accent2', 'accent3', 'accent4'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    variantClass() {
      return `btn-${this.variant}`;
    },
    sizeClass() {
      return `btn-${this.size}`;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.gr-button {
  font-family: $font-handwritten;
  border: 2px solid $primary;
  border-radius: $border-radius-md;
  position: relative;
  transition: transform $transition-speed $transition-function, box-shadow $transition-speed $transition-function;
  overflow: hidden;
  display: inline-block;
  text-align: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%);
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) rotate(-1deg);
    box-shadow: $shadow-md;
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: $shadow-sm;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.full-width {
    width: 100%;
  }
  
  // サイズバリエーション
  &.btn-sm {
    font-size: 0.9rem;
    padding: $spacing-xs $spacing-md;
  }
  
  &.btn-md {
    font-size: 1.1rem;
    padding: $spacing-sm $spacing-lg;
  }
  
  &.btn-lg {
    font-size: 1.3rem;
    padding: $spacing-md $spacing-xl;
  }
  
  // カラーバリエーション
  &.btn-primary {
    background-color: $primary;
    color: white;
    border-color: darken($primary, 10%);
  }
  
  &.btn-accent1 {
    background-color: $accent1;
    color: $primary;
    border-color: darken($accent1, 10%);
  }
  
  &.btn-accent2 {
    background-color: $accent2;
    color: $primary;
    border-color: darken($accent2, 10%);
  }
  
  &.btn-accent3 {
    background-color: $accent3;
    color: white;
    border-color: darken($accent3, 10%);
  }
  
  &.btn-accent4 {
    background-color: $accent4;
    color: white;
    border-color: darken($accent4, 10%);
  }
}
</style>
