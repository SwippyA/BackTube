import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiError } from "../utility/Apierroe.js";
import { User } from "../Models/User.js";
import { uploadOnCloudinary } from "../utility/Fileupload.js";
import { ApiResponse } from "../utility/ApiRespone.js";

const generate_refresh_and_access_token = async (user_id) => {
    try {
        const user = await User.findById(user_id)
        
        const accessToken =user.generateAccessToken();
        const refreshToken =user.generateRefreshToken();
        // console.log(accessToken);
        // console.log(refreshToken);


         user.refreshToken =  refreshToken;
        //  console.log(user.refreshToken);
         user.save({ validateBeforeSave:false });
         console.log(accessToken);
        //  console.log(refreshToken);
        const obj = {
            accessToken: accessToken,
            refreshToken: refreshToken
        };
        
        // return {accessToken ,refreshToken};
        return obj;


    } catch (error) {
        throw new ApiError(500 ,"Token not Generate !!")
    }
}



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
 
const LoginUser = asyncHandler( async (req , res )=>{

    const {username ,email , password} =req.body;
    if (
        [email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const login_user = await User.findOne({
        $or: [{ username }, { email }]
    })
    // console.log(login_user)

    if(!login_user) {
        throw new ApiError(401,"You dont have Accout init!")
    }
    
     const is_valid = await login_user.isPasswordCorrect(password)
     if(!is_valid){
        throw new ApiError(401,"Worng Password !")
     }
     console.log(login_user._id);
    //  const { accessToken , refreshToken } = generate_refresh_and_access_token(login_user._id);
     const obj = await generate_refresh_and_access_token(login_user._id);
     const refreshToken = obj.refreshToken
    const accessToken = obj.accessToken
     //  const hi = generate_refresh_and_access_token(login_user._id);
    //  console.log(hi);
    //  console.log(generate_refresh_and_access_token(login_user._id))
    //  console.log(accessToken);
    //  console.log(refreshToken);
    // console.log(generate_refresh_and_access_token(login_user._id))
     const Loggedin_user = await User.findById(login_user._id).select("-password -refreshToken")

     const option ={
        httpOnly:true,
        secure:true
     }
    //  console.log(accessToken);
    //  console.log(refreshToken);
     return res
     .status(200)
     .cookie("accessToken",accessToken,option)
     .cookie("refreshToken",refreshToken,option)
     .json(
        new ApiResponse(
            200, 
            {
                user: Loggedin_user, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    );

    
})

const Logout = asyncHandler(async(req,res)=>{
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))




})

// console.log(generate_refresh_and_access_token)

export {
    
    registerUser,
    LoginUser,
    Logout



};