import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../Models/Video.js";
import { User } from "../Models/User.js";
import { ApiError } from "../utility/Apierroe.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { uploadOnCloudinary } from "../utility/Fileupload.js";
import { subscribe } from "../Models/Subscribing.js";

const isUserOwner = async (videoId, req) => {
  const video = await Video.findById(videoId);

  if (video?.owner.toString() !== req.user?._id.toString()) {
    return false;
  }

  return true;
};
const addVideoToWatchHistory = async (userId, video) => {
  try {
    // const id ="66842dd792a1d4fd7c2c583f"
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(400, "user not found");
    }
    console.log(video);
    user.watchHistory.push(video);
    await user.save();

    console.log("Video added to watch history successfully");
  } catch (error) {
    console.error("Error adding video to watch history:", error.message);
  }
};
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(200, "the userId is needed");
  }
  const allVideo = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner", // Since $lookup returns an array, unwind it to get a single document
    },
    {
      $project: {
        _id: 1, // Include video _id
        videoFile: 1, // Include videoFile
        thumbnail: 1, // Include thumbnail
        title: 1, // Include title
        description: 1, // Include description
        duration: 1, // Include duration
        views: 1, // Include views
        isPublished: 1, // Include isPublished
        "owner._id": 1, // Include owner _id
        "owner.username": 1, // Include owner username
        "owner.avatar": 1, // Include owner avatar
        createdAt: 1, // Include createdAt
      },
    },
  ]);
  return res
    .status(202)
    .json(new ApiResponse(200, allVideo, "the fetch is complete"));
});
const getAllVideos_of_site = asyncHandler(async (req, res) => {
  const allVideo = await Video.aggregate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner", // Since $lookup returns an array, unwind it to get a single document
    },
    {
      $project: {
        _id: 1, // Include video _id
        videoFile: 1, // Include videoFile
        thumbnail: 1, // Include thumbnail
        title: 1, // Include title
        description: 1, // Include description
        duration: 1, // Include duration
        views: 1, // Include views
        isPublished: 1, // Include isPublished
        "owner._id": 1, // Include owner _id
        "owner.username": 1, // Include owner username
        "owner.avatar": 1, // Include owner avatar
        createdAt: 1, // Include createdAt
      },
    },
  ]);

  return res
    .status(202)
    .json(new ApiResponse(200, allVideo, "the fetch is complete"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const Videolocalpath = await req.files?.videoFile[0]?.path;
  const thumbnaillocalpath = await req.files?.thumbnail[0]?.path;

  const video = await uploadOnCloudinary(Videolocalpath);
  const thumbnail = await uploadOnCloudinary(thumbnaillocalpath);

  if (!video.url) {
    throw new ApiError(400, "Video had not upload in cloud ");
  }
  if (!thumbnail.url) {
    throw new ApiError(400, "thumbnail had not upload in cloud ");
  }

  const vide0_create = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    description,
    duration: video?.duration,
    title,
    isPublished: true,
    owner: req.user?._id,
  });

  if (!vide0_create) {
    throw new ApiError(400, "Video model have not created ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vide0_create, "Video have suessfully created "));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "The ID is not valid");
  }

  const video = await Video.findById(videoId).populate({
    path: "owner",
    select: "username avatar",
    model: "User",
  });

  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  await addVideoToWatchHistory(userId, video);

  const subscriberCount = await subscribe.countDocuments({
    channel: video.owner._id,
  });

  video.__v = subscriberCount || 0;
  video.views += 1;
  await video.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, video, "Fetch successful"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnaillocalpath = req.file?.path;

  const thumbnail = await uploadOnCloudinary(thumbnaillocalpath);
  if (!thumbnail.url) {
    throw new ApiError(400, "the file not upload ");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
        title: title,
        description: description,
      },
    },
    { new: true }
  );

  if (!video || !video?.isPublished) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "the update had done "));

  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "id is incorrect");
  }
  const auth = await isUserOwner(videoId, req);
  if (!auth) {
    throw new ApiError(200, "user not the Proper user ");
  }
  const video = await Video.findByIdAndDelete(videoId);

  return res.status(200).json(new ApiResponse(200, {}, "Delected Succesfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "id is incorrect");
  }
  const auth = await isUserOwner(videoId, req);
  if (!auth) {
    throw new ApiError(200, "user not the Proper user ");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found !");
  }
  video.isPublished = !video.isPublished;
  video.save({ validateBeforeSave: false });

  if (!video) {
    throw new ApiError(400, "video is not update ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "the update had done "));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos_of_site,
};
