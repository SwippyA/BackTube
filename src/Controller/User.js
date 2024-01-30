import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiError } from "../utility/Apierroe.js";
import { User } from "../Models/User.js";
import { UploadFile } from "../utility/Fileupload.js";
import { ApiResponse } from "../utility/ApiRespone.js";
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  console.log(email);
  console.log(password);
  [(username, email, fullName, password)].map((field) => {
    if (field === "" && field == null) {
      throw new ApiError(400, `${field} is must required !!`);
    }
  });
  const Existed = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (Existed) {
    throw new ApiError(409, "This Email and user is already Exist !!");
  }
 
  console.log(req.files);
  const avatarLocalPath = await req.files && req.files.avatar && req.files.avatar[0] ? req.files.avatar[0].path : null;
  let coverImageLocalPath;
 

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatra Must reqired!!");
  }
  const avatar = await UploadFile(avatarLocalPath);
  const coverimage = await UploadFile(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatra Must reqired!!");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverimage.url || "",
    password,
  });

  const Creared_user = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!Creared_user) {
    throw new ApiError(500, "Server Error!!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, Creared_user, "Registation is Sucess "));
});

export { registerUser };
