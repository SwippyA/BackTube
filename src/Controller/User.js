import {asyncHandler} from "../utility/AsyHandler.js"

const registerUser = asyncHandler( async (req,res)=>{
    res.status(200).json({
        message:"Hi Shubhankar Swain Here!!"
    })
})

export {registerUser};