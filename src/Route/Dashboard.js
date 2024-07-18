import { Router } from "express";
import { getChannelStats, getChannelVideos,getChannelStatsById,getChannelVideosByID } from "../Controller/Dashboard.js";
import { verifyJWT } from "../Middleway/Verify.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/stats/:id").get(getChannelStatsById);
router.route("/videos").get(getChannelVideos);
router.route("/videos/:id").get(getChannelVideosByID);

export default router;
