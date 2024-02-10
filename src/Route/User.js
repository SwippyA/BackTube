import { Router } from "express";
import {
  registerUser,
  LoginUser,
  Logout,
  RefreshToken,
  changePassword,
  updateUserCoverImage,
  updateUserAvatar,
  updateAccountDetails,
  getCurrentUser,
  userProfile,
  getWatchHistory,
} from "../Controller/User.js";
import { upload } from "../Middleway/Multer.js";
import { verifyJWT } from "../Middleway/Verify.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(LoginUser);
router.route("/logout").post(verifyJWT, Logout);
router.route("/refreshtoken").post( RefreshToken );

router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, userProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
