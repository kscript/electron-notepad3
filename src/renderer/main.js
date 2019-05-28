import Vue from 'vue'
import axios from 'axios'
import path from 'path'
import VJstree from 'vue-jstree'
import VueCodeMirror from 'vue-codemirror-lite'
import App from './App'
import router from './router'
import store from './store'
import { eventBus } from './utils/eventBus'
import { electron } from './utils/electron'
import { copy } from './utils'
import file from './utils/file'
import './assets/scss/global.scss'
import elementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.prototype.tool = {
  electron,
  file,
  path,
  copy
}
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(VJstree)
Vue.use(eventBus)
Vue.use(elementUI)
Vue.use(VueCodeMirror, {
  events: ['changes']
})
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
