import mongoose from "mongoose";
import { Video } from "../Models/Video.js";
// import { subscribe } from "../Models/Subscribing.js";
// import { Like } from "../Models/Likes.js";
import { ApiError } from "../utility/Apierroe.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiResponse } from "../utility/ApiRespone.js";
// import { getUserChannelSubscribers } from "../Controller/Subscription.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  try {
    const channelStat = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "Likes",
        },
      },
      {
        $lookup: {
          from: "subscribes",
          localField: "owner",
          foreignField: "channel",
          as: "Subscribers",
        },
      },
      {
        $group: {
          _id: null,
          TotalVideos: { $sum: 1 },
          TotalViews: { $sum: "$views" },
          TotalSubscribers: { $first: { $size: "$Subscribers" } },
          TotalLikes: { $first: { $size: "$Likes" } },
        },
      },
      {
        $project: {
          _id: 0,
          TotalSubscribers: 1,
          TotalLikes: 1,
          TotalVideos: 1,
          TotalViews: 1,
        },
      },
    ]);

    if (!channelStat) {
      throw new ApiError(500, "Unable to fetch the channel stat!");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channelStat[0],
          "Channel Stat fetched Successfully"
        )
      );
  } catch (e) {
    throw new ApiError(
      500,
      e?.message || "Unable to fetch the channelm stat!!"
    );
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req?.user?._id;

  const videos = await Video.find({ owner: userId });
  if (videos == 0 || !videos) {
    return res
      .status(201)
      .json(new ApiResponse(200, videos, "the channel dont have any video"));
  }
  return res
    .status(201)
    .json(new ApiResponse(200, videos, "Fetch successfully "));
});

export { getChannelStats, getChannelVideos };
