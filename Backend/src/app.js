const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const mongoose = require("mongoose")

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
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}))

app.use(express.json())
app.use(cookieParser())

// Health check endpoint with diagnostic state
app.get("/api/health", (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"]
    res.status(200).json({ 
        status: "ok", 
        service: "preppulse-ai-api",
        dbStatus: states[mongoose.connection.readyState] || "unknown",
        dbState: mongoose.connection.readyState,
        hasMongoUri: Boolean(process.env.MONGO_URI),
        hasGeminiKey: Boolean(process.env.GOOGLE_GENAI_API_KEY),
        hasJwtSecret: Boolean(process.env.JWT_SECRET),
        timestamp: new Date().toISOString() 
    })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app