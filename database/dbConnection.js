import mongoose from "mongoose";

const dbConnection = () =>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"PORTFOLIO"
    }).then(() => {
        console.log("Connected to database");
    }).catch((err) => {
        console.log(`Some Error Occured While Connecting to Database : ${err}`);
    })
}

export default dbConnection;