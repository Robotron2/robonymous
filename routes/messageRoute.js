const express = require("express")
const { requireSignIn } = require("../middlewares/authMiddleware.js")
const {
	postAnonymousController,
} = require("../controllers/messageController.js")

const router = express.Router()

// router.get("/:id", requireSignIn, getAllMessagesController)
router.post("/:username", postAnonymousController)

module.exports = router
