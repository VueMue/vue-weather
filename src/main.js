import Vue from 'vue'
import App from './App.vue';
import Lottie from 'vue-lottie';
import store from './store';

Vue.component("lottie", Lottie);

new Vue({
  store,
  el: '#app',
  render: h => h(App)
})
