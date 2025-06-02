import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js"
import { Project } from "../models/project.js";
import {v2 as cloudinary} from 'cloudinary';

export const addProject = catchAsyncErrors(async(req,res,next,) =>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Project Image Required!" ,400));
    }

    const {img} = req.files;
    const {title,description,technologies,projectLink,gitRepoLink} = req.body;

    if(!title  || !description || !technologies ){
        return next(new ErrorHandler("Please Provide All Details!" ,400));    
    }

    const cloudinaryRes = await cloudinary.uploader.upload(
        img.tempFilePath,
        {folder:"PORTFOLIO_PROJECT"}
    );

    if(!cloudinaryRes || cloudinaryRes.error){
        console.error("Cloundinary Error :", cloudinaryRes.error || "Unknown Cloudinary Error");
        return next(new ErrorHandler("Failed to upload Image to Cloudinary!", 500));
    }

    const project = await Project.create({
        title,description,technologies,projectLink,gitRepoLink,
        img:{
            public_id:cloudinaryRes.public_id,
            url:cloudinaryRes.secure_url,
        },
    });

    res.status(201).json({
        success:true,
        message:"New Project Added!",
        project,
    })
});

export const deleteProject = catchAsyncErrors(async(req,res,next,) =>{
    const {id} = req.params;
    const project = await Project.findById(id);
    if(!project){
        return next(new ErrorHandler("Project not Found!",404));
    }

    // const projectImg = project.img.public_id;
    // await cloudinary.uploader.destroy(projectImg);

    await project.deleteOne();

    res.status(200).json({
        success:true,
        message:"project Deleted Successfully!",
    })
});

export const updateProject = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    let existingProject = await Project.findById(id);
    if (!existingProject) {
        return next(new ErrorHandler("Project not Found!", 404));
    }

    const { title, description, technologies, projectLink, gitRepoLink } = req.body;

    const newData = {
        title: title || existingProject.title,
        description: description || existingProject.description,
        technologies: technologies || existingProject.technologies,
        projectLink: projectLink || existingProject.projectLink,
        gitRepoLink: gitRepoLink || existingProject.gitRepoLink,
    };

    // If a new image is uploaded
    if (req.files && req.files.img) {
        // Delete old image
        await cloudinary.uploader.destroy(existingProject.img.public_id);

        // Upload new image
        const cloudinaryRes = await cloudinary.uploader.upload(
            req.files.img.tempFilePath,
            { folder: "PORTFOLIO_PROJECT" }
        );

        if (!cloudinaryRes || cloudinaryRes.error) {
            console.error("Cloudinary Error:", cloudinaryRes.error || "Unknown error");
            return next(new ErrorHandler("Failed to upload new image!", 500));
        }

        newData.img = {
            public_id: cloudinaryRes.public_id,
            url: cloudinaryRes.secure_url,
        };
    }

    const updatedProject = await Project.findByIdAndUpdate(id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Project Updated Successfully!",
        project: updatedProject,
    });
});


export const getAllProject = catchAsyncErrors(async(req,res,next,) =>{
    const project = await Project.find();
    res.status(200).json({
        success:true,
        project,
    })
});

export const getProject = catchAsyncErrors(async(req,res,next) =>{
    const {id} = req.params;
    const project = await Project.findById(id);
    if(!project){
        return next(new ErrorHandler("Project not Found!",404));
    }

    res.status(200).json({
        success:true,
        project,
    });
});