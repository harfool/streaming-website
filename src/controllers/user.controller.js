import asyncHandler from "./../utils/asyncHandler.js";
import ApiError from "./../utils/ApiError.js";
import { User } from "./../models/user.models.js";
import uploadOnCloudinary from "./../utils/cloudinary.js";
import ApiResponce from "./../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;

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
  console.log("avater succussfully upload  in local path",avatarLocalPath)
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
      console.error("Error uploading cover image to Cloudinary:", error.message);
      coverImage = { url: "" };
    }
  } else {
    console.warn("No cover image provided. Proceeding without it.");
    coverImage = { url: "" };
  }
  console.log("Avatar upload response:", avatar.url);
  console.log("Cover image upload response:", coverImage.url);



  // Create user in the database
  const user = await User.create({
    fullName,
    avatar: avatar.url ,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // Fetch user without sensitive fields
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Send response
  return res.status(201).json(
    new ApiResponce(201, createdUser, "User registered successfully")
  );
});

export default registerUser;
