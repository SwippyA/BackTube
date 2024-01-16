import mongoose from "mongoose";
import {Database_Name} from "../Constants.js"

 let  Connection_db = async ()=>{
    try{
        const Connect_current =await mongoose.connect(`${process.env.MONGOODB_URI}/${Database_Name}`);
        console.log(Connect_current.connection.host);
    }
    catch (error){
        console.error(`"The Connection Errorr"${error}`);
        process.exit(1)
    }
};
export default Connection_db;
