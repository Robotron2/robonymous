const express = require("express")
const { requireSignIn } = require("../middlewares/authMiddleware.js")
const {
	postAnonymousController,
	getAllMessagesController,
} = require("../controllers/messageController.js")

const router = express.Router()

router.post("/:username", postAnonymousController)
router.get("/", requireSignIn, getAllMessagesController)

module.exports = router
