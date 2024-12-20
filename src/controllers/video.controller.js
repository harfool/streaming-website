import mongoose, { isValidObjectId } from "mongoose"; 
import { Video } from "../models/video.models.js"; 
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiErrors.js"; 
import { asyncHandler } from "../utils/asyncHandler.js"; 
import { uploadOnCloudinary } from "../utils/Cloudinary.js"; 
import { Like } from "../models/like.models.js"; 
import ApiResponce from './../utils/ApiResponse';

// Fetch all videos with pagination, filtering, and sorting
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1, // Default to 1 if no page specified
    limit = 10, // Default to 10 results per page
    query, // Search query (optional)
    sortBy = "createdAt", // Sort by creation date by default
    sortType = 1, // 1 for ascending, -1 for descending
    userId, // Optional: filter by user ID
  } = req.query;

  const options = {
    page: parseInt(page, 10), // Convert page number to integer
    limit: parseInt(limit, 10), // Convert limit to integer
  };

  const pipeline = []; // Array to store MongoDB aggregation pipeline stages

  // If a search query is provided, filter by title or description
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } }, // Case-insensitive regex match for title
          { description: { $regex: query, $options: "i" } }, // Case-insensitive regex match for description
        ],
      },
    });
  }

  // If a user ID is provided, filter by the video's owner
  if (userId) {
    pipeline.push({
      $match: { owner: userId },
    });
  }

  // Lookup the owner's details (username, avatar) for each video
  pipeline.push({
    $lookup: {
      from: "users", // From the 'users' collection
      localField: "owner", // Match 'owner' field in the video document
      foreignField: "_id", // Match '_id' field in the 'users' collection
      as: "videoOwner", // Alias the result as 'videoOwner'
      pipeline: [{ $project: { username: 1, avatar: 1 } }], // Only select 'username' and 'avatar' fields
    },
  });

  // Lookup the likes for each video
  pipeline.push(
    {
      $lookup: {
        from: "likes", // From the 'likes' collection
        localField: "_id", // Match 'video' field in the likes collection
        foreignField: "video", // Match '_id' field in the video collection
        as: "videoLikes", // Alias the result as 'videoLikes'
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$videoLikes", // Add a 'likesCount' field with the size of 'videoLikes'
        },
      },
    }
  );

  // Sort videos by the specified field and type (ascending or descending)
  pipeline.push({
    $sort: {
      [sortBy]: parseInt(sortType, 10), // Ensure sortType is parsed as integer
    },
  });

  // Pagination stages: skip videos based on the current page and limit
  pipeline.push(
    { $skip: (options.page - 1) * options.limit },
    { $limit: options.limit }
  );

  // Perform the aggregation query with pagination
  const fetchedVideos = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    options
  );

  if (!fetchedVideos) {
    throw new ApiError(400, "Could not fetch videos"); // Handle case where no videos are fetched
  }

  // Return the fetched videos with a successful response
  return res
    .status(200)
    .json(new ApiResponce(200, fetchedVideos, "Videos fetched successfully"));
});

// Publish a new video by uploading to Cloudinary and saving video details to DB
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const initialViews = 0; // Default to 0 views
  const videoLocalPath = req.files?.videoFile[0]?.path; // Path to the video file
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path; // Path to the thumbnail file

  // Ensure that title, description, video, and thumbnail are provided
  if (title == "" || description == "")
    throw new ApiError(404, "Title and description are required.");
  if (!videoLocalPath) throw new ApiError(404, "Video file missing");
  if (!thumbnailLocalPath) throw new ApiError(404, "Thumbnail file is missing");

  // Upload the video and thumbnail to Cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // Ensure successful uploads to Cloudinary
  if (!videoFile?.url)
    throw new ApiError(400, "Error while uploading your video");
  if (!thumbnail?.url)
    throw new ApiError(400, "Error while uploading your thumbnail");

  // Save the video details to the database
  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    title: title,
    description: description,
    duration: videoFile.duration,
    views: initialViews,
    isPublished: true, // Mark the video as published
    owner: req.user._id, // Set the owner to the logged-in user
  });

  const uploadedVideo = await Video.findById(video._id);
  if (!uploadedVideo)
    throw new ApiError(500, "Something went wrong while uploading the video");

  // Return the uploaded video with a successful response
  return await res
    .status(200)
    .json(new ApiResponce(200, uploadedVideo, "Video uploaded successfully!"));
});

// Get video details by ID, including owner details, likes, and views
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // Validate the video ID
  if (!videoId?.trim() || !isValidObjectId(videoId))
    throw new ApiError(404, "Invalid link");

  // Aggregate pipeline to get video by ID along with related data (owner, likes, etc.)
  const fetchedVideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId), // Match video by ID
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videoOwner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes", // Lookup likes for the video
        localField: "_id",
        foreignField: "video",
        as: "videoLikes",
      },
    },
    {
      $addFields: {
        videoLikesCount: {
          $size: "$videoLikes", // Add likes count to the video document
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$videoLikes.likedBy"] },
            then: true, // Check if the user has liked the video
            else: false,
          },
        },
      },
    },
  ]);

  if (!fetchedVideo) throw new ApiError(404, "Video not found");

  // Update the user's watch history and increment views for the video
  const currentUser = await User.findById(req.user._id);
  if (!currentUser.watchHistory.includes(fetchedVideo[0]._id)) {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { watchHistory: fetchedVideo[0]._id },
    });
  }

  await Video.updateOne(
    { _id: new mongoose.Types.ObjectId(videoId) },
    { $inc: { views: 1 } }
  );

  // Return the fetched video details with a successful response
  return res
    .status(200)
    .json(new ApiResponce(200, fetchedVideo, "Video fetched successfully!"));
});

// Update video details like title, description, and thumbnail
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Invalid video link");

  const { title, description } = req.body;
  const thumbnailLocal = req.file?.path;
  if (!title || !description || !thumbnailLocal)
    throw new ApiError(400, "All fields are necessary");

  const thumbnail = await uploadOnCloudinary(thumbnailLocal);
  if (!thumbnail) throw new ApiError(400, "Failed to upload thumbnail");

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  if (!updatedVideo) throw new ApiError(500, "Failed to update video details");

  return res
    .status(200)
    .json(
      new ApiResponce(200, updatedVideo, "Video details updated successfully")
    );
});

// Delete a video and its associated likes
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid or missing video ID");
  }

  // Delete the video document
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(404, "Video not found");
  }

  // Delete associated like document
  const deletedDocument = await Like.findOneAndDelete({ video: videoId });
  if (!deletedDocument) {
    throw new ApiError(404, `No like document found for video ID: ${videoId}`);
  }

  // Return a successful response after deleting the video
  return res
    .status(200)
    .json(new ApiResponce(200, deletedVideo, "Video deleted successfully"));
});

// Toggle the publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Invalid link");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const statusToggledVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished, // Toggle the publish status
      },
    },
    { new: true }
  );

  if (!statusToggledVideo)
    throw new ApiError(400, "Error updating toggle video");

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        statusToggledVideo,
        `Video is now ${statusToggledVideo.isPublished ? "published" : "unpublished"}!`
      )
    );
});

// Export the video controller methods
export const videoController = {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};