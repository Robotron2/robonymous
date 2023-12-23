const JWT = require("jsonwebtoken")

const requireSignIn = async (req, res, next) => {
	try {
		const decode = JWT.verify(req.headers.authorization, process.env.JWT_SECRET)
		req.user = decode
		next()
	} catch (error) {
		// console.log(error)
		return res.status(403).json({
			error: error.message,
			success: false,
		})
	}
}

module.exports = { requireSignIn }
