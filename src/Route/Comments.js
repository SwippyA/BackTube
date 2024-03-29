import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
} from "../Controller/Comments.js";
import { verifyJWT } from "../Middleway/Verify.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment);

export default router;
