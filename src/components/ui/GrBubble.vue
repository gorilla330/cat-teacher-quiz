<template>
  <div :class="['gr-bubble', `bubble-${direction}`, colorClass]">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'GrBubble',
  props: {
    direction: {
      type: String,
      default: 'bottom',
      validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
    },
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'accent1', 'accent2', 'accent3', 'accent4', 'white'].includes(value)
    }
  },
  computed: {
    colorClass() {
      return `bubble-${this.color}`;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.gr-bubble {
  position: relative;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  
  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    transform: rotate(45deg);
  }
  
  // 方向バリエーション
  &.bubble-bottom::before {
    top: -10px;
    left: 20px;
  }
  
  &.bubble-top::before {
    bottom: -10px;
    left: 20px;
  }
  
  &.bubble-left::before {
    top: 20px;
    right: -10px;
  }
  
  &.bubble-right::before {
    top: 20px;
    left: -10px;
  }
  
  // カラーバリエーション
  &.bubble-primary {
    background-color: $primary;
    color: white;
    border: 2px solid darken($primary, 10%);
    
    &::before {
      background-color: $primary;
      border: 2px solid darken($primary, 10%);
      border-top-color: transparent;
      border-left-color: transparent;
    }
  }
  
  &.bubble-accent1 {
    background-color: $accent1;
    color: $primary;
    border: 2px solid darken($accent1, 10%);
    
    &::before {
      background-color: $accent1;
      border: 2px solid darken($accent1, 10%);
      border-top-color: transparent;
      border-left-color: transparent;
    }
  }
  
  &.bubble-accent2 {
    background-color: $accent2;
    color: $primary;
    border: 2px solid darken($accent2, 10%);
    
    &::before {
      background-color: $accent2;
      border: 2px solid darken($accent2, 10%);
      border-top-color: transparent;
      border-left-color: transparent;
    }
  }
  
  &.bubble-accent3 {
    background-color: $accent3;
    color: white;
    border: 2px solid darken($accent3, 10%);
    
    &::before {
      background-color: $accent3;
      border: 2px solid darken($accent3, 10%);
      border-top-color: transparent;
      border-left-color: transparent;
    }
  }
  
  &.bubble-accent4 {
    background-color: $accent4;
    color: white;
    border: 2px solid darken($accent4, 10%);
    
    &::before {
      background-color: $accent4;
      border: 2px solid darken($accent4, 10%);
      border-top-color: transparent;
      border-left-color: transparent;
    }
  }
  
  &.bubble-white {
    background-color: white;
    color: $primary;
    border: 2px solid $primary;
    
    &::before {
      background-color: white;
      border: 2px solid $primary;
      border-top-color: transparent;
      border-left-color: transparent;
    }
  }
  
  // 方向ごとの境界線調整
  &.bubble-bottom::before {
    border-bottom: none;
    border-right: none;
  }
  
  &.bubble-top::before {
    border-top: none;
    border-left: none;
  }
  
  &.bubble-left::before {
    border-left: none;
    border-bottom: none;
  }
  
  &.bubble-right::before {
    border-right: none;
    border-top: none;
  }
}
</style>
