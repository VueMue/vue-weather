const state = {
  //State: Shared Variables
  sample: "initialValue"
};
const mutations = {
  //Mutation: Changing state
  SET_SAMPLE(state, action) {
    state.sample = action;
  },
  ADD_HOSTORY(state, action) {
    state.historyList = state.historyList.push(action);
  }
};
const actions = {
  setSample(store, action) {
    store.commit("SET_SAMPLE", action);
  }
};
const getters = {
  getSample(state) {
    return state.sample;
  }
};
export default {
  state,
  mutations,
  actions,
  getters
};