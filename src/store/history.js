const state = {
  //State: Shared Variables
  history: {
    list: []
  }
};
const mutations = {
  //Mutation: Changing state
  SET_HISTORY(state, action) {
    state.history.list = action;
  },
  /*ADD_HOSTORY(state, action) {
      state.historyList = state.historyList.push(action);
  }*/
};
const actions = {
  setHistory(store, action) {
    store.commit("SET_HISTORY", action.list);
  }
};
const getters = {
  getHistory(state) {
    console.log("vuex-getHistory:", state.history)
    return state.history;
  }
};
export default {
  state,
  mutations,
  actions,
  getters
};