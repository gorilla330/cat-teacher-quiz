<template>
  <div :class="['gr-card', elevationClass, borderClass]">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'GrCard',
  props: {
    elevation: {
      type: String,
      default: 'md',
      validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
    },
    border: {
      type: String,
      default: 'primary',
      validator: (value) => ['none', 'primary', 'accent1', 'accent2', 'accent3', 'accent4', 'social', 'science'].includes(value)
    }
  },
  computed: {
    elevationClass() {
      return `elevation-${this.elevation}`;
    },
    borderClass() {
      return `border-${this.border}`;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.gr-card {
  position: relative;
  background-color: white;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px dashed rgba($primary, 0.3);
    border-radius: $border-radius-xl;
    z-index: -1;
    transform: rotate(-0.5deg);
  }
  
  // 影のバリエーション
  &.elevation-none {
    box-shadow: none;
  }
  
  &.elevation-sm {
    box-shadow: $shadow-sm;
  }
  
  &.elevation-md {
    box-shadow: $shadow-md;
  }
  
  &.elevation-lg {
    box-shadow: $shadow-lg;
  }
  
  // 枠線のバリエーション
  &.border-none {
    border: none;
    
    &::before {
      display: none;
    }
  }
  
  &.border-primary {
    border: 2px solid $primary;
    
    &::before {
      border-color: rgba($primary, 0.3);
    }
  }
  
  &.border-accent1 {
    border: 2px solid $accent1;
    
    &::before {
      border-color: rgba($accent1, 0.3);
    }
  }
  
  &.border-accent2 {
    border: 2px solid $accent2;
    
    &::before {
      border-color: rgba($accent2, 0.3);
    }
  }
  
  &.border-accent3 {
    border: 2px solid $accent3;
    
    &::before {
      border-color: rgba($accent3, 0.3);
    }
  }
  
  &.border-accent4 {
    border: 2px solid $accent4;
    
    &::before {
      border-color: rgba($accent4, 0.3);
    }
  }
}
</style>
