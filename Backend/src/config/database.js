const mongoose = require("mongoose")
const dns = require("dns")

// On Windows, set Google/Cloudflare DNS for SRV records resolution
if (process.platform === "win32") {
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"])
    } catch (e) {
        console.warn("Could not set custom DNS servers:", e.message)
    }
}

async function connectToDB() {
    try {
        if (!process.env.MONGO_URI) {
            console.error("CRITICAL: MONGO_URI is missing in process.env!")
            return
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000
        })

        console.log("Connected to Database")
    }
    catch (err) {
        console.error("Database connection error:", err.message)
    }
}

module.exports = connectToDB