const mongoose = require("mongoose");
require('dotenv').config()

const connectDB = async () => {
  // console.log(typeof process.env.MONGO_URL)
    try{
       const conn = await mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
       })

       console.log(`mongoDB Connected: ${conn.connection.host}`.cyan.underline);
    }catch(error){
      console.log(`Error: ${error.message}`.red.bold);
      process.exit();
    }
}

module.exports = connectDB;