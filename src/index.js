
// require('dotenv').config({path:'./env'})


import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB().then(() => app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT}`)
})).catch((err) => console.log(err))





























// import express from "express";
// const app = express();
// (async () => {
//         try {
//             await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             app.on("error", (err) => {
//                 console.log("err:", err);
//                 throw err;
//             })
//             app.listen(process.env.PORT, () => {
//                 console.log(`Server is running in the port ${process.env.PORT}`)
//             })
//         } catch (err) {
//             console.error("ERROR:", err);
//             throw err;
//         }
//     })()