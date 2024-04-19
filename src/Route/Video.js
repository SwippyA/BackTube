import { Router } from "express";
import { upload } from "../Middleway/Multer.js";
import { verifyJWT } from "../Middleway/Verify.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  getAllVideos_of_site
} from "../Controller/Video.js";
const router = Router();

router.use(verifyJWT);
router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);
  

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);


export default router;
