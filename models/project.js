import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
    title:String,
    description:String,
    gitRepoLink:String,
    projectLink:String,
    technologies:String,
    img:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
    },
});

export const Project = mongoose.model("project",projectSchema) ;