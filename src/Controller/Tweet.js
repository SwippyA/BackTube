import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../Models/Tweet.js";
import { User } from "../Models/User.js";
import ApiError from "../utility/Apierroe.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { asyncHandler } from "../utility/AsyHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const content = req.body;
  if (!content) {
    throw new ApiError(402, "the content is needed");
  }
  const tweet = await Tweet.create({
    content,
    owner: req?.user?._id,
  });
  if (!tweet) {
    throw new ApiError(400, "the tweet is not created ");
  }
  return res.status(202).json(new ApiResponse(200, tweet, "the tweet done "));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userid = req.params;
  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userid),
      },
    },
    {
      $group: {
        _id: "owner",
        tweets: { $push: "$content" },
      },
    },
    {
      $project: {
        _id: 0,
        tweets: 1,
      },
    },
  ]);
  if (!tweet) {
    throw new ApiError(200, "the tweet not found ");
  }
  return res.status(200).json(200, tweet, "fetch sucessfully");
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const tweetid = req.params;
  const content = req.body;
  if (!tweetid && !content) {
    throw new ApiError(400, "the parameter is required");
  }
  const tweet = await Tweet.findById(tweetid);
  if (req?.user?._id.tostring() !== tweet.owner.tostring()) {
    throw new ApiError(400, "u can not update this comment ");
  }

  const update_tweet = await Tweet.findByIdAndUpdate(
    tweetid,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );
  if (!tweet) {
    throw new ApiError(400, "the comment is not found");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, update_tweet, "the updatte is done "));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetid } = req.params;
  if (!tweetid) {
    throw new ApiError(400, "id is needed  ");
  }
  const tweet = await Tweet.findById(tweetid);
  if (req?.user?._id.tostring() !== tweet.owner.tostring()) {
    throw new ApiError(400, "u can not update this comment ");
  }
  const delect_tweet = await Tweet.deleteOne(tweetid);
  if (!delect_tweet) {
    throw new ApiError(400, "not delected ");
  }
  return res.status(202).json(200, [], "delected ");
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
