const { User } = reuire( "../models/userModel.js")
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken")

const saltRounds = 10

const registerController = async (req, res) => {
	//
}

const loginController = async (req, res) => {
	//
}


const forgotPasswordController = async (req, res) => {
	//
}




module.exports = {
    registerController,
    loginController,
    forgotPasswordController
}