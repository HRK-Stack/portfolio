import mongoose from "mongoose";

const skillSchema = mongoose.Schema({
    title:String,
    proficiency:String,
    icon:{
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

export const Skill = mongoose.model("Skill",skillSchema) ;