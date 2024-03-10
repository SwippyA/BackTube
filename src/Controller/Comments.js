import mongoose from "mongoose";
import { Comment } from "../Models/Comments.js";
import { ApiError } from "../utility/Apierroe.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiResponse } from "../utility/ApiRespone.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(200, "the videoId is required");
  }
  const { page = 1, limit = 10 } = req.query;
  const comments_aggg = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          fullName: 1,
          avatar: 1,
        },
        isLiked: 1,
      },
    },
  ]);
  if (!comments_aggg) {
    throw new ApiError(400, "the video is not found");
  }

  // const options = {
  //   page: parseInt(page, 10),
  //   limit: parseInt(limit, 10),
  // };
  // const comments = await Comment.aggregatePaginate(comments_aggg, options);

  if (!comments_aggg && comments_aggg === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "the fetch was successful"));
  }
  // console.log(comments);
  return res
    .status(200)
    .json(new ApiResponse(200, comments_aggg, "the fetch was successful"));
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
