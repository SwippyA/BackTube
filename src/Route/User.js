import { Router } from "express";
import { registerUser ,LoginUser, Logout,RefreshToken} from "../Controller/User.js";
import { upload } from '../Middleway/Multer.js'
import {verifyJWT} from "../Middleway/Verify.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
    router.route("/login").post(LoginUser)
    router.route("/logout").post( verifyJWT , Logout) 
    router.route("/refresh-token").post( RefreshToken ) 


export default router;
