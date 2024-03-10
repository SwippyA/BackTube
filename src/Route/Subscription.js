import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../Controller/Subscription.js";
import { verifyJWT } from "../Middleway/Verify.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
