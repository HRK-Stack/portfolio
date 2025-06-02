import mongoose from "mongoose";

const softwareAppSchema = mongoose.Schema({
    name:String,
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

export const SoftwareApp = mongoose.model("SoftwareApp",softwareAppSchema) ;