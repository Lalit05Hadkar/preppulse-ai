import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { user, loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)
    const [ error, setError ] = useState("")

    useEffect(() => {
        if (!loading && user) {
            navigate('/', { replace: true })
        }
    }, [user, loading, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) return
        setError("")
        setSubmitting(true)
        try {
            const loggedInUser = await handleLogin({ email, password })
            if (loggedInUser) {
                navigate('/')
            }
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message || err.response?.data?.error || "Invalid email or password. Please try again."
            setError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const hasStoredToken = (() => {
        try {
            return Boolean(localStorage.getItem("token"))
        } catch {
            return false
        }
    })()

    if (loading && hasStoredToken) {
        return (
            <main className="auth-page">
                <div className="spinner-ring" />
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 15L8.5 7L13 14L16.5 9L20 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="20" cy="15" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your interview preparation on PrepPulse AI</p>
                </div>

                {error && (
                    <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" 
                            id="email" 
                            name='email' 
                            placeholder='name@example.com' 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" 
                            id="password" 
                            name='password' 
                            placeholder='••••••••' 
                            required 
                        />
                    </div>
                    <button disabled={submitting} type="submit" className='button primary-button auth-submit-btn'>
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create an account</Link>
                </div>
            </div>
        </main>
    )
}

export default Login