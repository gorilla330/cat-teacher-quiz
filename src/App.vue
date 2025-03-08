<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <nav class="main-nav">
          <router-link to="/" class="logo-link">
            猫先生のクイズチャレンジ
          </router-link>
          <!-- 右上のコンポーネントボタンを削除 -->
        </nav>
      </div>
    </header>
    
    <main class="app-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2025 猫先生のクイズチャレンジ</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'App',
  
  setup() {
    const store = useStore();
    
    onMounted(() => {
      // 間違えた問題データをローカルストレージから読み込む
      store.dispatch('mistakes/loadFromLocalStorage');
      
      // クリア可能状態を更新
      store.commit('mistakes/updateClearableStatus');
      
      // 開発用ログ
      console.log('間違えた問題データを初期化しました');
    });
    
    return {};
  }
}
</script>

<style lang="scss">
@import './styles/variables.scss';

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: $primary;
  padding: $spacing-md 0;
  box-shadow: $shadow-md;
  
  .main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .logo-link {
      font-family: $font-title;
      font-size: 1.8rem;
      color: white;
      text-decoration: none;
      transition: transform $transition-speed $transition-function;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    .nav-links {
      display: flex;
      gap: $spacing-md;
      
      .nav-link {
        color: white;
        text-decoration: none;
        padding: $spacing-xs $spacing-sm;
        border-radius: $border-radius-sm;
        transition: background-color $transition-speed $transition-function;
        
        &:hover, &.router-link-active {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}

.app-content {
  flex: 1;
  padding: $spacing-xl 0;
}

.app-footer {
  background-color: $primary;
  color: white;
  padding: $spacing-md 0;
  font-size: 0.9rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}
</style>
