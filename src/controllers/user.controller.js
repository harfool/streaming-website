import asyncHandler from './../utils/asyncHandler.js';


const registerUser = asyncHandler( async (req ,res) =>{
    res.status(200).json({
        message : "well done good job"
    })
})



export  default registerUser