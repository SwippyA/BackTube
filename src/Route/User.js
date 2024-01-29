import {Router} from "express"
import { registerUser } from "../Controller/User.js"
import upload from "../Middleway/Multer.js"
const Route =Router();

Route.route("/register").post(
    upload.field([
        {
            name:avatra,
            maxCount:1
        },
        {
            name:coverimage,
            maxCount:1
        }
    ]),
    registerUser
    )

export default Route;