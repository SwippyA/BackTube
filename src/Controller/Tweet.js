import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../Models/Tweet.js"
import {User} from "../Models/User.js"
import ApiError from "../utility/Apierroe.js"
import {ApiResponse} from "../utility/ApiRespone.js"
import {asyncHandler} from "../utility/AsyHandler.js"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}