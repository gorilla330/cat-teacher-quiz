<template>
  <span :class="['gr-highlight', colorClass, { 'inline': inline }]">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'GrHighlight',
  props: {
    color: {
      type: String,
      default: 'yellow',
      validator: (value) => ['yellow', 'orange', 'red'].includes(value)
    },
    inline: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    colorClass() {
      return `highlight-${this.color}`;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.gr-highlight {
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0.5em;
    z-index: -1;
    transform: rotate(-1deg) translateY(0.1em);
  }
  
  &.inline {
    display: inline;
  }
  
  &:not(.inline) {
    display: inline-block;
  }
  
  // カラーバリエーション
  &.highlight-yellow::before {
    background-color: rgba($accent1, 0.4);
  }
  
  &.highlight-orange::before {
    background-color: rgba($accent2, 0.4);
  }
  
  &.highlight-red::before {
    background-color: rgba($accent4, 0.4);
  }
}
</style>
