import mongoose, { isValidObjectId } from "mongoose"; 
import { Like } from "../models/like.models.js"; 
import { ApiError } from "../utils/ApiErrors.js"; 
import { ApiResponce } from "../utils/ApiResponse.js"; 
import { asyncHandler } from "../utils/asyncHandler.js"; 
import { Video } from "../models/video.models.js"; 
import { Comment } from "../models/comment.models.js"; 
import { Tweet } from "../models/tweet.models.js"; 

// Function to toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Extract video ID from request parameters
  // Check if videoId is provided
  if (!videoId) throw new ApiError(400, "Invalid video link");

  // Fetch the video from the database by its ID
  const fetchedVideo = await Video.findById(videoId);
  // If video not found, throw a 404 error
  if (!fetchedVideo) throw new ApiError(404, "Video not found");

  // Check if the user has already liked this video
  const isLiked = await Like.findOne(
    {
      video: videoId, // Match the video ID
      likedBy: req.user._id, // Match the user ID
    },
    {
      new: true, // Return the updated document after modification
    }
  );

  // If the user has liked the video, remove the like
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);
  } else {
    // If not, create a new like record for the video
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
  }

  // Return a successful response indicating the video was liked/unliked
  return res.status(200).json(
    new ApiResponce(
      200,
      {
        "Video liked/unliked": fetchedVideo,
      },
      "Video liked/unliked successfully"
    )
  );
});

// Function to toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params; // Extract comment ID from request parameters
  // Check if commentId is provided
  if (!commentId) throw new ApiError(400, "Invalid comment link");

  // Fetch the comment from the database by its ID
  const fetchedComment = await Comment.findById(commentId);
  // If comment not found, throw a 404 error
  if (!fetchedComment) throw new ApiError(404, "Comment not found");

  // Check if the user has already liked this comment
  const isLiked = await Like.findOne(
    {
      comment: commentId, // Match the comment ID
      likedBy: req.user._id, // Match the user ID
    },
    {
      new: true, // Return the updated document after modification
    }
  );

  // If the user has liked the comment, remove the like
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);
  } else {
    // If not, create a new like record for the comment
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
  }

  // Return a successful response indicating the comment was liked/unliked
  return res.status(200).json(
    new ApiResponce(
      200,
      {
        "Comment liked/unliked": fetchedComment,
      },
      "Comment liked/unliked successfully"
    )
  );
});

// Function to toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params; // Extract tweet ID from request parameters
  // Check if tweetId is provided
  if (!tweetId) throw new ApiError(400, "Invalid tweet link");

  // Fetch the tweet from the database by its ID
  const fetchedTweet = await Tweet.findById(tweetId);
  // If tweet not found, throw a 404 error
  if (!fetchedTweet) throw new ApiError(404, "Tweet not found");

  // Check if the user has already liked this tweet
  const isLiked = await Like.findOne(
    {
      tweet: tweetId, // Match the tweet ID
      likedBy: req.user._id, // Match the user ID
    },
    {
      new: true, // Return the updated document after modification
    }
  );

  // If the user has liked the tweet, remove the like
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);
  } else {
    // If not, create a new like record for the tweet
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
  }

  // Return a successful response indicating the tweet was liked/unliked
  return res.status(200).json(
    new ApiResponce(
      200,
      {
        "Tweet liked/unliked": fetchedTweet,
      },
      "Tweet liked/unliked successfully"
    )
  );
});

// Function to get all liked videos of a user
const getLikedVideos = asyncHandler(async (req, res) => {
  // Aggregation pipeline to get all liked videos for the current user
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user._id, // Match the current user
        video: { $ne: null }, // Ensure it's a video (not null)
      },
    },
    {
      $lookup: {
        from: "videos", // Lookup for the "videos" collection
        localField: "video", // Match the video field
        foreignField: "_id", // Match the video ID
        as: "likedVideos", // Output the result as "likedVideos"
        pipeline: [
          {
            $lookup: {
              from: "users", // Lookup for the "users" collection
              localField: "owner", // Match the video owner
              foreignField: "_id", // Match the user ID
              as: "videoOwner", // Output the result as "videoOwner"
              pipeline: [
                {
                  $project: {
                    username: 1, // Only include the username
                    avatar: 1, // Only include the avatar
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "likes", // Lookup for the "likes" collection
              localField: "_id", // Match the video ID
              foreignField: "video", // Match the like's video field
              as: "videoLikes", // Output the result as "videoLikes"
            },
          },
          {
            $addFields: {
              likesCount: {
                $size: "$videoLikes", // Add the count of video likes
              },
            },
          },
        ],
      },
    },
  ]);

  // If no liked videos found, throw an error
  if (!likedVideos) throw new ApiError(400, "Could not fetch liked videos");

  // Return a successful response with the liked videos data
  return res
    .status(200)
    .json(
      new ApiResponce(200, likedVideos, "Liked videos fetched successfully!")
    );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
};
