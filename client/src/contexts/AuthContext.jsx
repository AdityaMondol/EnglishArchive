import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { authApi } from '../lib/api'

const AuthContext = createContext({
    user: null,
    profile: null,
    isEditor: false,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    deleteAccount: async () => { },
    updateProfile: async () => { },
    refreshProfile: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isEditor, setIsEditor] = useState(false)
    const [loading, setLoading] = useState(true)

    const refreshProfile = async () => {
        try {
            const data = await authApi.getMe()
            setIsEditor(data.isEditor || false)
            setProfile(data.user)
        } catch (error) {
            console.error('Failed to refresh profile:', error)
            setIsEditor(false)
            setProfile(null)
        }
    }

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setLoading(false)
            return
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session) {
                sessionStorage.setItem('supabase-session', JSON.stringify(session))
                refreshProfile()
            }
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                if (session) {
                    sessionStorage.setItem('supabase-session', JSON.stringify(session))
                    await refreshProfile()
                } else {
                    sessionStorage.removeItem('supabase-session')
                    setIsEditor(false)
                    setProfile(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Authentication is not configured')
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return data
    }

    const signUp = async (email, password, name = '') => {
        if (!isSupabaseConfigured()) {
            throw new Error('Authentication is not configured')
        }

        // Sign up with email confirmation disabled option
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                },
                emailRedirectTo: window.location.origin
            }
        })

        if (error) throw error

        // If user was created, make them an editor
        if (data.user) {
            try {
                await fetch('/api/auth/make-editor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: data.user.id })
                })
            } catch (e) {
                console.error('Failed to set editor status:', e)
            }
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
            // Email confirmation required - throw a specific error
            throw new Error('Please check your email to confirm your account, then sign in.')
        }

        return data
    }

    const signOut = async () => {
        if (!isSupabaseConfigured()) return

        const { error } = await supabase.auth.signOut()
        if (error) throw error

        sessionStorage.removeItem('supabase-session')
        setUser(null)
        setProfile(null)
        setIsEditor(false)
    }

    const updateProfile = async (name, avatar) => {
        const session = sessionStorage.getItem('supabase-session')
        const token = session ? JSON.parse(session).access_token : null

        if (!token) throw new Error('No session')

        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, avatar })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to update profile')
        }

        const data = await response.json()
        setProfile(data.user)
        return data.user
    }

    const deleteAccount = async () => {
        if (!isSupabaseConfigured() || !user) return

        const session = sessionStorage.getItem('supabase-session')
        const token = session ? JSON.parse(session).access_token : null

        if (!token) throw new Error('No session')

        const response = await fetch('/api/auth/delete-account', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to delete account')
        }

        sessionStorage.removeItem('supabase-session')
        setUser(null)
        setProfile(null)
        setIsEditor(false)
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            isEditor,
            loading,
            signIn,
            signUp,
            signOut,
            deleteAccount,
            updateProfile,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}
