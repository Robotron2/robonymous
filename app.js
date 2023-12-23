//config env
require("dotenv").config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const {connectDB} = require("./config/db")


//database connect
connectDB()

const app = express()

app.use(cors())

app.use(express.json())

app.use(morgan("dev"))


// const authRoute = require("./server/routes/authRoute")

// API routes
// app.use("/api/auth", authRoute)


const port = process.env.PORT


app.listen(port, () => {
	console.log("App is running on port: " + port)
})

