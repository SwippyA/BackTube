import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../Models/Likes.js";
import { ApiError } from "../utility/Apierroe.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { Video } from "../Models/Video.js";
import { Comment } from "../Models/Comments.js";
import { Tweet } from "../Models/Tweet.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(402, "the video is needed");
  }
  const video = await Video.findById(videoId);
  if (!video && !video.isPublished) {
    throw new ApiError(400, "the video is not found ");
  }
  const like_patten = { video: videoId, likedBy: req.user?._id };

  const already_liked = await Like.findOne(like_patten);
  console.log(already_liked);
  if (already_liked) {
    const delected_like = await Like.deleteOne(like_patten);

    if (!delected_like) {
      throw new ApiError(400, "the like not toggle");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, delected_like, "disliked "));
  }

  const new_like = await Like.create(like_patten);
  // console.log(new_like);
  if (!new_like) {
    throw new ApiError(400, "the like not toggle");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, new_like, "the liked done "));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(402, "the comment is needed");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "the Comment  is not found ");
  }
  const like_patten = { comment: commentId, likedBy: req?.user?._id };
  const already_liked = await Like.findOne(like_patten);
  if (!already_liked) {
    const new_like = await Like.create(like_patten);
    if (!new_like) {
      throw new ApiError(400, "the like not toggle");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, new_like, "the liked done "));
  }
  else{
    const delected_like = await Like.deleteOne(like_patten);
  if (!delected_like) {
    throw new ApiError(400, "the like not toggle");
  }
  return res
  .status(200)
  .json(new ApiResponse(200, delected_like, "disliked "));
  }
  
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(402, "the tweetid is needed");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "the Comment  is not found ");
  }
  const like_patten = { tweet: tweetId, likedBy: req?.user?._id };
  const already_liked = await Like.findOne(like_patten);
  if (!already_liked) {
    const new_like = await Like.create(like_patten);
    if (!new_like) {
      throw new ApiError(400, "the like not toggle");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, new_like, "the liked done "));
  } else {
    const delected_like = await Like.deleteOne(like_patten);
    if (!delected_like) {
      throw new ApiError(400, "the like not toggle");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, delected_like, "disliked "));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
