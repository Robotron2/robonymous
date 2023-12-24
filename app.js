//config env
require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const { connectDB } = require("./config/db")

//database connect
connectDB()

const app = express()

app.use(cors())

app.use(express.json())

app.use(morgan("dev"))

const authRoute = require("./routes/authRoute")
const messageRoute = require("./routes/messageRoute")

// API routes
app.use("/api/auth", authRoute)
app.use("/api/msgs", messageRoute)

const port = process.env.PORT || 4000

app.listen(port, () => {
	console.log("App is running on port: " + port)
})
