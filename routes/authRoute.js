const express = require("express")

const {
	forgotPasswordController,
	loginController,
	registerController,
	updateEmailController,
} = require("../controllers/authController.js")
const { requireSignIn } = require("../middlewares/authMiddleware.js")

const router = express.Router()

router.post("/register", registerController)
router.post("/login", loginController)
router.post("/update-email", requireSignIn, updateEmailController)
//forgot
router.post("/forgot-password", forgotPasswordController)

router.get("/user-auth", requireSignIn, (req, res) => {
	res.status(200).send({ ok: true })
})

module.exports = router
