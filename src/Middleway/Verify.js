import { User } from "../Models/User.js";
import { ApiError } from "../utility/Apierroe.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import {jwt} from "jsonwebtoken"

export const verify = asyncHandler(async (req ,res,next)=>{

    try {
        const token = req.Cookie?.accessToken ||req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(404,"Something Went wrong!")
        }
    
    
    const  check =jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(check._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(404,"Something Went wrong!")
    }
    
    req.user = user ;
    next()
    } catch (error) {
        throw new ApiError(500,"Something went wrong !!")
    }
})