import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiError } from "../utility/Apierroe.js";
import { User } from "../Models/User.js";
import { uploadOnCloudinary } from "../utility/Fileupload.js";
import { ApiResponse } from "../utility/ApiRespone.js";





const registerUser = asyncHandler( async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const {fullName, email, username, password } = req.body
  //console.log("email: ", email);

  if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
      $or: [{ username }, { email }]
  })

  if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(avatarLocalPath)
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
  }
  

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
  }
 

  const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email, 
      password,
      username: username.toLowerCase()
  })
  console.log(user);

  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
  )

} )
 
const LoginUser = asyncHandler(async (req , res )=>{

    const {username ,email , password} =req.body;
    if (
        [email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const login_user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!login_user) {
        throw new ApiError(401,"You dont have Accout init!")
    }
    
     const is_valid = await login_user.isPasswordCorrect(password)
     if(!is_valid){
        throw new ApiError(401,"Worng Password !")
     }

     const {accessToken,refreshToken}=  generate_refresh_and_access_token(login_user._id);

     const Loggedin_user = User.findById(login_user._id).select("-password -refreshToken")

     const option ={
        httpOnly:true,
        secure:true
     }
     return res
     .status(200)
     .Cookie("accessToken",accessToken,option)
     .Cookie("refreshToken",refreshToken,option)
     .json(new ApiResponse(201,{
        user:Loggedin_user,accessToken,refreshToken
     },"Sucessfully Login in the APP!"))

    
})

const Logout = asyncHandler(async(req,res)=>{
       const user_id =req.user._id;
       const user = await User.findById(user_id);
       user.refreshToken =null;
       user.save({ValidateBeforeSave:false});

       const option ={
        httpOnly:true,
        secure:true
     }

     return res.status(200).clearCookie("accessToken",accessToken,option).clearCookie("refreshToken",refreshToken,option).json(200,{},"Logged out !")




})


const generate_refresh_and_access_token = (user_id)=>{
    try {
        const user = User.findById(user_id)
        const accessToken =user.generateAccessToken();
        const refreshToken =user.generateRefreshToken();

        user.refreshToken= refreshToken;
        user.save({ValidateBeforeSave:false});
        return {accessToken ,refreshToken}


    } catch (error) {
        throw new ApiError(500 ,"Token not Generate !!")
    }
}
export {
    
    registerUser,
    LoginUser,
    Logout



};