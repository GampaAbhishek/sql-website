'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinDate: string
  queriesSolved: number
  challengesCompleted: number
  currentStreak: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (name: string, email: string, password: string) => Promise<boolean>
  queryCount: number
  incrementQueryCount: () => void
  resetQueryCount: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [queryCount, setQueryCount] = useState(0)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('sql-hub-user')
    const savedQueryCount = localStorage.getItem('sql-hub-query-count')
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('sql-hub-user')
      }
    }
    
    if (savedQueryCount) {
      setQueryCount(parseInt(savedQueryCount, 10))
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call with demo user
    const demoUser: User = {
      id: '1',
      name: 'Demo User',
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('Demo User')}&background=3b82f6&color=fff`,
      joinDate: new Date().toISOString(),
      queriesSolved: 42,
      challengesCompleted: 8,
      currentStreak: 5
    }
    
    setUser(demoUser)
    localStorage.setItem('sql-hub-user', JSON.stringify(demoUser))
    setQueryCount(0)
    localStorage.setItem('sql-hub-query-count', '0')
    return true
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call with new user
    const newUser: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
      joinDate: new Date().toISOString(),
      queriesSolved: 0,
      challengesCompleted: 0,
      currentStreak: 0
    }
    
    setUser(newUser)
    localStorage.setItem('sql-hub-user', JSON.stringify(newUser))
    setQueryCount(0)
    localStorage.setItem('sql-hub-query-count', '0')
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sql-hub-user')
    localStorage.removeItem('sql-hub-query-count')
    localStorage.removeItem('sql-playground-query')
    setQueryCount(0)
  }

  const incrementQueryCount = () => {
    const newCount = queryCount + 1
    setQueryCount(newCount)
    localStorage.setItem('sql-hub-query-count', newCount.toString())
  }

  const resetQueryCount = () => {
    setQueryCount(0)
    localStorage.setItem('sql-hub-query-count', '0')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        queryCount,
        incrementQueryCount,
        resetQueryCount
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
