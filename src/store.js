import Vue from 'vue';
import Vuex from 'vuex';
import history from './store/history';
import sample from './store/sample';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    history,
    sample
  }
})