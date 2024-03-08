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
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId) {
    throw new ApiError(400, "the videoID id required");
  }
  if (!content) {
    throw new ApiError(400, "the content  id required");
  }
  const comment = await Comment.create({
    content: content,
    video: videoId,
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
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(200, "the ID is necessary");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(402, "the comment is not find ");
  }
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(300, "Unauthorized Access");
  }
  const delected_comment = await Comment.deleteOne(comment);
  return res
    .status(201)
    .json(new ApiResponse(200, delected_comment, "delected sucessfully "));
});

export { getVideoComments, addComment, deleteComment };
