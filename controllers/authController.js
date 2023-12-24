const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")
const _ = require("lodash")
const nodemailer = require("nodemailer")
const crypto = require("crypto")

const { User } = require("../models/userModel")

const saltRounds = 10

const devMail = process.env.USER_MAIL
const pass = process.env.USER_PASS
// const host = process.env.SMTP
// const port = process.env.MAIL_PORT

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: devMail,
		pass,
	},
})

//Mailtrap SMTP method
// const transporter = nodemailer.createTransport({
// 	host,
// 	port,
// 	auth: {
// 		user: devMail,
// 		pass,
// 	},
// })

const generateRandomString = (length) => {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	let result = ""
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}

const generateUniqueUsernames = async (original, suggestions) => {
	const uniqueUsernames = []
	for (let i = 0; i < suggestions; i++) {
		let username = original
		while (true) {
			const existingUser = await User.findOne({ username })
			if (!existingUser) {
				uniqueUsernames.push(_.upperFirst(username))
				break
			}
			const randomSuffix = generateRandomString(5)
			username = `${_.upperFirst(original)}_${randomSuffix}`
		}
	}
	return uniqueUsernames
}

const registerController = async (req, res) => {
	try {
		const { username, password, email } = req.body

		const lowercasedUsername = _.toLower(username)

		const existingUser = await User.findOne({ username: lowercasedUsername })

		if (existingUser) {
			const suggestions = 3
			const uniqueUsernames = await generateUniqueUsernames(
				lowercasedUsername,
				suggestions
			)
			return res.status(403).send({
				success: false,
				message: "Username taken.",
				suggesedUsernames: uniqueUsernames,
			})
		}

		bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
			const newUser = new User({
				username: lowercasedUsername,
				password: hashedPassword,
				email: email ? email : null,
			})

			await newUser.save()
			res.status(201).json({
				success: true,
				message: "User registered successfully",
				user: {
					username: newUser.username,
					email: newUser.email,
					id: newUser._id,
				},
			})
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error" })
	}
}

const loginController = async (req, res) => {
	try {
		const { username, password } = req.body
		const lowercasedUsername = _.toLower(username)
		const user = await User.findOne({ username: lowercasedUsername })
		if (user) {
			bcrypt.compare(password, user.password, async (err, result) => {
				if (!result) {
					return res.status(403).send({
						success: false,
						message: "Invalid Password.",
					})
				} else {
					// console.log(user.toJSON())
					let token = JWT.sign(
						{ _id: user._id, username: user.username, email: user.email },
						process.env.JWT_SECRET,
						{
							expiresIn: "1d",
						}
					)
					return res.status(200).send({
						success: true,
						message: "Logged in successfully",
						user: {
							username: user.username,
							email: user.email,
						},
						token,
					})
				}
			})
		} else {
			return res.status(404).send({
				success: false,
				message: "You're not registered.",
			})
		}
	} catch (error) {
		console.log(error)
		res.status(500).send({
			success: false,
			message: "Error in login",
			error,
		})
	}
}

const updateEmailController = async (req, res) => {
	try {
		const { _id } = req.user
		const { email } = req.body
		if (!email) {
			return res
				.status(403)
				.json({ error: "Email must be provided", success: false })
		}
		const formattedEmail = _.toLower(email)
		const user = await User.findById(_id, {
			createdAt: 0,
			updatedAt: 0,
			password: 0,
		})

		if (!user) {
			return res.status(404).json({ error: "User not found", success: false })
		}

		const match = await User.findOne({ email: formattedEmail })
		if (match) {
			return res.status(403).json({
				success: false,
				message: "Email exists.",
			})
		}

		user.email = formattedEmail
		await user.save()

		res
			.status(200)
			.json({ success: true, message: "Email updated successfully", user })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error" })
	}
}

const forgotPasswordController = async (req, res) => {
	try {
		const { email } = req.body

		if (!email) {
			return res
				.status(400)
				.json({ error: "Email must be provided", success: false })
		}
		const user = await User.findOne({ email })

		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const resetToken = crypto.randomBytes(20).toString("hex")

		user.resetToken = resetToken
		//user.resetTokenExpiry = Date.now() + 3600000 //Token expires in 1 hour
		//user.resetTokenExpiry = Date.now() + 60000 // Token expires in 1 minute
		user.resetTokenExpiry = Date.now() + 300000 // Token expires in 5 minute

		await user.save()

		const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${resetToken}`
		const mailOptions = {
			from: devMail,
			to: email,
			subject: "Password Reset",
			html: `
            <p>Click the following link to reset your password: ${resetLink} . \n This link expires in 1 minute</p>
            
            `,
		}

		const sendMail = await transporter.sendMail(mailOptions)
		// console.log(sendMail)

		return res
			.status(200)
			.json({ message: "Reset link sent to your email", success: true })
	} catch (error) {
		console.error(error)
		res
			.status(500)
			.json({ error: "Internal Server Error", message: error.message })
	}
}

const resetPasswordController = async (req, res) => {
	try {
		const { token } = req.query
		const { newPassword } = req.body

		if (!token) {
			return res.status(400).json({
				success: false,
				message: "Token must be provided.",
			})
		}

		if (!newPassword) {
			return res.status(400).json({
				success: false,
				message: "New Password must be provided.",
			})
		}
		const user = await User.findOne({
			resetToken: token,
			resetTokenExpiry: { $gt: Date.now() },
		})

		if (!user) {
			return res.status(400).json({ error: "Invalid or expired token" })
		}

		bcrypt.hash(newPassword, saltRounds, async (err, hashedPassword) => {
			user.password = hashedPassword
			await user.save()

			return res.status(201).json({
				success: true,
				message: "Password changed successfully",
			})
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error" })
	}
}

module.exports = {
	registerController,
	loginController,
	updateEmailController,
	forgotPasswordController,
	resetPasswordController,
}
