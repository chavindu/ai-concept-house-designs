"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export interface User {
	id: string
	email: string
	full_name: string
	avatar_url?: string
	email_verified: boolean
	role: string
}

export interface AuthContextType {
	user: User | null
	loading: boolean
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
	register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
	logout: () => Promise<void>
	verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>
	forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
	resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>
	refreshToken: () => Promise<boolean>
	signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

interface AuthProviderProps {
	children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()
	const { data: session, status } = useSession()

	// Rely solely on NextAuth session for client auth state
	useEffect(() => {
		if (status === 'loading') {
			setLoading(true)
			return
		}

		if (session?.user) {
			const nextAuthUser: User = {
				id: session.user.id || '',
				email: session.user.email || '',
				full_name: session.user.name || session.user.email || '',
				avatar_url: (session.user as any).image || undefined,
				email_verified: true,
				role: (session.user as any).role || 'user',
			}
			setUser(nextAuthUser)
		} else {
			setUser(null)
		}
		setLoading(false)
	}, [session, status])

	const checkAuthStatus = useCallback(async () => {
		// Deprecated in favor of NextAuth session; keep for compatibility if called elsewhere
		return false
	}, [])

	const login = useCallback(async (email: string, password: string) => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (response.ok) {
				setUser(data.user)
				return { success: true }
			} else {
				return { success: false, error: data.error }
			}
		} catch (error) {
			console.error('Login error:', error)
			return { success: false, error: 'Login failed. Please try again.' }
		}
	}, [])

	const register = useCallback(async (email: string, password: string, fullName: string) => {
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ email, password, fullName }),
			})

			const data = await response.json()

			if (response.ok) {
				setUser(data.user)
				return { success: true }
			} else {
				return { success: false, error: data.error }
			}
		} catch (error) {
			console.error('Registration error:', error)
			return { success: false, error: 'Registration failed. Please try again.' }
		}
	}, [])

	const logout = useCallback(async () => {
		try {
			// If user is authenticated via NextAuth, use NextAuth signOut
			if (session) {
				await signOut({ callbackUrl: '/' })
			} else {
				await fetch('/api/auth/logout', {
					method: 'POST',
					credentials: 'include',
				})
			}
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			setUser(null)
			router.push('/')
		}
	}, [session, router])

	const verifyEmail = useCallback(async (token: string) => {
		try {
			const response = await fetch('/api/auth/verify-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token }),
			})

			const data = await response.json()

			if (response.ok) {
				setUser(prev => prev ? { ...prev, email_verified: true } : null)
				return { success: true }
			} else {
				return { success: false, error: data.error }
			}
		} catch (error) {
			console.error('Email verification error:', error)
			return { success: false, error: 'Email verification failed. Please try again.' }
		}
	}, [])

	const forgotPassword = useCallback(async (email: string) => {
		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			})

			const data = await response.json()

			if (response.ok) {
				return { success: true }
			} else {
				return { success: false, error: data.error }
			}
		} catch (error) {
			console.error('Forgot password error:', error)
			return { success: false, error: 'Failed to send password reset email. Please try again.' }
		}
	}, [])

	const resetPassword = useCallback(async (token: string, password: string) => {
		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, password }),
			})

			const data = await response.json()

			if (response.ok) {
				return { success: true }
			} else {
				return { success: false, error: data.error }
			}
		} catch (error) {
			console.error('Password reset error:', error)
			return { success: false, error: 'Password reset failed. Please try again.' }
		}
	}, [])

	const refreshToken = useCallback(async () => {
		// Deprecated; rely on NextAuth
		return false
	}, [])

	const signInWithGoogle = useCallback(async () => {
		try {
			const { signIn } = await import('next-auth/react')
			await signIn('google', { callbackUrl: '/' })
		} catch (error) {
			console.error('Google sign-in error:', error)
		}
	}, [])

	const value: AuthContextType = {
		user,
		loading,
		login,
		register,
		logout,
		verifyEmail,
		forgotPassword,
		resetPassword,
		refreshToken,
		signInWithGoogle,
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}
