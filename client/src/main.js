import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createHead } from '@vueuse/head'
import router from './router'
import './plugins/fontawesome'
import './style.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(createHead())
app.component('FaIcon', FontAwesomeIcon)
app.mount('#app')
