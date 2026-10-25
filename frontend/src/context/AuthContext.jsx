import { createContext, useContext, useState } from 'react'
import { loginRequest, registerRequest } from '../api/auth.js'

const STORAGE_KEY = 'lotline.session'

const AuthContext = createContext(null)

function readSavedSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

// Holds the signed-in user and token, and keeps them in localStorage across reloads
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSavedSession)

  function saveSession(newSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
    setSession(newSession)
  }

  async function login(credentials) {
    saveSession(await loginRequest(credentials))
  }

  async function register(details) {
    saveSession(await registerRequest(details))
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  const value = {
    user: session?.user || null,
    token: session?.token || null,
    isAdmin: session?.user?.role === 'ADMIN',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
