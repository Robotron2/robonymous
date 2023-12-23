const _ = require("lodash")
const { User, Message } = require("../models/userModel")

const postAnonymousController = async (req, res) => {
	const { username } = req.params
	const { content } = req.body

	try {
		if (!content) {
			throw Error("You can't send empty messages")
		}
		const anonymousMessage = new Message({
			content,
			_id: Math.floor(Math.random() * 84600),
		})

		const user = await User.findOne({ username: _.toLower(username) })
		// User.find({ username }, { roll: 1, _id: 0 }) to select fields
		if (!user) {
			throw Error("User not found!")
		}

		user.inbox.push(anonymousMessage)

		const updateInbox = await user.save()

		if (updateInbox) {
			res.status(201).json({
				success: true,
				message: "Anonymous created successfully.",
			})
		}
	} catch (error) {
		// console.log(error)
		return res.status(500).json({
			error: error.message,
			success: false,
		})
	}
}

module.exports = {
	postAnonymousController,
}
