import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// グローバルスタイルシートのインポート
import './styles/main.scss'

const app = createApp(App)

// Vue Router と Vuex を使用
app.use(router)
app.use(store)

// アプリケーションをマウント
app.mount('#app')
