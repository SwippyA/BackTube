import  express from "express";
import cors from "cors"
import cookieParser from 'cookie-parser'

const app=express();

app.use(cors({
    origin:process.env.CORS_CONNECT,
    Credentials:true
}))
app.use(express.json({limit:"16KB"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16KB"
}))
app.use(express.static("public"))
app.use(cookieParser())


import router from "./Route/User.js";
import videoRouter from "./Route/Video.js"
import Playlist from "./Route/Playlist.js"
import subscription from "./Route/Subscription.js"

app.use("/api/V1/users", router )
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/playlist", Playlist)
app.use("/api/v1/Subscription", subscription)

export {app} ;