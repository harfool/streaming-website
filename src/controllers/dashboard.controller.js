import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

// Controller to get statistics about the user's channel (e.g., total videos, views, likes, subscribers)
const getChannelStats = asyncHandler(async (req, res) => {
  // Extract channelId from the logged-in user's data (current user)
  const channelId = req.user._id;

  // Aggregate query to fetch channel statistics
  const userChannel = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId), // Match the user by their ID
      },
    },
    {
      $project: {
        avatar: 0, // Exclude unnecessary fields like avatar, coverImage, etc.
        coverImage: 0,
        email: 0,
        fullname: 0,
        username: 0,
      },
    },
    {
      $lookup: {
        from: "videos", // Join with 'videos' collection to get all videos uploaded by the user
        localField: "_id", // Match the user's ID with the 'owner' field in videos
        foreignField: "owner",
        as: "channelVideos", // Add videos to the 'channelVideos' field
        pipeline: [
          {
            $project: {
              title: 1, // Include video title
              isPublished: 1, // Include publication status
              views: 1, // Include the number of views
            },
          },
          {
            $match: {
              isPublished: true, // Filter only published videos
            },
          },
          {
            $lookup: {
              from: "likes", // Join with 'likes' to get likes on each video
              localField: "_id", // Match video ID with 'video' field in likes
              foreignField: "video",
              as: "videoLikes", // Add likes data to the 'videoLikes' field
              pipeline: [
                {
                  $project: {
                    _id: 1, // Include only the _id of likes (for counting purposes)
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              videoLikesCount: {
                $size: "$videoLikes", // Count the number of likes for each video
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalLikesCount: {
          $sum: "$channelVideos.videoLikesCount", // Sum total likes across all channel videos
        },
        totalViews: {
          $sum: "$channelVideos.views", // Sum total views across all channel videos
        },
        totalVideosCount: {
          $size: "$channelVideos", // Count total number of videos uploaded by the channel
        },
      },
    },
    {
      $lookup: {
        from: "subscriptions", // Join with 'subscriptions' collection to get channel subscribers
        localField: "_id", // Match the user ID with 'channel' field in subscriptions
        foreignField: "channel",
        as: "channelSubscribers", // Add subscription data to 'channelSubscribers' field
        pipeline: [
          {
            $project: {
              username: 1, // Include username of the subscriber (for counting purposes)
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $size: "$channelSubscribers", // Count the number of subscribers
        },
      },
    },
    {
      $project: {
        password: 0, // Exclude sensitive information like password and refreshToken
        refreshToken: 0,
        watchHistory: 0,
      },
    },
  ]);

  // If no user/channel was found, throw an error
  if (!userChannel) throw new ApiError(400, "Could not fetch channel details");

  // Send a successful response with the user's channel stats
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        userChannel,
        "User channel stats fetched successfully!"
      )
    );
});

// Controller to get all videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  // Fetch all videos uploaded by the logged-in user
  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id), // Match videos owned by the logged-in user
      },
    },
    {
      $lookup: {
        from: "users", // Join with 'users' collection to get video owner's details
        localField: "owner", // Match video owner's ID with the user ID
        foreignField: "_id",
        as: "videoOwner", // Add video owner information to the 'videoOwner' field
        pipeline: [
          {
            $project: {
              avatar: 1, // Include avatar of the owner
              username: 1, // Include username of the owner
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes", // Join with 'likes' collection to get likes on the videos
        localField: "_id", // Match video ID with 'video' field in likes
        foreignField: "video",
        as: "videoLikes", // Add likes data to the 'videoLikes' field
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$videoLikes", // Count the number of likes on each video
        },
      },
    },
  ]);

  // If no videos are found, throw an error
  if (!channelVideos) throw new ApiError(404, "Channel videos not found");

  // Send a successful response with the videos uploaded by the channel
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        channelVideos,
        "Channel videos fetched successfully!"
      )
    );
});

export { getChannelStats, getChannelVideos };
