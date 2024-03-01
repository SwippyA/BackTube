import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../Models/Video.js";
import { User } from "../Models/User.js";
import { ApiError } from "../utility/Apierroe.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { uploadOnCloudinary } from "../utility/Fileupload.js";

const isUserOwner = async (videoId, req) => {
  const video = await Video.findById(videoId);

  if (video?.owner.toString() !== req.user?._id.toString()) {
    return false;
  }

  return true;
};

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
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
  if (!videoId) {
    throw new ApiError(400, "the id is not valid");
  }
  const video = await Video.findById(videoId);

  if (!video || !video?.isPublished) {
    throw new ApiError(404, "Video not found");
  }
  console.log(video);
  return res
    .status(200)
    .json(new ApiResponse(200, video, "fetch Sucessfully "));
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
};
