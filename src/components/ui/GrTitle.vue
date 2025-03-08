<template>
  <component :is="tag" :class="['gr-title', sizeClass, colorClass]">
    <slot></slot>
  </component>
</template>

<script>
export default {
  name: 'GrTitle',
  props: {
    tag: {
      type: String,
      default: 'h2',
      validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'accent1', 'accent2', 'accent3', 'accent4'].includes(value)
    }
  },
  computed: {
    sizeClass() {
      return `title-${this.size}`;
    },
    colorClass() {
      return `title-${this.color}`;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.gr-title {
  font-family: $font-title;
  position: relative;
  display: inline-block;
  margin-bottom: $spacing-lg;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 3px;
    border-radius: 2px;
    transform: rotate(-0.5deg);
  }
  
  // サイズバリエーション
  &.title-sm {
    font-size: 1.2rem;
    
    &::after {
      height: 2px;
    }
  }
  
  &.title-md {
    font-size: 1.8rem;
    
    &::after {
      height: 3px;
    }
  }
  
  &.title-lg {
    font-size: 2.4rem;
    
    &::after {
      height: 4px;
    }
  }
  
  &.title-xl {
    font-size: 3rem;
    
    &::after {
      height: 5px;
    }
  }
  
  // カラーバリエーション
  &.title-primary::after {
    background-color: $primary;
  }
  
  &.title-accent1::after {
    background-color: $accent1;
  }
  
  &.title-accent2::after {
    background-color: $accent2;
  }
  
  &.title-accent3::after {
    background-color: $accent3;
  }
  
  &.title-accent4::after {
    background-color: $accent4;
  }
}
</style>
