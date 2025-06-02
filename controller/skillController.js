import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js"
import { Skill } from "../models/skill.js";
import {v2 as cloudinary} from 'cloudinary';

export const addSkill = catchAsyncErrors(async(req,res,next,) =>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Skill Icon Required!" ,400));
    }

    const {icon} = req.files;
    const {title,proficiency} = req.body;

    if(!title || !proficiency){
        return next(new ErrorHandler("Skill Title and Proficiency Required!" ,400));    
    }

    const cloudinaryRes = await cloudinary.uploader.upload(
        icon.tempFilePath,
        {folder:"SKILL"}
    );

    if (!cloudinaryRes?.secure_url || cloudinaryRes?.error) {
        console.error("Cloudinary Error:", cloudinaryRes?.error || "Unknown error");
        return next(new ErrorHandler("Failed to upload icon to Cloudinary!", 500));
    }


    const skill = await Skill.create({
        title,
        proficiency,
        icon:{
            public_id:cloudinaryRes.public_id,
            url:cloudinaryRes.secure_url,
        },
    });

    res.status(200).json({
        success:true,
        message:"New Skill Added!",
        skill,
    })
});

export const deleteSkill = catchAsyncErrors(async(req,res,next,) =>{
    const {id} = req.params;
    const skill = await Skill.findById(id);
    if(!skill){
        return next(new ErrorHandler("Skill not Found!",404));
    }

    const skillIcon = skill.icon.public_id;
    await cloudinary.uploader.destroy(skillIcon);
    await skill.deleteOne();
    res.status(200).json({
        success:true,
        message:"Skill Deleted Successfully!",
    })
});

export const updateSkill = catchAsyncErrors(async(req,res,next,) =>{
    const {id} = req.params;
    let skill = await Skill.findById(id);
    if(!skill){
        return next(new ErrorHandler("Skill not Found!",404));
    }

    const {proficiency} = req.body || {};
    if(!proficiency){
        return next(new ErrorHandler("Proficiency Required!",400));
    }

    skill = await Skill.findByIdAndUpdate(id,{proficiency},{
        new:true,
        runValidators:true,
    });

    res.status(200).json({
        success:true,
        message:"Skill Updated Successfully!",
        skill,
    })

});

export const getAllSkill = catchAsyncErrors(async(req,res,next,) =>{
    const skill = await Skill.find();
    res.status(200).json({
        success:true,
        skill,
    })
});