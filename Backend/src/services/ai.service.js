const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



const fs = require("fs")

function findChromeExecutable() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH
    }

    const candidatePaths = [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser"
    ]

    for (const p of candidatePaths) {
        try {
            if (fs.existsSync(p)) {
                return p
            }
        } catch (_) {}
    }
    return undefined
}

async function generatePdfFromHtml(htmlContent) {
    const executablePath = findChromeExecutable()
    const launchOptions = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=none'
        ]
    }

    if (executablePath) {
        launchOptions.executablePath = executablePath
    }

    const browser = await puppeteer.launch(launchOptions)
    try {
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 15000 })

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm"
            }
        })

        return pdfBuffer
    } finally {
        await browser.close().catch(() => {})
    }
}

function wrapInExecutiveTemplate(htmlContent) {
    let innerBody = htmlContent
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    if (bodyMatch) {
        innerBody = bodyMatch[1]
    } else {
        innerBody = innerBody
            .replace(/<!DOCTYPE[^>]*>/gi, '')
            .replace(/<\/?html[^>]*>/gi, '')
            .replace(/<head[\s\S]*?<\/head>/gi, '')
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ATS Tailored Resume</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0f172a;
            --secondary: #334155;
            --muted: #64748b;
            --border: #e2e8f0;
            --accent: #4f46e5;
            --accent-hover: #4338ca;
            --page-bg: #f8fafc;
            --sheet-bg: #ffffff;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--page-bg);
            color: var(--primary);
            line-height: 1.5;
            font-size: 10pt;
            -webkit-font-smoothing: antialiased;
            padding: 24px 16px;
        }

        /* Top Action Floating Bar */
        .resume-action-bar {
            max-width: 820px;
            margin: 0 auto 20px auto;
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }

        .action-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: var(--secondary);
            font-weight: 500;
        }

        .action-badge {
            background: #e0e7ff;
            color: var(--accent);
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .btn-print {
            background: var(--accent);
            color: #ffffff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .btn-print:hover {
            background: var(--accent-hover);
        }

        /* The Paper Sheet */
        .resume-sheet {
            max-width: 820px;
            margin: 0 auto;
            background: var(--sheet-bg);
            padding: 44px 52px;
            border-radius: 4px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            border: 1px solid var(--border);
        }

        /* Resume Content Formatting */
        .header, header {
            text-align: center;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 12px;
            margin-bottom: 18px;
        }

        h1 {
            font-size: 22pt;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: var(--primary);
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .contact-info, .contact {
            font-size: 9pt;
            color: var(--secondary);
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 6px 14px;
            margin-top: 6px;
        }

        .contact-info a, .contact a {
            color: var(--secondary);
            text-decoration: none;
            border-bottom: 1px dotted var(--muted);
        }

        .section, section {
            margin-bottom: 16px;
        }

        .section-title, h2 {
            font-size: 11pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--primary);
            border-bottom: 1.5px solid var(--border);
            padding-bottom: 4px;
            margin-bottom: 10px;
        }

        p {
            font-size: 9.5pt;
            color: var(--secondary);
            line-height: 1.45;
            margin-bottom: 6px;
            text-align: justify;
        }

        ul {
            padding-left: 20px;
            margin: 4px 0 8px 0;
        }

        li {
            font-size: 9pt;
            color: var(--secondary);
            line-height: 1.4;
            margin-bottom: 3px;
        }

        .project, .experience-item, .item {
            margin-bottom: 12px;
        }

        .project-header, .experience-header, .education-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-weight: 700;
            font-size: 10pt;
            color: var(--primary);
        }

        .project-meta {
            font-size: 8.5pt;
            color: var(--muted);
            font-style: italic;
            margin-top: 1px;
            margin-bottom: 4px;
        }

        .skills-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 5px;
        }

        .skill-item {
            font-size: 9pt;
            color: var(--secondary);
            line-height: 1.4;
        }

        .skill-item strong {
            color: var(--primary);
            font-weight: 600;
        }

        .certification-item {
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            margin-bottom: 3px;
            color: var(--secondary);
        }

        /* Print Settings */
        @page {
            size: A4;
            margin: 12mm 15mm;
        }

        @media print {
            body {
                background: #ffffff !important;
                padding: 0 !important;
                color: #000000 !important;
            }

            .no-print, .resume-action-bar {
                display: none !important;
            }

            .resume-sheet {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                margin: 0 !important;
            }

            .section, .project, .item {
                page-break-inside: avoid;
            }

            a {
                color: #000000 !important;
                border: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="resume-action-bar no-print">
        <div class="action-info">
            <span class="action-badge">ATS Optimized</span>
            <span>PrepPulse AI Resume Engine</span>
        </div>
        <button class="btn-print" onclick="window.print()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Save as PDF / Print
        </button>
    </div>
    <div class="resume-sheet">
        ${innerBody}
    </div>
</body>
</html>`
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The semantic HTML body content of the resume, including header, summary, competencies, experience/projects, and education")
    })

    const prompt = `Generate a high-impact, professional, ATS-optimized executive resume for a candidate tailored to this target job description:
Candidate Resume Details: ${resume || "N/A"}
Candidate Self Description: ${selfDescription || "N/A"}
Target Job Description: ${jobDescription}

Key Requirements:
1. Provide a single JSON field "html" containing clean, semantic HTML sections (use <div class="header">, <h1> for Name, <div class="contact-info">, <div class="section"><div class="section-title">Section Name</div>...</div>).
2. Professional structure:
   - Header with Candidate Name, location, phone, email, and LinkedIn/GitHub links.
   - Professional Summary: 3-4 lines highlighting core value proposition aligned with target role.
   - Core Technical Competencies: clean categories (e.g. Languages & Frameworks, Cloud & DevOps, Machine Learning & AI, Tools & Methodologies).
   - Key Projects & Professional Experience: 3-4 projects with title, tech stack meta line, and 3 high-impact quantified bullet points starting with strong action verbs.
   - Certifications & Education with degree, university, graduation year, and CGPA.
3. Keep the content concise, ATS-readable, and formatted to fit cleanly on A4 paper.`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    const jsonContent = JSON.parse(response.text)
    const formattedHtml = wrapInExecutiveTemplate(jsonContent.html || "")

    // Try Puppeteer PDF rendering
    try {
        const pdfBuffer = await generatePdfFromHtml(formattedHtml)
        return {
            type: "pdf",
            data: pdfBuffer,
            html: formattedHtml
        }
    } catch (err) {
        console.warn("Puppeteer PDF generation unavailable in current environment, falling back to styled HTML resume:", err.message)
        return {
            type: "html",
            data: formattedHtml,
            html: formattedHtml
        }
    }
}

const practiceEvaluationSchema = z.object({
    score: z.number().describe("Candidate answer score from 0 to 100 based on clarity, depth, accuracy, and relevance to the question intention"),
    summary: z.string().describe("Concise evaluation feedback summarizing the candidate's performance"),
    strengths: z.array(z.string()).describe("2 to 4 key strengths demonstrated in the candidate's answer"),
    improvements: z.array(z.string()).describe("2 to 4 actionable suggestions to elevate the response"),
    improvedVersion: z.string().describe("A refined, high-impact answer demonstrating how an ideal candidate would articulate the points clearly")
})

async function evaluatePracticeAnswer({ question, intention, modelAnswer, userAnswer }) {
    const prompt = `You are an executive technical and behavioral interview coach at a top-tier company.
Evaluate the following candidate's practice response:

Question: ${question}
Interviewer Intention: ${intention}
Reference Model Answer: ${modelAnswer}
Candidate's User Answer: ${userAnswer}

Provide an honest, constructive critique, identifying specific strengths, improvement areas, an estimated score (0-100), and an improved version.`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(practiceEvaluationSchema),
        }
    })

    return JSON.parse(response.text)
}

module.exports = { generateInterviewReport, generateResumePdf, evaluatePracticeAnswer }