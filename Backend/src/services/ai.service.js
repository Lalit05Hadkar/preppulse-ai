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

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate a high-impact, professional, ATS-optimized resume for a candidate tailored to this target job description:
Resume Background: ${resume || "N/A"}
Self Description: ${selfDescription || "N/A"}
Target Job Description: ${jobDescription}

Key Requirements:
1. Provide a single JSON field "html" containing complete, standalone HTML (including <!DOCTYPE html>, <html>, <head>, <style>, and <body>).
2. The HTML must have embedded CSS with print-optimized styles (@page { size: A4; margin: 15mm; } @media print { body { padding: 0; } }).
3. Clean modern typography (Inter/Arial/Helvetica), clear hierarchy, contact header, targeted summary, core technical competencies, professional experience with quantified impact bullet points, and education.
4. ATS friendly: semantic structure, standard section headers, no complex multi-column clipping.
5. High quality, polished, senior presentation.`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    const jsonContent = JSON.parse(response.text)
    let rawHtml = jsonContent.html || ""

    // Ensure print styles are included
    if (!rawHtml.includes("@page")) {
        const printStyles = `<style>@page { size: A4; margin: 15mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; } .no-print { display: none !important; } }</style>`
        if (rawHtml.includes("<head>")) {
            rawHtml = rawHtml.replace("<head>", `<head>${printStyles}`)
        } else {
            rawHtml = `${printStyles}${rawHtml}`
        }
    }

    // Try Puppeteer PDF rendering
    try {
        const pdfBuffer = await generatePdfFromHtml(rawHtml)
        return {
            type: "pdf",
            data: pdfBuffer,
            html: rawHtml
        }
    } catch (err) {
        console.warn("Puppeteer PDF generation unavailable in current environment, falling back to styled HTML resume:", err.message)
        return {
            type: "html",
            data: rawHtml,
            html: rawHtml
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