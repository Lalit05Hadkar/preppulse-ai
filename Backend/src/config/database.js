const mongoose = require("mongoose")
const dns = require("dns")

// Ensure Node.js resolves SRV records via reliable public DNS on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"])

async function connectToDB() {

    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log("Connected to Database")
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = connectToDB