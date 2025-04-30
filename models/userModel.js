const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name'],
    },
    email:{
        type:String,
        required:[true,'Please enter your email'],
        unique:true,
        trim:true,
        match:[
            /^([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/,
            'Please enter a valid email',
        ]
    },
    password:{
        type:String,
        required:[true,'Please enter your password'],
        minLength:[6,'Password must be at least 6 characters'],
        // maxlength:[23,'Password cannot exceed 23 characters'],
    },
    photo:{
        type:String,
        default:'https://iconarchive.com/download/i108025/Flat-Design/User-Profile-Avatar-User-Profile.ico',
        required:[true,'Please upload your photo'],
    },
    phone:{
        type:String,
        maxLength:[10,'Phone number cannot exceed 10 characters'],
    },
    bio:{
        type:String,
        maxLength:[250,'Bio cannot exceed 250 characters'],
    }
},{
    timestamps:true,
})

//encrypt the password  
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password,salt)
    this.password = hashedPassword
})

const user = mongoose.model('User',userSchema)
module.exports=user;