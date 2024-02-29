import mongoose from "mongoose"
import {Video} from "../Models/Video.js"
import {subscribe} from "../Models/Subscribing.js"
import {Like} from "../Models/Likes.js"
import { ApiError } from "../utility/Apierroe.js"
import { asyncHandler } from "../utility/AsyHandler.js"
import { ApiResponse } from "../utility/ApiRespone.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }