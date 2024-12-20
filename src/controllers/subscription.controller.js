import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Controller to toggle subscription status of a user to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
  // Extract channelId from the request parameters
  const { channelId } = req.params;
  
  // If channelId is not provided, throw a bad request error
  if (!channelId) throw new ApiError(400, "Invalid Channel Link");

  // Find the channel (user) by its ID in the database
  const fetchedChannel = await User.findById(channelId);
  if (!fetchedChannel) throw new ApiError(404, "Channel not found");

  // Check if the user is already subscribed to this channel
  const isSubscribedToChannel = await Subscription.findOne(
    {
      subscriber: req.user._id, // The logged-in user is the subscriber
      channel: new mongoose.Types.ObjectId(channelId), // The channel the user is subscribed to
    }
  );
  
  // If the user is already subscribed, remove the subscription (unsubscribe)
  if (isSubscribedToChannel) {
    await Subscription.findByIdAndDelete(isSubscribedToChannel._id);
  } else {
    // If the user is not subscribed, create a new subscription
    const subscribeToChannel = await Subscription.create({
      subscriber: req.user._id,
      channel: new mongoose.Types.ObjectId(channelId), // Create a subscription linking the user to the channel
    });
    if (!subscribeToChannel)
      throw new ApiError(500, "Failed to subscribe to channel");

    // Log the subscription details for debugging purposes
    console.log(subscribeToChannel);
  }

  // Send a successful response indicating subscription status change
  return res.status(200).json(
    new ApiResponce(
      200,
      {
        "Subscribed/Unsubscribed to/from channel: ": fetchedChannel, // Include the channel details in the response
      },
      "Successfully subscribed/unsubscribed to channel"
    )
  );
});

// Controller to fetch a list of subscribers for a given channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // Extract channelId from the request parameters
  const { channelId } = req.params;

  // If channelId is not provided, throw a bad request error
  if (!channelId) throw new ApiError(400, "Invalid channel link");

  // Use MongoDB aggregation to get the list of subscribers for the given channel
  const userChannelSubsribers = await Subscription.aggregate([
    {
      $match: {
        // Match subscriptions where the channel is the specified channelId
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        // Join the Subscription collection with the Users collection to get details of subscribers
        from: "users", // The 'users' collection
        localField: "subscriber", // The subscriber field in Subscription
        foreignField: "_id", // The _id field in the Users collection
        as: "channelSubscribers", // Name of the array where subscriber details will be stored
        pipeline: [
          {
            $project: {
              fullname: 1, // Include the fullname of the subscriber
              username: 1, // Include the username of the subscriber
              avatar: 1, // Include the avatar of the subscriber
            },
          },
        ],
      },
    },
    {
      $addFields: {
        // Add a new field to store the count of subscribers
        channelSubscriberCount: {
          $size: "$channelSubscribers", // Get the size of the array of subscribers
        },
      },
    },
  ]);

  // If no subscribers found, throw a not found error
  if (!userChannelSubsribers) throw new ApiError(404, "Channel not found");

  // Send a successful response with the list of subscribers
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        userChannelSubsribers,
        "Channel subscribers fetched successfully!" // Success message
      )
    );
});

// Controller to fetch the list of channels that a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
  // Extract subscriberId from the request parameters
  const { subscriberId } = req.params;

  // If subscriberId is not provided, throw a bad request error
  if (!subscriberId) throw new ApiError(400, "Invalid subscriber link");

  // Use MongoDB aggregation to get the list of channels a user has subscribed to
  const userChannelsSubscribedTo = await Subscription.aggregate([
    {
      $match: {
        // Match subscriptions where the subscriber is the specified subscriberId
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        // Join the Subscription collection with the Users collection to get details of channels
        from: "users", // The 'users' collection
        localField: "channel", // The channel field in Subscription
        foreignField: "_id", // The _id field in the Users collection
        as: "channelUserSubscribedTo", // Name of the array where channel details will be stored
        pipeline: [
          {
            $project: {
              fullname: 1, // Include the fullname of the channel
              username: 1, // Include the username of the channel
              avatar: 1, // Include the avatar of the channel
            },
          },
        ],
      },
    },
    {
      $addFields: {
        // Add a new field to store the count of channels subscribed to
        channelsSubscribedCount: {
          $size: "$channelUserSubscribedTo", // Get the size of the array of channels
        },
      },
    },
  ]);

  // If no subscribed channels found, throw a not found error
  if (!userChannelsSubscribedTo)
    throw new ApiError(404, "Subscriber not found");

  // Send a successful response with the list of subscribed channels
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        userChannelsSubscribedTo,
        "Channels subscribed fetched successfully!" // Success message
      )
    );
});

// Export the controllers so they can be used in routes
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
