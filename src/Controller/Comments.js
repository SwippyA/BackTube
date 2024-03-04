import mongoose from "mongoose";
import { Comment } from "../Models/Comments.js";
import { ApiError } from "../utility/Apierroe.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiResponse } from "../utility/ApiRespone.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const videoID = req.params;
  const { content } = req.body;
  if (!videoID) {
    throw new ApiError(400, "the videoID id required");
  }
  if (!content) {
    throw new ApiError(400, "the content  id required");
  }
  const comment = await Comment.create({
    content: content,
    video: videoID,
    owner: req?.user?._id,
  });
  if (!comment) {
    throw new ApiError(400, "the comment is not created");
  }
  return res
    .status(202)
    .json(new ApiResponse(200, comment, "The Comment is done "));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const commentID = req.params;
  if (!commentID) {
    throw new ApiError(200, "the ID is necessary");
  }
  const comment = await Comment.findById(commentID);
  if (!comment) {
    throw new ApiError(402, "the comment is not find ");
  }
  if (comment.owner.tostring() !== req?.user._id.tostring()) {
    throw new ApiError(402, "You can't delect the comment ");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, [], "delected sucessfully "));
});

export { getVideoComments, addComment, deleteComment };
