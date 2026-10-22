import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import Navbar from '../../../components/Navbar.jsx'

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ uploadedFileName, setUploadedFileName ] = useState("")
    const [ errorMessage, setErrorMessage ] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFileName(e.target.files[0].name)
        }
    }

    const handleGenerateReport = async () => {
        setErrorMessage("")
        const resumeFile = resumeInputRef.current?.files?.[0]

        if (!jobDescription.trim()) {
            setErrorMessage("Please enter a job description to generate your interview strategy.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            setErrorMessage("Please provide either your resume or a brief self-description.")
            return
        }

        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            } else {
                setErrorMessage("Unable to generate interview plan. Please verify backend service and API keys.")
            }
        } catch (err) {
            console.error(err)
            setErrorMessage("An unexpected error occurred while generating your plan. Please try again.")
        }
    }

    const fillSampleJob = () => {
        setJobDescription(`Senior Full-Stack Engineer at Stripe\nResponsibilities:\n- Design and implement scalable APIs and distributed payment infrastructure using Node.js, Express, and MongoDB.\n- Build responsive, accessible, and high-performance frontend interfaces using React, TypeScript, and modern CSS.\n- Optimize system latency, implement caching strategies, and maintain high code quality with automated pipelines.\nRequirements:\n- 3+ years of production experience in full-stack web application development.\n- Strong knowledge of RESTful API design, database modeling, and cloud deployments.\n- Solid understanding of microservices architecture, security best practices (JWT, OAuth), and performance profiling.`)
        setSelfDescription(`Full-stack software engineer with 3 years of hands-on experience building web applications with Node.js, React, Express, and MongoDB. Led frontend development, improved API response times through query indexing, and built custom ATS-friendly PDF generators. Proficient in JavaScript, Docker, and REST APIs.`)
    }

    if (loading) {
        return (
            <div className='home-page-container'>
                <Navbar />
                <main className='loading-screen'>
                    <div className="loading-card">
                        <div className="spinner-ring" />
                        <h2>Synthesizing Interview Strategy</h2>
                        <p>Gemini 3 Flash is analyzing requirements, generating behavioral &amp; technical questions, and mapping skill gaps...</p>
                        <span className="loading-timer">Typically takes 15-25 seconds</span>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className='home-page-container'>
            <Navbar />
            <div className='home-page'>

                {/* Hero Header */}
                <header className='page-header'>
                    <div className="header-pill">
                        <span className="pulse-dot" />
                        <span>AI-Powered Career &amp; Interview Engine</span>
                    </div>
                    <h1>Create Your Targeted <span className='highlight'>Interview Strategy</span></h1>
                    <p>Harness Google Gemini 3 Flash to dissect job specifications, identify competency gaps, and build your personalized preparation roadmap.</p>
                    
                    <div className="quick-actions">
                        <button type="button" onClick={fillSampleJob} className="demo-fill-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            Auto-Fill Sample Senior Engineer Role
                        </button>
                    </div>
                </header>

                {errorMessage && (
                    <div className="error-banner">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Main Card */}
                <div className='interview-card'>
                    <div className='interview-card__body'>

                        {/* Left Panel - Job Description */}
                        <div className='panel panel--left'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </span>
                                <h2>Target Job Description</h2>
                                <span className='badge badge--required'>Required</span>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => { setJobDescription(e.target.value) }}
                                className='panel__textarea'
                                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer requires proficiency in React, TypeScript, large-scale system design, and state management...'`}
                                maxLength={5000}
                            />
                            <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                        </div>

                        {/* Vertical Divider */}
                        <div className='panel-divider' />

                        {/* Right Panel - Profile */}
                        <div className='panel panel--right'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <h2>Your Profile &amp; Background</h2>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <label className='section-label'>
                                    Upload Resume
                                    <span className='badge badge--best'>Recommended</span>
                                </label>
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    {uploadedFileName ? (
                                        <div className="uploaded-file-info">
                                            <p className='dropzone__title file-selected'>{uploadedFileName}</p>
                                            <p className='dropzone__subtitle'>Click to select a different file</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                            <p className='dropzone__subtitle'>PDF format supported (Max 5MB)</p>
                                        </>
                                    )}
                                    <input 
                                        ref={resumeInputRef} 
                                        onChange={handleFileChange} 
                                        hidden 
                                        type='file' 
                                        id='resume' 
                                        name='resume' 
                                        accept='.pdf' 
                                    />
                                </label>
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'><span>OR</span></div>

                            {/* Quick Self-Description */}
                            <div className='self-description'>
                                <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                                <textarea
                                    value={selfDescription}
                                    onChange={(e) => { setSelfDescription(e.target.value) }}
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Summarize your years of experience, core tech stack, key projects, and strengths..."
                                />
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <span className='info-box__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#0f172a" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#0f172a" strokeWidth="2" /></svg>
                                </span>
                                <p>Either a <strong>Resume</strong> or <strong>Self Description</strong> is used to tailor questions and score your match.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className='interview-card__footer'>
                        <span className='footer-info'>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            AI Strategy Synthesis &bull; Approx 20s
                        </span>
                        <button
                            type="button"
                            onClick={handleGenerateReport}
                            className='generate-btn'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                            Generate Interview Strategy
                        </button>
                    </div>
                </div>

                {/* Recent Reports List */}
                {reports && reports.length > 0 && (
                    <section className='recent-reports'>
                        <div className="section-title-wrap">
                            <h2>My Generated Preparation Plans</h2>
                            <span className="reports-count">{reports.length} Plans</span>
                        </div>
                        <ul className='reports-list'>
                            {reports.map(rep => (
                                <li key={rep._id} className='report-item' onClick={() => navigate(`/interview/${rep._id}`)}>
                                    <div className="report-main">
                                        <h3>{rep.title || 'Target Role Preparation Plan'}</h3>
                                        <p className='report-meta'>Created {new Date(rep.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="report-right">
                                        <span className={`match-score ${rep.matchScore >= 80 ? 'score--high' : rep.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                            {rep.matchScore}% Match
                                        </span>
                                        <span className="open-arrow">&rarr;</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Page Footer */}
                <footer className='page-footer'>
                    <div className="footer-links">
                        <span>PrepPulse AI &bull; Built with Express, React 19, MongoDB &amp; Gemini 3 Flash</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Home