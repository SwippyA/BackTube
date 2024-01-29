import { Router } from "express";
import { registerUser } from "../Controller/User.js";
import { upload } from '../Middleway/Multer.js'

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


export default router;
