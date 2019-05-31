import {
  parseLoginHash,
  unsetToken,
  getUser,
  checkSession,
} from '../utils/auth'

export default {
  namespaced: true,
  state: {
    user: null,
  },
  mutations: {
    login (state, user) {
      state.user = user
    },
    logout (state) {
      state.user = null
    }
  },
  actions: {
    async init ({ commit }) {
      const user = getUser() || await checkSession()
      if (user) {
        commit('login', user)
      }
    },
    async loginCallbackAction ({ commit }) {
      const user = await parseLoginHash()
      commit('login', user)
      return user
    },
    logoutCallbackAction ({ commit }) {
      unsetToken()
      commit('logout')
    }
  },
  getters: {
    user: (state) => state.user,
    isAuthenticated: (state) => Boolean(state.user),
  }
}
