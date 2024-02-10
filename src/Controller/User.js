import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiError } from "../utility/Apierroe.js";
import { User } from "../Models/User.js";
import { uploadOnCloudinary } from "../utility/Fileupload.js";
import { ApiResponse } from "../utility/ApiRespone.js";

import Jwt from "jsonwebtoken";

const generate_refresh_and_access_token = async (user_id) => {
  try {
    const user = await User.findById(user_id);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    user.save({ validateBeforeSave: false });
    console.log(accessToken);

    const obj = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    return obj;
  } catch (error) {
    throw new ApiError(500, "Token not Generate !!");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(avatarLocalPath);
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  console.log(user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const LoginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const login_user = await User.findOne({
    $or: [{ username }, { email }],
  });
  // console.log(login_user)

  if (!login_user) {
    throw new ApiError(401, "You dont have Accout init!");
  }

  const is_valid = await login_user.isPasswordCorrect(password);
  if (!is_valid) {
    throw new ApiError(401, "Worng Password !");
  }
  console.log(login_user._id);
  //  const { accessToken , refreshToken } = generate_refresh_and_access_token(login_user._id);
  const obj = await generate_refresh_and_access_token(login_user._id);
  const refreshToken = obj.refreshToken;
  const accessToken = obj.accessToken;
  //  const hi = generate_refresh_and_access_token(login_user._id);
  //  console.log(hi);
  //  console.log(generate_refresh_and_access_token(login_user._id))
  //  console.log(accessToken);
  //  console.log(refreshToken);
  // console.log(generate_refresh_and_access_token(login_user._id))
  const Loggedin_user = await User.findById(login_user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  //  console.log(accessToken);
  //  console.log(refreshToken);
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: Loggedin_user,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const Logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const RefreshToken = asyncHandler(async (req, res) => {
  try {
    const oldrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!oldrefreshToken) {
      throw new ApiError(401, "The resfresh token is not Correct !!");
    }
    const decoded = Jwt.verify(
      oldrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(401, "The user is not Found ");
    }
    if (oldrefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Expiry");
    }
    const { accessToken, newRefreshtoken } =
      await generate_refresh_and_access_token(user._id);
    const option = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshtoken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshtoken },
          "AccessToken is generated !! "
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});
const changePassword = asyncHandler(async (res, req) => {
  const { oldpassword, newpassword } = req.body;
  const user = await User.findById(req.user._id);
  const true_false = user.isPasswordCorrect(user._id);
  if (!true_false) {
    throw new ApiError(401, "password doesnot match ");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res.status(201).json(new ApiResponse(201, {}, "Password is changed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  //TODO: delete old image - assignment

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
const userProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim) {
    throw new ApiError(401, "the username is not correct !");
  }
  const channel = User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscribes",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      $lookup: {
        from: "subscribes",
        localField: "_id",
        foreignField: "subscriber",
        as: "channel_subscribed",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$Subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$channel_subscribed",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$Subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
});


const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})
// console.log(generate_refresh_and_access_token)

export {
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
  getWatchHistory
};
