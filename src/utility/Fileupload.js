import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"

// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env.api_key, 
  api_secret: process.env.api_secret 
});

const UploadFile = async(LocalFilepath) =>{
    try{
        if(!LocalFilepath) return null;
        const Upload = await cloudinary.uploader.upload(LocalFilepath,{
            resource_type:'auto'
        })
        console.log("File have been uploaded :",Upload.url);
        return Upload;
    }
    catch{
        fs.unlinkSync(LocalFilepath);
        return null;
    }
}

export {UploadFile};