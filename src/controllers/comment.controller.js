import mongoose from "mongoose"; 
import { Comment } from "../models/comment.models.js"; 
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponce } from "../utils/ApiResponse.js"; 
import { asyncHandler } from "../utils/asyncHandler.js"; 


// Controller to handle retrieving comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
  // Extract the videoId from the request parameters and page & limit from query params
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate the videoId (it should be provided)
  if (!videoId) throw new ApiError(400, "Invalid video link");

  // Fetch all comments for the video using aggregation in MongoDB
  const videoComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId), // Match comments for the given videoId
      },
    },
    {
      $lookup: {
        from: "users", // Join with the 'users' collection to get comment owner's details
        localField: "owner", // Field in Comment model to match with user
        foreignField: "_id", // Match with _id in the users collection
        as: "commentOwner", // Add the comment owner's data as 'commentOwner'
        pipeline: [
          {
            $project: {
              fullname: 1, // Include fullname
              username: 1, // Include username
              avatar: 1, // Include avatar
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes", // Join with the 'likes' collection to get likes for each comment
        localField: "_id", // Match comment _id with likes.comment
        foreignField: "comment", // Match 'comment' field in likes collection
        as: "commentLikes", // Add the likes data as 'commentLikes'
        pipeline: [
          {
            $project: {
              likedBy: 1, // Include the likedBy field to track users who liked the comment
            },
          },
          {
            $lookup: {
              from: "users", // Join with 'users' to get the details of users who liked the comment
              localField: "likedBy", // Match likedBy with users _id
              foreignField: "_id", // Match user _id with likedBy field
              as: "commentLikedByUsers", // Add user details as 'commentLikedByUsers'
              pipeline: [
                {
                  $project: {
                    fullname: 1, // Include fullname
                    username: 1, // Include username
                    avatar: 1, // Include avatar
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        commentLikesCount: { $size: "$commentLikes" }, // Count the number of likes on the comment
        hasUserLikedComment: { // Check if the current user has liked the comment
          $cond: {
            if: { $in: [req.user?._id, "$commentLikes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $skip: (page - 1) * limit, // Skip documents based on the page number and limit
    },
    {
      $limit: parseInt(limit), // Limit the number of comments per page
    },
  ]);

  console.log(videoComments); // Log the fetched comments for debugging

  // If no comments are found, throw an error
  if (!videoComments) throw new ApiError(400, "Could not find video comments");

  // Send a successful response with the fetched comments
  return res
    .status(200)
    .json(
      new ApiResponce(200, videoComments, "Video comments fetched successfully")
    );
});

// Controller to handle adding a new comment to a video
const addComment = asyncHandler(async (req, res) => {
  // Extract videoId from request parameters
  const { videoId } = req.params;

  // Check if videoId is provided, otherwise throw an error
  if (!videoId) throw new ApiError(404, "Invalid link");

  // Ensure the comment content is provided
  if (!req.body.content) throw new ApiError(400, "Comment content is missing");

  // Create a new comment for the video in the database
  const postedComment = await Comment.create({
    content: req.body.content,
    video: videoId,
    owner: req.user._id, // Associate the comment with the logged-in user
  });

  // If the comment creation fails, throw an error
  if (!postedComment)
    throw new ApiError(400, "Could not add comment on the video");

  // Send a successful response with the newly created comment
  return res
    .status(200)
    .json(new ApiResponce(200, postedComment, "Comment added successfully!"));
});

// Controller to handle updating an existing comment
const updateComment = asyncHandler(async (req, res) => {
  // Extract commentId from request parameters
  const { commentId } = req.params;

  // Update the comment's content in the database
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: req.body.content, // Update the content with the new value
      },
    },
    { new: true } // Return the updated comment
  );

  // If the comment wasn't updated, throw an error
  if (!updatedComment) throw new ApiError(400, "Could not update your comment");

  // Send a successful response with the updated comment
  return res
    .status(200)
    .json(
      new ApiResponce(200, updatedComment, "Comment updated successfully!")
    );
});

// Controller to handle deleting a comment
const deleteComment = asyncHandler(async (req, res) => {
  // Extract commentId from request parameters
  const { commentId } = req.params;

  // Delete the comment from the database
  const deleteComment = await Comment.findByIdAndDelete(commentId);

  // If the comment couldn't be deleted, throw an error
  if (!deleteComment)
    throw new ApiError(
      400,
      "There was some problem while deleting your comment"
    );

  // Send a successful response after deleting the comment
  return res
    .status(200)
    .json(new ApiResponce(200, deleteComment, "Comment deleted successfully!"));
});


export { getVideoComments, addComment, updateComment, deleteComment };
