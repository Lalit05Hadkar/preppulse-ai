import React from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import './Navbar.scss'

const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    return (
        <header className="preppulse-navbar">
            <div className="navbar-container">
                {/* Brand Logo & Name */}
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 15L8.5 7L13 14L16.5 9L20 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="20" cy="15" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">PrepPulse <span className="gradient-accent">AI</span></span>
                        <span className="brand-badge">Pro</span>
                    </div>
                </Link>

                {/* Center / Navigation items */}
                <nav className="navbar-nav">
                    <Link to="/" className="nav-link active">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Workspace
                    </Link>
                    <a href="https://github.com/Lalit05Hadkar" target="_blank" rel="noreferrer" className="nav-link nav-github">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Portfolio
                    </a>
                </nav>

                {/* Right / User & Actions */}
                <div className="navbar-actions">
                    {user ? (
                        <div className="user-profile-menu">
                            <div className="user-badge" title={user.email}>
                                <div className="user-avatar">
                                    {(user.username || user.email || 'U')[0].toUpperCase()}
                                </div>
                                <span className="user-name">{user.username || user.email.split('@')[0]}</span>
                            </div>
                            <button onClick={onLogout} className="logout-btn" title="Sign out">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-signin">Sign In</Link>
                            <Link to="/register" className="btn-signup">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
