const { Schema, model } = require("mongoose")

const messageSchema = new Schema(
	{
		content: { type: String, required: true },
		_id: { type: Number, required: true },
	},
	{ timestamps: false }
)

const userSchema = new Schema(
	{
		username: { type: String, required: true },
		email: { type: String, unique: true, sparse: true },
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
