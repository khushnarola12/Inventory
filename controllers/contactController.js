const AsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail")


const contactUs  = AsyncHandler(async(req,res)=>{
    const {subject,message} = req.body
    const user = await User.findById(req.user._id)

    if(!user){
        res.status(404)
        throw new Error("User not found , please sign up")
    }

    //validation
    if(!message || !subject){
        res.status(400)
        throw new Error("Please add subject and message")
    }

    const send_to = process.env.EMAIL_USER
    const send_from=process.env.EMAIL_USER
    const reply_to=user.email


     try {
            await sendEmail(send_to,subject,message)
            res.status(200).json({success:true,message:"Email sent"})
        } catch (error) {
            res.status(500)
            throw new Error("Email not sent, Please try again")
        }
})  

module.exports = {
    contactUs
}   