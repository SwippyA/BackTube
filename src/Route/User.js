import { Router } from "express";
import {
  registerUser,
  LoginUser,
  Verify_email,
  ForgotPassword,
  Logout,
  RefreshToken,
  changePassword,
  getUserById,
  updateUserCoverImage,
  updateUserAvatar,
  updateAccountDetails,
  getCurrentUser,
  userProfile,
  getWatchHistory,
} from "../Controller/User.js";
import { upload } from "../Middleway/Multer.js";
import { verifyJWT } from "../Middleway/Verify.js";
import { getAllVideos_of_site } from "../Controller/Video.js";

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
// router.route("/register").post(
//   upload.single("avatar"),
//   registerUser
// );
router.route("/all_Videos").get(getAllVideos_of_site);
router.route("/login").post(LoginUser);
router.route("/email").post(Verify_email);
router.route("/Forget_password/:id").post(ForgotPassword);
router.route("/logout").post(verifyJWT, Logout);
router.route("/refreshtoken").post(RefreshToken);

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
router.route("/userGetById/:id").get(verifyJWT, getUserById);

export default router;
