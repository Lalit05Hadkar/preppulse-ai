import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams, Link } from 'react-router'
import Navbar from '../../../components/Navbar.jsx'

const NAV_ITEMS = [
    { 
        id: 'technical', 
        label: 'Technical Questions', 
        icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) 
    },
    { 
        id: 'behavioral', 
        label: 'Behavioral Questions', 
        icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) 
    },
    { 
        id: 'roadmap', 
        label: 'Preparation Road Map', 
        icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) 
    },
]

// ── Interactive Question Card with Mock Practice Mode ────────────────────────
const QuestionCard = ({ item, index, onEvaluateAnswer }) => {
    const [ open, setOpen ] = useState(index === 0)
    const [ isPracticing, setIsPracticing ] = useState(false)
    const [ userAnswer, setUserAnswer ] = useState("")
    const [ evaluating, setEvaluating ] = useState(false)
    const [ evaluation, setEvaluation ] = useState(null)
    const [ evalError, setEvalError ] = useState("")
    const [ copied, setCopied ] = useState(false)

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmitPractice = async () => {
        if (!userAnswer.trim()) return
        setEvaluating(true)
        setEvalError("")
        try {
            const result = await onEvaluateAnswer({
                question: item.question,
                intention: item.intention,
                modelAnswer: item.answer,
                userAnswer
            })
            setEvaluation(result)
        } catch (err) {
            console.error(err)
            setEvalError("Could not evaluate answer. Please verify network and API connection.")
        } finally {
            setEvaluating(false)
        }
    }

    return (
        <div className={`q-card ${open ? 'q-card--expanded' : ''}`}>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <div className="q-card__actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                        type="button"
                        className="copy-btn" 
                        title="Copy question text"
                        onClick={() => handleCopy(item.question)}
                    >
                        {copied ? 'Copied!' : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        )}
                    </button>
                    <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                    </span>
                </div>
            </div>

            {open && (
                <div className='q-card__body'>
                    {/* Intention Section */}
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Interviewer Intention</span>
                        <p>{item.intention}</p>
                    </div>

                    {/* Model Answer Section */}
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Target Model Answer</span>
                        <p>{item.answer}</p>
                    </div>

                    {/* Interactive Practice Mode Toggle */}
                    <div className="practice-trigger-wrap">
                        <button 
                            type="button" 
                            className={`practice-toggle-btn ${isPracticing ? 'active' : ''}`}
                            onClick={() => setIsPracticing(!isPracticing)}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                            {isPracticing ? 'Close Practice Mode' : 'Practice Answering with AI Coach'}
                        </button>
                    </div>

                    {/* Practice Drawer */}
                    {isPracticing && (
                        <div className="practice-box">
                            <div className="practice-box__header">
                                <h4>Interactive Mock Practice</h4>
                                <span className="coach-badge">Powered by Gemini 3 Flash</span>
                            </div>
                            <p className="practice-prompt">Type your answer or outline your key talking points below as if answering in a real interview:</p>
                            
                            <textarea 
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Example: In my previous role at ..., we tackled this by designing a distributed architecture with..."
                                className="practice-textarea"
                                rows={4}
                            />

                            <div className="practice-footer">
                                <span className="practice-hint">Be specific, cite concrete metrics, and explain trade-offs.</span>
                                <button 
                                    type="button"
                                    onClick={handleSubmitPractice}
                                    disabled={evaluating || !userAnswer.trim()}
                                    className="evaluate-btn"
                                >
                                    {evaluating ? (
                                        <>
                                            <span className="btn-spinner" />
                                            Analyzing Answer...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="5 3 19 12 5 21 5 3"/>
                                            </svg>
                                            Evaluate My Answer
                                        </>
                                    )}
                                </button>
                            </div>

                            {evalError && (
                                <div className="eval-error">{evalError}</div>
                            )}

                            {/* Evaluation Results */}
                            {evaluation && (
                                <div className="evaluation-card">
                                    <div className="eval-header">
                                        <div className="eval-score-wrap">
                                            <span className="eval-score-label">AI Coach Score</span>
                                            <span className={`eval-score-pill ${evaluation.score >= 80 ? 'high' : evaluation.score >= 60 ? 'mid' : 'low'}`}>
                                                {evaluation.score} / 100
                                            </span>
                                        </div>
                                        <p className="eval-summary">{evaluation.summary}</p>
                                    </div>

                                    {evaluation.strengths && evaluation.strengths.length > 0 && (
                                        <div className="eval-group">
                                            <h5>Key Strengths</h5>
                                            <ul>
                                                {evaluation.strengths.map((s, i) => (
                                                    <li key={i}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {evaluation.improvements && evaluation.improvements.length > 0 && (
                                        <div className="eval-group">
                                            <h5>Recommended Improvements</h5>
                                            <ul>
                                                {evaluation.improvements.map((imp, i) => (
                                                    <li key={i}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                        <span>{imp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {evaluation.improvedVersion && (
                                        <div className="eval-group improved-quote">
                                            <h5>Polished Exemplary Answer</h5>
                                            <p>{evaluation.improvedVersion}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Roadmap Day Component ────────────────────────────────────────────────────
const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    <span>{task}</span>
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Interview Component ─────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf, evaluateAnswer } = useInterview()
    const { interviewId } = useParams()
    const [ downloadingPdf, setDownloadingPdf ] = useState(false)

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    const handleDownloadResume = async () => {
        setDownloadingPdf(true)
        try {
            await getResumePdf(interviewId)
        } finally {
            setDownloadingPdf(false)
        }
    }

    if (loading || !report) {
        return (
            <div className='interview-page-container'>
                <Navbar />
                <main className='loading-screen'>
                    <div className="loading-card">
                        <div className="spinner-ring" />
                        <h2>Loading Interview Strategy</h2>
                        <p>Retrieving technical roadmap, questions, and match score metrics...</p>
                    </div>
                </main>
            </div>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page-container'>
            <Navbar />
            <div className='interview-page'>
                <div className='interview-layout'>

                    {/* ── Left Nav ── */}
                    <nav className='interview-nav'>
                        <div className="nav-content">
                            <div className="nav-top-meta">
                                <Link to="/" className="back-link">
                                    &larr; Back to Workspace
                                </Link>
                                <p className='interview-nav__label'>Sections</p>
                            </div>
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className='interview-nav__icon'>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="nav-bottom-actions">
                            <button
                                type="button"
                                onClick={handleDownloadResume}
                                disabled={downloadingPdf}
                                className='button primary-button download-resume-btn' 
                            >
                                {downloadingPdf ? (
                                    <>
                                        <span className="btn-spinner" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <svg height={"1rem"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 16l4-5h-3V4h-2v7H8l4 5zm-8 4h16v-2H4v2z"/>
                                        </svg>
                                        Download ATS Resume
                                    </>
                                )}
                            </button>
                        </div>
                    </nav>

                    <div className='interview-divider' />

                    {/* ── Center Content ── */}
                    <main className='interview-content'>
                        {/* Title bar */}
                        <div className="interview-title-bar">
                            <div>
                                <span className="role-badge">Target Role Strategy</span>
                                <h1 className="role-title">{report.title || 'Technical Candidate Strategy Plan'}</h1>
                            </div>
                        </div>

                        {activeNav === 'technical' && (
                            <section>
                                <div className='content-header'>
                                    <h2>Technical Interview Questions</h2>
                                    <span className='content-header__count'>{report.technicalQuestions?.length || 0} Questions Prepared</span>
                                </div>
                                <div className='q-list'>
                                    {report.technicalQuestions?.map((q, i) => (
                                        <QuestionCard 
                                            key={i} 
                                            item={q} 
                                            index={i} 
                                            onEvaluateAnswer={evaluateAnswer}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'behavioral' && (
                            <section>
                                <div className='content-header'>
                                    <h2>Behavioral &amp; Situational Questions</h2>
                                    <span className='content-header__count'>{report.behavioralQuestions?.length || 0} Questions Prepared</span>
                                </div>
                                <div className='q-list'>
                                    {report.behavioralQuestions?.map((q, i) => (
                                        <QuestionCard 
                                            key={i} 
                                            item={q} 
                                            index={i} 
                                            onEvaluateAnswer={evaluateAnswer}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'roadmap' && (
                            <section>
                                <div className='content-header'>
                                    <h2>Targeted Preparation Roadmap</h2>
                                    <span className='content-header__count'>{report.preparationPlan?.length || 0}-Day Structured Plan</span>
                                </div>
                                <div className='roadmap-list'>
                                    {report.preparationPlan?.map((day) => (
                                        <RoadMapDay key={day.day} day={day} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    <div className='interview-divider' />

                    {/* ── Right Sidebar ── */}
                    <aside className='interview-sidebar'>

                        {/* Match Score */}
                        <div className='match-score'>
                            <p className='match-score__label'>Profile Match Score</p>
                            <div className={`match-score__ring ${scoreColor}`}>
                                <span className='match-score__value'>{report.matchScore}</span>
                                <span className='match-score__pct'>%</span>
                            </div>
                            <p className='match-score__sub'>
                                {report.matchScore >= 80 ? 'High alignment with role requirements' : 
                                 report.matchScore >= 60 ? 'Moderate match — address key gaps below' : 
                                 'Significant preparation needed for this level'}
                            </p>
                        </div>

                        <div className='sidebar-divider' />

                        {/* Skill Gaps */}
                        <div className='skill-gaps'>
                            <p className='skill-gaps__label'>Identified Skill Gaps</p>
                            <div className='skill-gaps__list'>
                                {report.skillGaps?.map((gap, i) => (
                                    <div key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                        <span className="skill-name">{gap.skill}</span>
                                        <span className="severity-badge">{gap.severity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Interview