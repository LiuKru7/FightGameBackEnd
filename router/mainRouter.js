const express = require("express")
const router = express.Router()

const {
    avatars,
    register, login
} = require("../controller/mainController")

router.post ("/register", register)
router.get("/avatars", avatars)
router.post("/login", login)


module.exports=router
