import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, evaluatePracticeAnswerApi } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        try {
            const response = await generateResumePdf({ interviewReportId })
            
            // Check blob type
            const blobType = response?.type || ""

            if (blobType.includes("json")) {
                const text = await response.text()
                let parsed = {}
                try { parsed = JSON.parse(text) } catch (_) {}
                throw new Error(parsed.message || "Failed to generate resume")
            }

            if (blobType.includes("html")) {
                const htmlText = await response.text()

                // Trigger native browser print / Save as PDF via hidden iframe (not blocked by popup blockers)
                try {
                    const iframe = document.createElement("iframe")
                    iframe.style.position = "fixed"
                    iframe.style.right = "0"
                    iframe.style.bottom = "0"
                    iframe.style.width = "0"
                    iframe.style.height = "0"
                    iframe.style.border = "0"
                    document.body.appendChild(iframe)

                    iframe.contentDocument.open()
                    iframe.contentDocument.write(htmlText)
                    iframe.contentDocument.close()

                    setTimeout(() => {
                        try {
                            iframe.contentWindow.focus()
                            iframe.contentWindow.print()
                        } catch (_) {}
                        setTimeout(() => {
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe)
                            }
                        }, 2500)
                    }, 400)
                } catch (_) {}

                // Also save the executive resume file for offline viewing
                const blob = new Blob([ htmlText ], { type: "text/html" })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", `resume_${interviewReportId}.html`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } else {
                // PDF Binary Download
                const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", `resume_${interviewReportId}.pdf`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }
        }
        catch (error) {
            console.error("Resume generation error:", error)
            throw error
        }
    }

    const evaluateAnswer = async ({ question, intention, modelAnswer, userAnswer }) => {
        const response = await evaluatePracticeAnswerApi({ question, intention, modelAnswer, userAnswer })
        return response.evaluation
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, evaluateAnswer }

}