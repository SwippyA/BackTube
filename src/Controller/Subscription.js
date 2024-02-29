import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../Models/User.js"
import { subscribe } from "../Models/Subscribing.js"
import {ApiError} from "../utility/Apierroe.js"
import {ApiResponse} from "../utility/ApiRespone.js"
import {asyncHandler} from "../utility/AsyHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}