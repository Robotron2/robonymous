const { Schema, model } = require("mongoose")

const messageSchema = new Schema(
	{
		content: { type: String, required: true },
	},
	{ timestamps: true }
)

const userSchema = new Schema(
	{
		username: { type: String, required: true },
		email: { type: String },
		password: { type: String, required: true },
		inbox: [messageSchema],
		createdAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
)

const Message = model("message", messageSchema)
const User = model("user", userSchema)

module.exports = {
	User,
	Message,
}
