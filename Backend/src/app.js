const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

const allowedOrigins = [
    "http://localhost:5173",
    "https://preppulse-ai.vercel.app",
    "https://preppulse-ai-nine.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        if (
            !origin || 
            allowedOrigins.includes(origin) || 
            /\.vercel\.app$/.test(origin) || 
            process.env.NODE_ENV !== "production"
        ) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "preppulse-ai-api", timestamp: new Date().toISOString() })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app