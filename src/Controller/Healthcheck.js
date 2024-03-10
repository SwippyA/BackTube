import { ApiError } from "../utility/Apierroe.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { ApiResponse } from "../utility/ApiRespone.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  return res.status(200).json(new ApiResponse(200,[],"the app is running without any error"))
});

export { healthcheck };
