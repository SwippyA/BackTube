import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../Models/User.js";
import { subscribe } from "../Models/Subscribing.js";
import { ApiError } from "../utility/Apierroe.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { asyncHandler } from "../utility/AsyHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "the id is required ");
  }
  const userid = req?.user?._id;
  const patten = {
    subscriber: userid,
    channel: channelId,
  };
  const already_subscribed = await subscribe.findOne(patten);
  if (already_subscribed) {
    const unsubscribed = await subscribe.deleteOne(patten);
    if (!unsubscribed) {
      throw new ApiError(400, "the delected is not happened ");
    }
    return res
      .status(202)
      .json(new ApiResponse(200, unsubscribed, "unsubscribed"));
  } else {
    const subscribed = await subscribe.create(patten);
    if (!subscribed) {
      throw new ApiError(400, "subcribed is not done ");
    }
    return res.status(201).json(new ApiResponse(200, subscribed, "Subscribed"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "the id is needed");
  }
  const subscrber = await subscribe.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $group: {
        _id: "channel",
        subscrbers: { $push: "$subscriber" },
      },
    },
    {
      $count: "subscribers",
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  if (!subscrber) {
    throw new ApiError(400, "the subscriber is not found ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subscrber[0], "get my subscriber "));
});
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "The id is needed");
  }

  const channel_subscribed = await subscribe.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users", // Assuming the users collection is named 'users'
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
      },
    },
    {
      $unwind: "$channelDetails",
    },
    {
      $lookup: {
        from: "videos", // Assuming the videos collection is named 'videos'
        let: { ownerId: "$channelDetails._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$owner", "$$ownerId"] } } },
          { $sort: { createdAt: -1 } }, // Sort by the most recent video
          { $limit: 1 }, // Only get the most recent video
        ],
        as: "lastVideo",
      },
    },
    {
      $unwind: {
        path: "$lastVideo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$channelDetails._id",
        username: { $first: "$channelDetails.username" },
        avatar: { $first: "$channelDetails.avatar" },
        lastVideo: { $first: "$lastVideo" }, // Get the last uploaded video
      },
    },
    {
      $project: {
        _id: 0,
        channelId: "$_id",
        username: 1,
        avatar: 1,
        lastVideo: {
          _id:"$lastVideo._id",
          title: "$lastVideo.title",
          uploadDate: "$lastVideo.createdAt",
          views: "$lastVideo.views",
          videoUrl: "$lastVideo.videoFile",
          thumbnail: "$lastVideo.thumbnail",
        },
      },
    },
  ]);

  if (!channel_subscribed.length) {
    throw new ApiError(400, "No subscribed channels found");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, channel_subscribed, "Fetch successful"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
