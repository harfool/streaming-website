import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to create a new tweet
const createTweet = asyncHandler(async (req, res) => {
  // Create a new tweet with the content provided in the request body
  const postedTweet = await Tweet.create({
    content: req.body.content, // Content of the tweet
    owner: req.user._id, // The ID of the user creating the tweet
  });

  // If the tweet creation fails, throw an error
  if (!postedTweet) throw new ApiError(400, "Failed to create tweet");

  // Return a successful response with the created tweet
  return res
    .status(200)
    .json(new ApiResponce(200, postedTweet, "Tweet created successfully!"));
});

// Controller to fetch tweets of a specific user
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Extract the userId from the request parameters

  // Fetch tweets using MongoDB aggregation to gather detailed information about each tweet
  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId), // Match tweets belonging to the specified user
      },
    },
    {
      $lookup: {
        // Lookup to get user details of the tweet owner (user who posted the tweet)
        from: "users", // The 'users' collection
        localField: "owner", // The 'owner' field in Tweet
        foreignField: "_id", // The '_id' field in User collection
        as: "tweetOwner", // The name of the array where user details will be stored
        pipeline: [
          {
            $project: {
              username: 1, // Include the username
              avatar: 1, // Include the avatar
              fullname: 1, // Include the full name
            },
          },
        ],
      },
    },
    {
      $lookup: {
        // Lookup to get likes related to the tweet
        from: "likes", // The 'likes' collection
        localField: "_id", // The tweet's '_id' field
        foreignField: "tweet", // The 'tweet' field in Likes collection
        as: "tweetLikes", // The name of the array where likes will be stored
      },
    },
    {
      $addFields: {
        // Add additional fields to the tweet document
        tweetLikesCount: { $size: "$tweetLikes" }, // Count the number of likes for the tweet
        hasUserLikedTweet: {
          $in: [
            req.user._id, // Check if the logged-in user has liked this tweet
            {
              $map: {
                input: "$tweetLikes", // Iterate through the tweetLikes array
                as: "like",
                in: "$$like.likedBy", // Access the 'likedBy' field to check if the user has liked it
              },
            },
          ],
        },
      },
    },
    {
      $sort: { createdAt: -1 }, // Sort the tweets by creation date, most recent first
    },
  ]);

  // If no tweets are found for the user, return an empty array with a message
  if (!userTweets || userTweets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponce(200, [], "No tweets found for this user"));
  }

  // Return the user tweets along with associated data (likes, tweet owner)
  return res
    .status(200)
    .json(new ApiResponce(200, userTweets, "User tweets fetched successfully"));
});

// Controller to update an existing tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params; // Extract the tweetId from the request parameters

  // Check if tweetId is provided, if not throw an error
  if (!tweetId) throw new ApiError(404, "Invalid Tweet Link");

  // Update the tweet content using the provided tweetId and request body content
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId, // The ID of the tweet to update
    {
      $set: {
        content: req.body.content, // Update the content of the tweet
      },
    },
    {
      new: true, // Return the updated tweet
    }
  );

  // If the tweet couldn't be updated, throw an error
  if (!updatedTweet) throw new ApiError(400, "Could not update tweet");

  // Return the updated tweet
  return res
    .status(200)
    .json(new ApiResponce(200, updatedTweet, "Tweet updated successfully!"));
});

// Controller to delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params; // Extract the tweetId from the request parameters

  // Check if tweetId is provided, if not throw an error
  if (!tweetId) throw new ApiError(404, "Invalid Tweet Link");

  // Delete the tweet by its ID
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  // If the tweet couldn't be deleted, throw an error
  if (!deletedTweet) throw new ApiError(400, "Could not delete tweet");

  // Return a success message and the deleted tweet
  return res
    .status(200)
    .json(new ApiResponce(200, deletedTweet, "Tweet deleted successfully!"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
