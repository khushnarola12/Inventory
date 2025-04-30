const asyncHandler = require("express-async-handler")
const User = require("../models/userModel") 
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const Token = require("../models/tokenModel")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")


const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET||'khush123',{expiresIn:"1d"})
}

// ============== Register USER =============== 

const registerUser = asyncHandler( async (req, res) => { 
   const {name,email,password,phone} = req.body

   //Validation
   if(!name || !email || !password){
    res.status(400)
    throw new Error("Please fill in all required fields")
   }
   if(password.length<6){
    res.status(400)
    throw new Error("Password must be 6 characters")
   }

   //check email already exist
   const userExists = await User.findOne({email})
   if(userExists){
    res.status(400)
    throw new Error("Email has been already registered")
   }
   
   //create a new user
   const user = await  User.create({
    name,
    email,
    password,
    phone 
   })

    //Generate token
    const token = generateToken(user._id)

    //send HTTP only cookie
    res.cookie("token",token,{
        path:"/",
        httpOnly:true,
        expires:new Date(Date.now()+1000 * 86400), //1 dat
        sameSite:"none",
        secure:true
    })

   if(user){
    const {_id,name,email,photo,phone,bio} = user
    res.status(201).json({
        _id,
        name,
        email,
        photo,
        phone,
        bio,
        token
    })
   }
   else{
    res.status(400)
    throw new Error("Invalid user data")
   }
})

// ================= LOGIN User ======================
const loginUser = asyncHandler(async (req,res)=>{
    const {email,password} = req.body

    //validates Request 
    if(!email || !password){
        res.status(400)
        throw new Error("Please add email and password")
    }

    //Check if User exist 
    const user = await User.findOne({email})

    if(!user){
        res.status(400)
        throw new Error("user not Found, Please Sign Up")
    }

    //check If password is correct
    const passwordIsCorrect = await bcrypt.compare(password,user.password)

      //Generate token
      const token = generateToken(user._id)

      //send HTTP only cookie
      res.cookie("token",token,{
          path:"/",
          httpOnly:true,
          expires:new Date(Date.now()+1000 * 86400), //1 dat
          sameSite:"none",
          secure:true
      })

    if(user&&passwordIsCorrect){
        const {_id,name,email,photo,phone,bio} = user
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        })
    }
    else{
        res.status(400)
        throw new Error("Invalid Email or Password")
    }

})   

// ============= Logout User ==================

const logout = asyncHandler(async(req,res)=>{
    res.cookie("token","",{
        path:"/",
        httpOnly:true,
        expires:new Date(0), //1 dat
        sameSite:"none",
        secure:true
    })
    return res.status(200).json({
        message : "Successfully Logged Out"
    })
})

// ============= Get User Data =============
const getUser = asyncHandler( async(req,res)=>{
    const user = await User.findById(req.user._id)

    if(user){
        const {_id,name,email,photo,phone,bio} = user
    res.status(201).json({
        _id,
        name,
        email,
        photo,
        phone,
        bio,
    })
    }
    else{
        res.status(400)
        throw new Error("user not found")
       }
})

// =========== check Login Status =============
const loginStatus = asyncHandler(async (req,res)=>{
    const token = req.cookies.token
    if(!token){
        return res.json(false)
    }

    const verified = jwt.verify(token,process.env.JWT_SECRET || 'khush123')
    if(verified){
        return res.json(true)
    }
    return res.json(false)
})

// ============ Update User ==============

const updateUser = asyncHandler(async (req,res)=>{
    const user =  await User.findById(req.user._id)
    if(user){
        const {_id,name,email,photo,phone,bio} = user;
        user.email = email
        user.name = req.body.name || name
        user.photo = req.body.photo || photo
        user.phone = req.body.phone || phone
        user.bio = req.body.bio || bio

        const updatedUser = await user.save()
        res.status(200).json({
        _id : updatedUser._id,
        name : updatedUser.name,
        email: updatedUser.email,
        photo: updatedUser.photo,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        })
    }
    else{
        res.status(404)
        throw new Error("User not found")
    }
})

// ============ Change Password ==============
const changePassword = asyncHandler (async(req,res)=>{
    const user =  await User.findById(req.user._id)

    const {oldPassword,password} = req.body

    if(!user){
        res.status(404)
        throw new Error("User not found,please Signup")
    }
    //validate
    if(!oldPassword || !password){
        res.status(404)
        throw new Error("Please Add old and new password")
    }

    //check the old password and new password are same
    const passwordIsCorrect= await bcrypt.compare(oldPassword,user.password)


    //save new password
    if(user && passwordIsCorrect){
        user.password = password
        await user.save()
        res.status(200).send("password changed successfully")
    }
    else{
            res.status(404)
            throw new Error("Old password incorrect")
    }
})

// ========== Forgot Password =================
const forgotPassword = asyncHandler(async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    console.log(user);
    

    if(!user){
        res.status(404)
        throw new Error("User does not exist")
    }

    //delete token  if it exist in DB
    let token = await Token.findOne({userId:user._id})
    if(token){
        await token.deleteOne()
    }

    //create Reset Token 
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(resetToken);
    

    // Hash token before saving DB
    const hashedToken = crypto
    .createHash("sha256").
    update(resetToken).
    digest("hex")

    //save token to DB 
    await new Token({
        userId :user._id,
        token : hashedToken,
        createdAt : Date.now(),
        expiresAt : Date.now() + 30*(60*1000)  
    }).save()

    //construct reset Url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
    //Reset Email 
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the below url to reset your password</p>
         <p>reset link is valid for only 30 minutes</p>

        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p>Regards ........</p>
         <p>Inventry team</p>

    `

    const subject = "RESET PASSWORD REQUEST"
    const send_to = user.email
    const send_from=process.env.EMAIL_USER

    try {
        await sendEmail(send_to,subject,message)
        res.status(200).json({success:true,message:"reset email sent"})
    } catch (error) {
        res.status(500)
        throw new Error("Email not sent, Please try again")
    }
    
})

// ============== Reset Password =============

const resetPassword = asyncHandler(async(req,res)=>{
    const {password} = req.body
    const {resetToken} = req.params

    //hashed token , then compare to database
    const hashedToken = crypto
    .createHash("sha256").
    update(resetToken).
    digest("hex")

    //find token in DB
    const userToken = await Token.findOne({
        token : hashedToken,
        expiresAt : {$gt:Date.now()}
    })

    if(!userToken){
        res.status(404)
        throw new Error("Invalid or Expired token")
    }
    
    //find User
    const user = await User.findOne({_id:userToken.userId})
    user.password = password
    await user.save()
    res.status(200).json({
        message:"Password reset successful, Please Login"
    })
})
module.exports = {
    registerUser,
    loginUser,
    logout ,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}