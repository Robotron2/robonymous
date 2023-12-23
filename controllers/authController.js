const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")
const _ = require("lodash")
const { User } = require("../models/userModel")

const saltRounds = 10

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

const forgotPasswordController = async (req, res) => {
	//
}

module.exports = {
	registerController,
	loginController,
	forgotPasswordController,
}
