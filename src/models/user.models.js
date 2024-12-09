import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" 
const userSchema = new mongoose.Schema({
    userName :{
        type : String,
        required : true,
        unique : true,
        lowerCase : true,
        index : true ,// for make searchable make index true
        trim : true
    },
    fullName :{
        type : String,
        required : true,
        unique : true,
        lowerCase : true,
        index : true ,// for make searchable make index true
        trim : true
    },
    email : {
        type :String,
        required : true,
        unique : true,
        lowerCase : true
    },
    videoHistory :[
        {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video"
    }
    ], 
    avatar:{
        type : String ,// cloudinary
        required : true
    },
    coverImage :{
        type : String
    },
    password :{
        type : String ,
        required : [true , 'password is required' ]
    },
    refreshToken :{
        type : String
    }


}, {timestamps : true})

userSchema.pre('save' , async function(res , req , next){
  if (! this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password , 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password , this.password)
}
userSchema.methods.generateAccessToken = function () {
    jwt.sign(
        {
            _id : this._id,
            fullName : this.fullName,
            email : this.email,
            userName : this.userName
        },
        process.env.ACCESS_TOKEN_SECRET ,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET ,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )}


export const User = mongoose.model("User" , userSchema)