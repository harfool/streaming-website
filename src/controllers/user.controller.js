import asyncHandler from "./../utils/asyncHandler.js";
import ApiError from "./../utils/ApiError.js";
import { User } from "./../models/user.models.js";
import uploadOnCloudinary from "./../utils/cloudinary.js";
import ApiResponce from "./../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "somewant want wrong while generating Access And Refresh Token "
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;
  console.log("req.body", req.body);
  // Validate fields
  if (
    [userName, fullName, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ userName: userName.toLowerCase() }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User name or email already exists");
  }

  // Get local file paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // console.log("avater succussfully upload  in local path",avatarLocalPath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload files to Cloudinary
  let avatar, coverImage;

  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar || !avatar.url) {
      throw new Error("Avatar upload failed. No URL received.");
    }
  } catch (error) {
    console.error("Error uploading avatar to Cloudinary:", error.message);
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  if (coverImageLocalPath) {
    try {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
      if (!coverImage || !coverImage.url) {
        console.warn("Cover image upload failed. Proceeding without it.");
        coverImage = { url: "" };
      }
    } catch (error) {
      console.error(
        "Error uploading cover image to Cloudinary:",
        error.message
      );
      coverImage = { url: "" };
    }
  } else {
    console.warn("No cover image provided. Proceeding without it.");
    coverImage = { url: "" };
  }
  // console.log("Avatar upload response:", avatar.url);
  // console.log("Cover image upload response:", coverImage.url);

  // Create user in the database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // Fetch user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Send response
  return res
    .status(201)
    .json(new ApiResponce(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (res, req) => {
  // req body -> data
  //username or email check
  // find the user
  // check the password
  // access and refresh token
  //send cookie

  const { email, password, userName } = req.body;
  if (!email || !userName) {
    throw new ApiError(400, "username and email is required");
  }

  const user = await User.findOne({ $or: [{ email }, { userName }] });

  if (!user) {
    throw new ApiError(404, " user does not exit");
  }

  const validPassword = await user.isPasswordCorrect(password);

if (!validPassword) {
  throw new ApiError(401, " password is  incorrect");
}

const {accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id)

const logInUser = await User.findById(user._id).
select("-password -refreshToken ")

const options = {
  httpOnly : true,
  secure : true
}

return res.status(200)
.cookie("accessToken", accessToken , options)
.cookie("refreshToken" , refreshToken , options)
.json(
  new ApiResponce(
    {
      user : logInUser ,
       accessToken,
      refreshToken ,
    },
    "user logIn successfully"
  )
)
});

export {registerUser , loginUser} 
