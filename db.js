const mongoose = require("mongoose");

const mongoURL= process.env.mongoURL;

mongoose.set('strictQuery', false);

const connectToMongo = ()=>{
    mongoose.connect(mongoURL, ()=>{
        console.log("connected to mongoose sucessfully")
    })
}

module.exports = connectToMongo;
