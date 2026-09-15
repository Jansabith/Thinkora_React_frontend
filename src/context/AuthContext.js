import { createContext } from 'react'

// Shared "who is logged in" data. AuthProvider fills it; useAuth() reads it.
export const AuthContext = createContext(null)
