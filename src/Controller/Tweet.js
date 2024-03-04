import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../Models/Tweet.js";
import { User } from "../Models/User.js";
import { ApiError } from "../utility/Apierroe.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { asyncHandler } from "../utility/AsyHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const userid = req?.user?._id;
  if (!content) {
    throw new ApiError(402, "the content is needed");
  }
  const tweet = await Tweet.create({
    content: content,
    owner: userid,
  });
  if (!tweet) {
    throw new ApiError(400, "the tweet is not created ");
  }
  // console.log(tweet)
  return res.status(202).json(new ApiResponse(200, tweet, "the tweet done"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is Required!!!");
  }
  try {
    const tweet = await Tweet.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
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
    if (!tweet || tweet.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "User have no tweets"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, tweet, "Tweet for the user fetched successfully!")
      );
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to fetch tweets");
  }
});

// const updateTweet = asyncHandler(async (req, res) => {
//   //TODO: update tweet
//   const { tweetid } = req.params;
//   const { content } = req.body;
//   console.log(tweetid);

//   if(!tweetid){
//     throw new ApiError(400,"tweetId is required!!")
// }
// if(!content){
//     throw new ApiError(400,"TweetContent is required!!")
// }
//   const tweet = await Tweet.findById(tweetid);
//   console.log(tweet);
//   if (!tweet) {
//     throw new ApiError(400, "the tweet is not there ");
//   }
//   if (tweet.owner.toString() !== req.user?._id.toString()) {
//     throw new ApiError(400, "u can not update this comment ");
//   }

//   const update_tweet = await Tweet.findByIdAndUpdate(
//     tweetid,
//     {
//       $set: {
//         content: content,
//       },
//     },
//     {
//       new: true,
//     }
//   );
//   if (!update_tweet) {
//     throw new ApiError(400, "the comment is not found");
//   }
//   return res
//     .status(201)
//     .json(new ApiResponse(200, update_tweet, "the updatte is done "));
// });

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { tweetContent } = req.body;
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required!!");
  }
  if (!tweetContent) {
    throw new ApiError(400, "TweetContent is required!!");
  }
  try {
    const existingTweet = await Tweet.findById(tweetId);
    if (!existingTweet) {
      throw new ApiError(404, "Tweet doesn't exist");
    }
    //user is owner or not
    if (existingTweet.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(300, "Unuthorized Access");
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content: tweetContent,
        },
      },
      {
        new: true,
      }
    );
    if (!updatedTweet) {
      throw new ApiError(500, "Unable to update tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated Successfully"));
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to update tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  console.log(tweetId);
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required!!");
  }

  try {
    const existingTweet = await Tweet.findById(tweetId);
    if (!existingTweet) {
      throw new ApiError(404, "Tweet doesn't exist");
    }
    //user is owner or not
    if (existingTweet.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(300, "Unuthorized Access");
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
      throw new ApiError(500, "Unable to delete tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet deleted Successfully"));
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to delete tweet");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
