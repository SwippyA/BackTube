import mongoose from "mongoose";
import {Schema} from "mongoose"
const subscribeSchema = new Schema({
    subscriber:{
        
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps:true
})

export const subscribe =mongoose.model("subscribe", subscribeSchema)