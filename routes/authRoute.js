const express = require('express');

const  { forgotPasswordController, loginController, registerController } = require( "../controllers/authController.js")
const  { requireSignIn } =requrie( "../middlewares/authMiddleware.js")


const router = express.Router()

router.post("/register", registerController)
router.post("/login", loginController)
//forgot
router.post("/forgot-password", forgotPasswordController)

router.get("/user-auth", requireSignIn, (req, res) => {
	res.status(200).send({ ok: true })
})

export default router
