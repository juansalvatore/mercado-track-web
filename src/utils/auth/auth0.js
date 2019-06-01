import { Auth0Lock } from 'auth0-lock'
import qs from 'query-string'
import { getUser, setToken, unsetToken } from './auth'
import { CLIENT_ID, ROUTES } from './authConstants'
import config from './authLockConfig.json'
import store from '../../store'
import router from '../../router'

const baseUrl = `${window.location.protocol}//${window.location.host}`

const lock = new Auth0Lock(CLIENT_ID, ROUTES.DOMAIN, config)

export const login = () => lock.show()

export const logout = () => {
  const { path, query } = router.currentRoute
  const logoutRoute = `${baseUrl}${ROUTES.CALLBACK_ROUTE_LOGOUT}`
  if (path === '/') {
    lock.logout({
      returnTo: logoutRoute
    })
  } else {
    let queryStr = qs.stringify(query)
    queryStr = queryStr ? `?${queryStr}` : ''
    lock.logout({
      returnTo: `${logoutRoute}?returnTo=${encodeURIComponent(path + queryStr)}`,
    })
  }
}

export const logoutCallback = (returnTo) => {
  unsetToken()
  store.commit('auth/logout')
  router.push(returnTo || '/')
}

export const initAuth = async () => {
  const user = await checkSession(lock)
  if (user) {
    addUserToStore(user)
  }
  lock.on('authenticated', (result) => {
    setToken(result.idToken, result.accessToken)
    addUserToStore(getUser())
  })
}

const addUserToStore = (user) => {
  store.commit('auth/login', user)
  store.commit('snackbar/welcome', user)
}

const checkSession = async (lock) => {
  return new Promise((resolve) => {
    // check if only checkSession should be called
    const user = getUser()
    if (user) {
      return resolve(user)
    }
    lock.checkSession({
      redirectUri: baseUrl
    }, (err, result) => {
      if (err) resolve(null) // always resolving
      else {
        setToken(result.idToken, result.accessToken)
        resolve(getUser())
      }
    })
  })
}