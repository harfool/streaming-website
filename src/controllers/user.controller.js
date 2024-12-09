import asyncHandler from "./../utils/asyncHandler.js";
import ApiError from "./../utils/ApiError.js";
import { User } from "./../models/user.models.js";
import uploadOnCloudinary from "./../utils/cloudinary.js";
import ApiResponce from './../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // get user details form frontend
  //validation - not empty
  // check if user already exists  : userName , email
  //check for image , check for avatar
  // upload then to choudiary , avater
  //  create user object - create entry for database
  //remove password and refresh token feild from response
  // check for user creation
  // return response

  const { userName, fullName, email, password } = req.body;
  console.log(req.body);
  console.log(
    "UserName : ",
    userName,
    "email : ",
    email,
    "full name :",
    fullName
  );

  if (
    [userName, fullName, email, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const exitedUser = User.findOne({
    $or: [{ userName }, { email }],
  });

  if (exitedUser) {
    throw new ApiError(409, "user name or email already exits");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

 const user = await   User.create({
    fullName, 
    avatar: avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    userName :  userName.toLowerCase()

  })
    
  const createUser = await User.findById(user._id).select(
    "-password  -refreshToken" 
  )
  
  if (!createUser) {
    throw new ApiError(500 , " something want wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponce(200 , createUser , "User registered Successfully")
  )

});

export default registerUser;
