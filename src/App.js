import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_CONNECT,
    Credentials: true,
  })
);
app.use(express.json({ limit: "16KB" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16KB",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

import router from "./Route/User.js";
import videoRouter from "./Route/Video.js";
import Playlist from "./Route/Playlist.js";
import subscription from "./Route/Subscription.js";
import Tweet from "./Route/Tweet.js";
import Dashboard from "./Route/Dashboard.js";
import Likes from "./Route/Likes.js";
import Comments from "./Route/Comments.js";
import healthcheck from "./Route/Healthcheck.js";

app.use("/api/V1/users", router);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlist", Playlist);
app.use("/api/v1/Subscription", subscription);
app.use("/api/v1/tweets", Tweet);
app.use("/api/v1/dashboard", Dashboard);
app.use("/api/v1/tweets", Likes);
app.use("/api/v1/tweets", Comments);
app.use("/api/v1/tweets", healthcheck);

export { app };
