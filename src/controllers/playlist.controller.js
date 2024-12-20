import mongoose, { isValidObjectId } from "mongoose"; 
import { Playlist } from "../models/playlist.models.js"; 
import { ApiError } from "../utils/ApiErrors.js"; 
import { ApiResponce } from "../utils/ApiResponse.js"; 
import { asyncHandler } from "../utils/asyncHandler.js"; 
import { Video } from "../models/video.models.js"; 

// Function to create a playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body; // Extract name and description from the request body
  // Validate that name and description are provided
  if (!name || !description)
    throw new ApiError(404, "Playlist name or description missing");

  // Create a new playlist in the database
  const createdPlaylist = await Playlist.create({
    name: name,
    description: description,
    videos: [], // Start with an empty list of videos
    owner: new mongoose.Types.ObjectId(req.user._id), // Set the owner as the currently authenticated user
  });

  // Check if playlist creation failed
  if (!createdPlaylist) throw new ApiError(400, "Could not create playlist");

  // Return the created playlist with a success message
  return res
    .status(200)
    .json(
      new ApiResponce(200, createdPlaylist, "Playlist created successfully")
    );
});

// Function to fetch all playlists of a specific user
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters

  // Validate the userId
  if (!userId || !isValidObjectId(userId))
    throw new ApiError(400, "Invalid user ID");

  // Aggregate to fetch playlists belonging to the user
  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId), // Match playlists owned by the user
      },
    },
    {
      $lookup: {
        from: "videos", // Lookup for the 'videos' collection to retrieve associated videos
        localField: "videos", // Use the 'videos' field in the playlist
        foreignField: "_id", // Match it with the _id field of videos
        as: "playlistVideos", // Store the result in 'playlistVideos'
        pipeline: [
          {
            $match: {
              isPublished: true, // Only include published videos
            },
          },
        ],
      },
    },
  ]);

  // If no playlists are found, throw an error
  if (!userPlaylists) throw new ApiError(400, "Could not fetch user playlists");

  // Return the user's playlists with a success message
  return res.status(200).json(
    new ApiResponce(
      200,
      userPlaylists,
      "User playlists fetched successfully!"
    )
  );
});

// Function to fetch a playlist by its ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params; // Extract playlistId from the request parameters

  // Validate the playlistId
  if (!playlistId || !isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  // Aggregate to fetch the playlist by ID, including associated videos and video owners
  const fetchedPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId), // Match the playlist by its ID
      },
    },
    {
      $lookup: {
        from: "videos", // Lookup for videos associated with the playlist
        localField: "videos", // Use the 'videos' field in the playlist
        foreignField: "_id", // Match with video IDs
        as: "playlistVideos", // Store the result as 'playlistVideos'
        pipeline: [
          {
            $lookup: {
              from: "users", // Lookup for the 'users' collection to fetch video owner info
              localField: "owner", // Use the 'owner' field in videos
              foreignField: "_id", // Match it with user IDs
              as: "videoOwner", // Store the result as 'videoOwner'
              pipeline: [
                {
                  $project: {
                    username: 1, // Only include the username of the video owner
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
        playlistVideoCount: {
          $size: "$playlistVideos", // Add a field to show the number of videos in the playlist
        },
      },
    },
  ]);

  // If playlist not found, throw an error
  if (!fetchedPlaylist || !fetchedPlaylist.length)
    throw new ApiError(404, "Playlist not found");

  // Return the fetched playlist with a success message
  return res
    .status(200)
    .json(
      new ApiResponce(200, fetchedPlaylist, "Playlist fetched successfully!")
    );
});

// Function to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params; // Extract playlistId and videoId from request parameters

  // Validate the playlistId and videoId
  if (!playlistId || !videoId)
    throw new ApiError(404, "Playlist ID or Video ID is missing");

  // Check if the video exists
  const fetchedVideo = await Video.findById(videoId);
  if (!fetchedVideo) throw new ApiError(404, "Requested video not found");

  // Check if the playlist exists
  const fetchedPlaylist = await Playlist.findById(playlistId);
  if (!fetchedPlaylist) throw new ApiError(404, "Playlist not found");

  // Add the video to the playlist if it is not already included
  if (!fetchedPlaylist.videos.includes(fetchedVideo._id)) {
    const videoAddedToPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          videos: fetchedVideo, // Push the video to the playlist's 'videos' array
        },
      },
      {
        new: true,
      }
    );

    // If adding the video failed, throw an error
    if (!videoAddedToPlaylist)
      throw new ApiError(500, "Could not add the video to the playlist");
  }

  // Return a success message with the updated playlist
  return res.status(200).json(
    new ApiResponce(
      200,
      {
        "Video added to the playlist: ": fetchedVideo,
      },
      "Video added to the playlist successfully!"
    )
  );
});

// Function to remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params; // Extract playlistId and videoId from request parameters

  // Validate the playlistId and videoId
  if (!playlistId || !isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist link");
  if (!videoId || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video link");

  // Check if the playlist exists
  const fetchedPlaylist = await Playlist.findById(playlistId);
  if (!fetchedPlaylist) throw new ApiError(404, "Playlist not found");

  // If playlist is empty, throw an error
  if (fetchedPlaylist.videos.length === 0)
    throw new ApiError(400, "Playlist is empty");

  // Check if the video exists in the playlist
  let isVideoPresent = false;
  isVideoPresent = fetchedPlaylist.videos.some((video) => video.equals(videoId));

  // If the video is not in the playlist, throw an error
  if (!isVideoPresent)
    throw new ApiError(404, "Video does not exist in the playlist");

  // Remove the video from the playlist
  const videoRemovedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId), // Pull (remove) the video from the playlist
      },
    },
    {
      new: true,
    }
  );
  // If video removal fails, throw an error
  if (!videoRemovedPlaylist)
    throw new ApiError(400, "Could not remove video from the playlist");

  // Return a success message with the updated playlist
  return res.status(200).json(
    new ApiResponce(
      200,
      {
        "updatedPlaylist: ": videoRemovedPlaylist,
      },
      "Video removed from playlist successfully!"
    )
  );
});

// Function to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params; // Extract playlistId from request parameters

  // Validate the playlistId
  if (!playlistId || !isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  // Delete the playlist from the database
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  // If deletion fails, throw an error
  if (!deletedPlaylist)
    throw new ApiError(400, "Could not delete the playlist");

  // Return a success message indicating the playlist has been deleted
  return res
    .status(200)
    .json(
      new ApiResponce(200, deletedPlaylist, "Playlist deleted successfully!")
    );
});

// Function to update playlist details
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params; // Extract playlistId from request parameters
  const { name, description } = req.body; // Extract name and description from the request body

  // Validate the playlistId
  if (!playlistId || !isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  // Validate the name and description
  if (!name && !description)
    throw new ApiError(404, "Name and description are missing");

  // Update the playlist with the new name and/or description
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      $new: true,
    }
  );

  // If update fails, throw an error
  if (!updatedPlaylist) throw new ApiError(500, "Could not update playlist");

  // Return the updated playlist with a success message
  return res
    .status(200)
    .json(
      new ApiResponce(200, updatedPlaylist, "Playlist updated successfully!")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
