import {Router} from "express"
import { registerUser } from "../Controller/User.js"

const Route =Router();

Route.route("/register").post(registerUser)

export default Route;