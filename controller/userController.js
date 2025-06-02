import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js";
import {User} from "../models/user.js";
import {v2 as cloudinary} from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from 'crypto';

export const register = catchAsyncErrors( async(req,res,next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Avatar and Resume are Required !" ,400));
    }

    const {avatar , resume} = req.files;

    const cloudinaryResAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {folder:"AVATARS"}
    );

    if(!cloudinaryResAvatar || cloudinaryResAvatar.error){
        console.error("Cloundinary Error :", cloudinaryResAvatar.error || "Unknown Cloudinary Error")
    }

    const cloudinaryResResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {folder:"Resume"}
    );

    if(!cloudinaryResResume || cloudinaryResResume.error){
        console.error("Cloundinary Error :", cloudinaryResResume.error || "Unknown Cloudinary Error")
    }

    const {
        fullName,
        email,
        phone,
        aboutMe,
        password,
        githubURL,
        instagramURL,
        facebookURL,
        twitterURL,
        linkedInURL
    } = req.body;

    const user = await User.create({
        fullName,
        email,
        phone,
        aboutMe,
        password,
        githubURL,
        instagramURL,
        facebookURL,
        twitterURL,
        linkedInURL,
        avatar:{
            public_id:cloudinaryResAvatar.public_id,
            url:cloudinaryResAvatar.secure_url,
        },
        resume:{
            public_id:cloudinaryResResume.public_id,
            url:cloudinaryResResume.secure_url,
        }
    })
    generateToken(user,"User Registered" , 201 , res);
});

export const login = catchAsyncErrors( async(req,res,next) => {
    const {email , password} = req.body || {};
    if(!email || !password){
        return next(new ErrorHandler("Email and Password are Required!"))
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Email or Password"));
    }

    const isPasswordMatched = await user.comparedPassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password"));
    }

    generateToken(user, "Logged In" , 200 , res);
});

export const logout = catchAsyncErrors (async(req,res,next) => {
    res.status(200).cookie("token","",{
        expires:new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message:"Logged Out!",
    })
});

export const getUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });
});

export const updateProfile = catchAsyncErrors(async(req,res,next) => {
    const newUserdata = {
        fullName:req.body.fullName,
        email:req.body.email,
        phone:req.body.phone,
        aboutMe:req.body.aboutMe,
        githubURL:req.body.githubURL,
        instagramURL:req.body.instagramURL,
        facebookURL:req.body.facebookURL,
        twitterURL:req.body.twitterURL,
        linkedInURL:req.body.linkedInURL
    }

    if(req.files && req.files.avatar){
        const avatar = req.files.avatar;
        const user = await User.findById(req.user.id);
        const profileImageId = user.avatar.public_id;
        await cloudinary.uploader.destroy(profileImageId);

        const cloudinaryRes = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            {folder:"AVATARS"}
        );

        newUserdata.avatar = {
            public_id:cloudinaryRes.public_id,
            url:cloudinaryRes.secure_url,
        }
    }

    if(req.files && req.files.resume){
        const resume = req.files.resume;
        const user = await User.findById(req.user.id);
        const resumeId = user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);

        const cloudinaryRes = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {folder:"Resume"}
        );

        newUserdata.resume = {
            public_id:cloudinaryRes.public_id,
            url:cloudinaryRes.secure_url,
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserdata,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
        message:"Profile Updated",
        user,
    })
});

export const updatePassword = catchAsyncErrors( async(req,res,next) => {
    const {currentPassword , newPassword , confirmNewPassword} = req.body || {};

    if(!currentPassword || !newPassword || !confirmNewPassword){
        return next(new ErrorHandler("Please Fill all Fields!",400));
    } 

    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparedPassword(currentPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Incorrect Current Password!",400));
    }

    if(newPassword !== confirmNewPassword){
        return next(new ErrorHandler("New Password and Confirm New Password Does Not Match!",400));
    }

    user.password=newPassword;
    await user.save();


    res.status(200).json({
        success:true,
        message:"Password Updated",
    })
});

export const getPortfolioData = catchAsyncErrors(async(req,res,next) => {
    const user = await User.find();

    res.status(200).json({
        success:true,
        user,
    })
})

export const forgotPassword = catchAsyncErrors(async(req,res,next)=> {

    const {email} = req.body || {};

    const user = await User.findOne({email});
    if(!user){
        return next(new ErrorHandler("User Not Found",404));
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({validateBeforeSave:false});
    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
    const message = `Your Reset Password URL is : \n\n ${resetPasswordUrl} \n\n If You've Not Requested This Kindly Ignore it`;

    try {
        await sendEmail({
            email: user.email,
            subject:"Personal Dashboard Password Recovery",
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully!`,
        })
    } catch (error) {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save();
        return next(new ErrorHandler(error.message,500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Password Token is invalid or has expired", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Password Reset Successfully!",200,res);
});
