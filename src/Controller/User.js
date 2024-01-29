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

  const avatarlocalpath = req.files?.avatar[0]?.path;
  const coverImagelocalpath = req.files?.coverImage[0]?.path;
  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatra Must reqired!!");
  }
  const avatar = await UploadFile(avatarlocalpath);
  const coverimage = await UploadFile(coverImagelocalpath);
  if (!avatar) {
    throw new ApiError(400, "Avatra Must reqired!!");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverimage.url  || "",
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
