import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js"
import { SoftwareApp } from "../models/softwareApp.js";
import {v2 as cloudinary} from 'cloudinary';

export const addApp = catchAsyncErrors(async(req,res,next,) =>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Software Application Icon Required!" ,400));
    }

    const {icon} = req.files;
    const {name} = req.body;

    if(!name){
        return next(new ErrorHandler("Software Application Name Required!" ,400));    
    }

    const cloudinaryRes = await cloudinary.uploader.upload(
        icon.tempFilePath,
        {folder:"SOFTWARE_APPS"}
    );

    if (!cloudinaryRes || cloudinaryRes.error) {
        console.error("Cloudinary Error:", cloudinaryRes.error || "Unknown Cloudinary Error");
        return next(new ErrorHandler("Failed to upload icon to Cloudinary!", 500));
    }

    const softwareApp = await SoftwareApp.create({
        name,
        icon:{
            public_id:cloudinaryRes.public_id,
            url:cloudinaryRes.secure_url,
        },
    });

    res.status(200).json({
        success:true,
        message:"New Software Application Created!",
        softwareApp,
    })
});

export const deleteApp = catchAsyncErrors(async(req,res,next,) =>{
    const {id} = req.params;
    const softwareApp = await SoftwareApp.findById(id);
    if(!softwareApp){
        return next(new ErrorHandler("Software Application not Found!",404));
    }

    const softwareAppIcon = softwareApp.icon.public_id;
    await cloudinary.uploader.destroy(softwareAppIcon);
    await softwareApp.deleteOne();
    res.status(200).json({
        success:true,
        message:"Software Application Deleted Successfully!",
    })
});

export const getAllApp = catchAsyncErrors(async(req,res,next,) =>{
    const softwareApp = await SoftwareApp.find();
    res.status(200).json({
        success:true,
        softwareApp,
    })
});