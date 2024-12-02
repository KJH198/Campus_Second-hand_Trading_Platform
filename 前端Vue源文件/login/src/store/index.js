import { createStore } from 'vuex'

export default createStore({
  state: {
    userInfo: null
  },
  mutations: {
    setUserInfo(state, info) {
      state.userInfo = info
    }
  }
}) 